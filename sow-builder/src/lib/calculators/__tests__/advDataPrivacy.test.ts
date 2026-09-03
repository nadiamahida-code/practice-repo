import { describe, expect, it } from "vitest";
import { calculateAdvDataPrivacyLineItem, computeAdvDataPrivacy } from "../advDataPrivacy";

// Fixture from Sow Calcs 8.26.26.xlsx, "Adv Data Privacy" sheet, row 26 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "ADPP Rollout (EXAMPLE)", engagementType: "Full Implementation" as const };

describe("calculateAdvDataPrivacyLineItem", () => {
  it("matches the sheet's worked example row (Full Implementation)", () => {
    const result = calculateAdvDataPrivacyLineItem(EXAMPLE_INPUT);
    expect(result.totalHours).toBe(24.5);
  });

  it("uses the flat Feature Review hours", () => {
    const result = calculateAdvDataPrivacyLineItem({ ...EXAMPLE_INPUT, engagementType: "Feature Review" });
    expect(result.totalHours).toBe(2);
  });
});

describe("computeAdvDataPrivacy", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeAdvDataPrivacy([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(24.5);
    expect(result.pmHours).toBeCloseTo(8.575);
    expect(result.finalHours).toBeCloseTo(33.075);
    expect(result.finalCost).toBeCloseTo(8533.35, 1);
  });
});
