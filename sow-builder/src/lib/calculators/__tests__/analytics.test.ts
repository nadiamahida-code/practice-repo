import { describe, expect, it } from "vitest";
import { calculateAnalyticsLineItem, computeAnalytics } from "../analytics";

// Fixture from Sow Calcs 8.26.26.xlsx, "Analytics" sheet, row 33 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  scopeName: "Explore Setup (EXAMPLE)",
  totalDashboards: 1,
  totalReports: 5,
  totalMetrics: 3,
  includeTraining: false,
};

describe("calculateAnalyticsLineItem", () => {
  it("matches the sheet's worked example row (exactly at the baseline allowance)", () => {
    const result = calculateAnalyticsLineItem(EXAMPLE_INPUT);
    expect(result.baselineAndAddonHours).toBe(10);
    expect(result.requirementsMeetingHours).toBe(1);
    expect(result.totalHours).toBe(11);
  });

  it("adds hours for units beyond the baseline allowance", () => {
    const result = calculateAnalyticsLineItem({ ...EXAMPLE_INPUT, totalDashboards: 3, totalReports: 7, totalMetrics: 5 });
    expect(result.baselineAndAddonHours).toBe(10 + 2 * 2.5 + 2 * 1.5 + 2 * 2);
  });

  it("adds the training session hours when requested", () => {
    const result = calculateAnalyticsLineItem({ ...EXAMPLE_INPUT, includeTraining: true });
    expect(result.baselineAndAddonHours).toBe(12);
  });
});

describe("computeAnalytics", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeAnalytics([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(11);
    expect(result.pmHours).toBeCloseTo(3.85);
    expect(result.finalHours).toBeCloseTo(14.85);
    expect(result.finalCost).toBeCloseTo(3831.3, 1);
  });
});
