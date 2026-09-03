import { describe, expect, it } from "vitest";
import { calculateAiCopilotLineItem, computeAiCopilot } from "../aiCopilot";

// Fixture from Sow Calcs 8.26.26.xlsx, "AI Copilot" sheet, row 19 (the EXAMPLE row).
const EXAMPLE_INPUT = { scopeName: "AI Copilot Rollout (EXAMPLE)", tier: "Tier 1 — Enable only" as const };

describe("calculateAiCopilotLineItem", () => {
  it("matches the sheet's worked example row (Tier 1, no PM)", () => {
    const result = calculateAiCopilotLineItem(EXAMPLE_INPUT);
    expect(result.hours).toBe(5);
    expect(result.pmHours).toBe(0);
    expect(result.totalHours).toBe(5);
  });

  it("Tier 2 hours are the flat total, not additive on top of Tier 1, and carry PM", () => {
    const result = calculateAiCopilotLineItem({ ...EXAMPLE_INPUT, tier: "Tier 2 — Enable + procedures/config" });
    expect(result.hours).toBe(15);
    expect(result.pmHours).toBeCloseTo(5.25);
    expect(result.totalHours).toBeCloseTo(20.25);
  });
});

describe("computeAiCopilot", () => {
  it("matches the sheet's Section 3 result: no additional PM step, just the timeline multiplier", () => {
    const { result } = computeAiCopilot([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(5);
    expect(result.pmHours).toBe(0);
    expect(result.finalHours).toBe(5);
    expect(result.finalCost).toBeCloseTo(1290, 1);
  });
});
