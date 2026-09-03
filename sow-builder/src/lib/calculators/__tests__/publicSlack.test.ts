import { describe, expect, it } from "vitest";
import { calculatePublicSlackLineItem, computePublicSlack } from "../publicSlack";

// Fixture from Sow Calcs 8.26.26.xlsx, "Public Slack" sheet, row 16 (the EXAMPLE row).
const EXAMPLE_INPUT = { projectName: "Client Rollout (EXAMPLE)", projectPmAndConsultantHours: 120 };

describe("calculatePublicSlackLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculatePublicSlackLineItem(EXAMPLE_INPUT);
    expect(result.hours).toBeCloseTo(9.6);
    expect(result.cost).toBeCloseTo(2476.8, 1);
  });
});

describe("computePublicSlack", () => {
  it("sums hours and cost with no PM step or timeline multiplier", () => {
    const result = computePublicSlack([EXAMPLE_INPUT]);
    expect(result.totalHours).toBeCloseTo(9.6);
    expect(result.totalCost).toBeCloseTo(2476.8, 1);
  });
});
