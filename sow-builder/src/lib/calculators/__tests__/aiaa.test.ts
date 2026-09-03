import { describe, expect, it } from "vitest";
import { calculateAiaaLineItem, computeAiaa } from "../aiaa";

// Fixture from Sow Calcs 8.26.26.xlsx, "AIAA" sheet, row 34 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "AIAA Rollout (EXAMPLE)", apiConnectionCount: 2, useCaseCount: 3 };

describe("calculateAiaaLineItem", () => {
  it("matches the sheet's worked example row (under the 40h PM threshold)", () => {
    const result = calculateAiaaLineItem(EXAMPLE_INPUT);
    expect(result.baselineHours).toBe(26);
    expect(result.addonHours).toBe(0);
    expect(result.pmHours).toBe(0);
    expect(result.totalHours).toBe(26);
  });

  it("adds PM hours once baseline+addon exceeds the 40h threshold", () => {
    // 26 baseline + 6 extra use cases * 3 = 44, which is > 40
    const result = calculateAiaaLineItem({ ...EXAMPLE_INPUT, useCaseCount: 9 });
    expect(result.addonHours).toBe(18);
    expect(result.pmHours).toBeCloseTo(44 * 0.35);
    expect(result.totalHours).toBeCloseTo(44 * 1.35);
  });

  it("charges nothing for connections/use cases within the included allowance", () => {
    const result = calculateAiaaLineItem({ ...EXAMPLE_INPUT, apiConnectionCount: 1, useCaseCount: 2 });
    expect(result.addonHours).toBe(0);
  });
});

describe("computeAiaa", () => {
  it("matches the sheet's Section 3 result: no additional PM step, just the timeline multiplier", () => {
    const { result } = computeAiaa([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(26);
    expect(result.pmHours).toBe(0);
    expect(result.finalHours).toBe(26);
    expect(result.finalCost).toBeCloseTo(6708, 1);
  });
});
