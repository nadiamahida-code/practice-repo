import { describe, expect, it } from "vitest";
import { calculateSupportLineItem, computeSupport } from "../support";

// Fixture from Sow Calcs 8.26.26.xlsx, "Support" sheet, row 40 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  scopeName: "Support Implementation (EXAMPLE)",
  discoveryTier: "Standard" as const,
  groupCount: 3,
  businessRuleCount: 40,
  includeGuideOob: true,
  additionalActionFlows: 1,
};

describe("calculateSupportLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateSupportLineItem(EXAMPLE_INPUT);
    expect(result.discoveryHours).toBe(3);
    expect(result.businessRulesHours).toBe(20);
    expect(result.guideHours).toBe(10);
    expect(result.addonHours).toBe(4);
    expect(result.totalHours).toBe(37);
    expect(result.totalCost).toBe(9546);
  });

  it("adds extra discovery/config hours for groups beyond the included 3", () => {
    const result = calculateSupportLineItem({ ...EXAMPLE_INPUT, groupCount: 5 });
    // +2 groups * 2 hrs/group discovery, +2 groups * 3 hrs/group config
    expect(result.discoveryHours).toBe(3 + 2 * 2);
    expect(result.businessRulesHours).toBe(20 + 2 * 3);
  });

  it("uses the Higher discovery tier hours", () => {
    const result = calculateSupportLineItem({ ...EXAMPLE_INPUT, discoveryTier: "Higher" });
    expect(result.discoveryHours).toBe(6);
  });

  it("charges nothing for Guide when not included", () => {
    const result = calculateSupportLineItem({ ...EXAMPLE_INPUT, includeGuideOob: false });
    expect(result.guideHours).toBe(0);
  });

  it.each([
    [25, 15],
    [26, 20],
    [55, 20],
    [56, 30],
    [85, 30],
    [86, 35],
    [150, 35], // beyond 100 still falls back to the top tier
  ])("business rule tier boundary: %i rules -> %i hrs", (count, expected) => {
    const result = calculateSupportLineItem({ ...EXAMPLE_INPUT, businessRuleCount: count });
    expect(result.businessRulesHours).toBe(expected);
  });
});

describe("computeSupport", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeSupport([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(37);
    expect(result.pmHours).toBeCloseTo(12.95);
    expect(result.finalHours).toBeCloseTo(49.95);
    expect(result.finalCost).toBeCloseTo(12887.1, 1);
  });
});
