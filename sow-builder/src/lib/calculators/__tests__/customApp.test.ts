import { describe, expect, it } from "vitest";
import { calculateCustomAppLineItem, computeCustomApp } from "../customApp";

// Fixture from Sow Calcs 8.26.26.xlsx, "Custom App" sheet, row 48 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  appName: "Jira Sync Integration (EXAMPLE)",
  fieldCount: 20,
  fieldOptionCount: 30,
  attachmentSync: false,
  callsExternalApi: false,
  appType: "Read-only sidebar app (display only)" as const,
};

describe("calculateCustomAppLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateCustomAppLineItem(EXAMPLE_INPUT);
    expect(result.designHours).toBeCloseTo(16.5);
    expect(result.buildHours).toBeCloseTo(17.775);
    expect(result.qaHours).toBe(11);
    expect(result.trainingHours).toBe(5);
    expect(result.totalHours).toBeCloseTo(50.94166667, 5);
    expect(result.totalCost).toBeCloseTo(13142.95, 1);
  });

  it("applies the external API multiplier to design, build, and QA but not training", () => {
    const withApi = calculateCustomAppLineItem({ ...EXAMPLE_INPUT, callsExternalApi: true });
    const withoutApi = calculateCustomAppLineItem(EXAMPLE_INPUT);
    expect(withApi.designHours).toBeCloseTo(withoutApi.designHours * 1.3);
    expect(withApi.buildHours).toBeCloseTo(withoutApi.buildHours * 1.3);
    expect(withApi.qaHours).toBeCloseTo(withoutApi.qaHours * 1.3);
    expect(withApi.trainingHours).toBe(withoutApi.trainingHours);
  });

  it("applies the app-type multiplier to design/build but not QA", () => {
    const combined = calculateCustomAppLineItem({ ...EXAMPLE_INPUT, appType: "Combined sidebar UI + backend integration" });
    const readOnly = calculateCustomAppLineItem(EXAMPLE_INPUT);
    // 0.75 -> 1.3 multiplier ratio
    expect(combined.designHours).toBeCloseTo((readOnly.designHours / 0.75) * 1.3);
    expect(combined.qaHours).toBe(readOnly.qaHours);
  });

  it("adds flat attachment-sync hours to design/build/QA", () => {
    const result = calculateCustomAppLineItem({ ...EXAMPLE_INPUT, attachmentSync: true });
    const base = calculateCustomAppLineItem(EXAMPLE_INPUT);
    expect(result.designHours).toBeCloseTo(base.designHours + 6 * 0.75);
    expect(result.buildHours).toBeCloseTo(base.buildHours + 8 * 0.75);
    expect(result.qaHours).toBeCloseTo(base.qaHours + 2);
  });
});

describe("computeCustomApp", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result, effortBand } = computeCustomApp([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBeCloseTo(50.94166667, 5);
    expect(result.pmHours).toBeCloseTo(17.82958333, 5);
    expect(result.finalHours).toBeCloseTo(68.77125, 4);
    expect(result.finalCost).toBeCloseTo(17742.9825, 1);
    expect(effortBand).toBe("Low");
  });
});
