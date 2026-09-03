import { describe, expect, it } from "vitest";
import { calculateDcLineItem, computeDc } from "../dc";

// Fixture from Sow Calcs 8.26.26.xlsx, "DC" sheet, row 27 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "Macro Translation (EXAMPLE)", customItemCount: 60, languageCount: 3 };

describe("calculateDcLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateDcLineItem(EXAMPLE_INPUT);
    expect(result.tier).toBe("Mid");
    expect(result.baseHours).toBe(10);
    expect(result.totalHours).toBe(15);
    expect(result.totalCost).toBe(3870);
  });

  it("uses Low tier at or under 40 items", () => {
    const result = calculateDcLineItem({ ...EXAMPLE_INPUT, customItemCount: 40 });
    expect(result.tier).toBe("Low");
    expect(result.totalHours).toBe(10); // base hrs, no multiplier
  });

  it("uses High tier above 85 items, cascading both multipliers", () => {
    const result = calculateDcLineItem({ ...EXAMPLE_INPUT, customItemCount: 86 });
    expect(result.tier).toBe("High");
    expect(result.totalHours).toBeCloseTo(10 * 1.5 * 1.25);
  });

  it("uses the 5+ languages base hours at exactly 5 languages", () => {
    const result = calculateDcLineItem({ ...EXAMPLE_INPUT, languageCount: 5 });
    expect(result.baseHours).toBe(20);
  });

  it("uses the under-5-languages base hours below 5 languages", () => {
    const result = calculateDcLineItem({ ...EXAMPLE_INPUT, languageCount: 4 });
    expect(result.baseHours).toBe(10);
  });
});

describe("computeDc", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeDc([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(15);
    expect(result.pmHours).toBeCloseTo(5.25);
    expect(result.finalHours).toBeCloseTo(20.25);
    expect(result.finalCost).toBeCloseTo(5224.5, 1);
  });
});
