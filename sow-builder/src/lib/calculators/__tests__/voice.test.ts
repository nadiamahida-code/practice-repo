import { describe, expect, it } from "vitest";
import { calculateVoiceLineItem, computeVoice } from "../voice";

// Fixture from Sow Calcs 8.26.26.xlsx, "Voice" sheet, row 22 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  scopeName: "Voice OOB Setup (EXAMPLE)",
  phoneNumberCount: 2,
  ivrCount: 2,
  ivrComplexity: "Normal" as const,
};

describe("calculateVoiceLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateVoiceLineItem(EXAMPLE_INPUT);
    expect(result.discoveryHours).toBe(1.5);
    expect(result.configHours).toBe(3);
    expect(result.ivrHours).toBe(2);
    expect(result.trainingHours).toBe(7);
    expect(result.totalHours).toBe(13.5);
  });

  it("uses the High IVR complexity rate", () => {
    const result = calculateVoiceLineItem({ ...EXAMPLE_INPUT, ivrComplexity: "High" });
    expect(result.ivrHours).toBe(8);
  });
});

describe("computeVoice", () => {
  it("matches the sheet's Section 3 result with no PM hours applied", () => {
    const { result } = computeVoice([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(13.5);
    expect(result.pmHours).toBe(0);
    expect(result.finalHours).toBe(13.5);
    expect(result.finalCost).toBeCloseTo(3483, 1);
  });
});
