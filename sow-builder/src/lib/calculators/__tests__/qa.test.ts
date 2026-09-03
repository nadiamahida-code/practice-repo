import { describe, expect, it } from "vitest";
import { calculateQaLineItem, computeQa } from "../qa";

// Fixture from Sow Calcs 8.26.26.xlsx, "QA" sheet, row 32 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "QA Program Setup (EXAMPLE)", totalWorkspaces: 2, totalScorecards: 2 };

describe("calculateQaLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateQaLineItem(EXAMPLE_INPUT);
    expect(result.baselineHours).toBe(15);
    expect(result.addonHours).toBe(0);
    expect(result.totalHours).toBe(15);
  });

  it("adds hours for workspaces/scorecards beyond the included allowance", () => {
    const result = calculateQaLineItem({ scopeName: "x", totalWorkspaces: 4, totalScorecards: 5 });
    expect(result.addonHours).toBe(2 * 1 + 3 * 1);
  });
});

describe("computeQa", () => {
  it("matches the sheet's Section 3 result with no PM hours applied", () => {
    const { result } = computeQa([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(15);
    expect(result.pmHours).toBe(0);
    expect(result.finalHours).toBe(15);
    expect(result.finalCost).toBeCloseTo(3870, 1);
  });
});
