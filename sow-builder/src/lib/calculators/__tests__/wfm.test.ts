import { describe, expect, it } from "vitest";
import { calculateWfmLineItem, computeWfm } from "../wfm";

// Fixture from Sow Calcs 8.26.26.xlsx, "WFM" sheet, row 28 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "WFM Rollout (EXAMPLE)", totalWorkstreams: 4, agentTeamCount: 1 };

describe("calculateWfmLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateWfmLineItem(EXAMPLE_INPUT);
    expect(result.baselineHours).toBe(22.5);
    expect(result.addonHours).toBe(0);
    expect(result.totalHours).toBe(22.5);
  });

  it("scales discovery and config hours with agent team count", () => {
    const result = calculateWfmLineItem({ ...EXAMPLE_INPUT, agentTeamCount: 3 });
    expect(result.baselineHours).toBe(6 + 3 * 1.5 + 6 + 3 * 1 + 6 + 2);
  });

  it("adds hours for workstreams beyond the included allowance", () => {
    const result = calculateWfmLineItem({ ...EXAMPLE_INPUT, totalWorkstreams: 6 });
    expect(result.addonHours).toBe(4);
  });
});

describe("computeWfm", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeWfm([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(22.5);
    expect(result.pmHours).toBeCloseTo(7.875);
    expect(result.finalHours).toBeCloseTo(30.375);
    expect(result.finalCost).toBeCloseTo(7836.75, 1);
  });
});
