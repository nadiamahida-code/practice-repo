import { describe, expect, it } from "vitest";
import { calculateMultiBrandLineItem, computeMultiBrand } from "../multiBrand";

// Fixture from Sow Calcs 8.26.26.xlsx, "Multi Brand" sheet, row 19 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "Multi-Brand Setup (EXAMPLE)", totalBrands: 5 };

describe("calculateMultiBrandLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateMultiBrandLineItem(EXAMPLE_INPUT);
    expect(result.additionalBrands).toBe(2);
    expect(result.totalHours).toBe(15);
    expect(result.totalCost).toBe(3870);
  });

  it("charges nothing beyond the flat allowance for 3 or fewer brands", () => {
    const result = calculateMultiBrandLineItem({ scopeName: "x", totalBrands: 3 });
    expect(result.additionalBrands).toBe(0);
    expect(result.totalHours).toBe(5);
  });

  it("never goes negative for brand counts under the included allowance", () => {
    const result = calculateMultiBrandLineItem({ scopeName: "x", totalBrands: 1 });
    expect(result.additionalBrands).toBe(0);
  });
});

describe("computeMultiBrand", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeMultiBrand([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(15);
    expect(result.pmHours).toBeCloseTo(5.25);
    expect(result.finalHours).toBeCloseTo(20.25);
    expect(result.finalCost).toBeCloseTo(5224.5, 1);
  });
});
