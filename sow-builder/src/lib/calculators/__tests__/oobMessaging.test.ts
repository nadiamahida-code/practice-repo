import { describe, expect, it } from "vitest";
import { calculateOobMessagingLineItem, computeOobMessaging } from "../oobMessaging";

// Fixture from Sow Calcs 8.26.26.xlsx, "OOB Messaging" sheet, row 21 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  scopeName: "Messaging Setup (EXAMPLE)",
  messagingWidgetCount: 1,
  otherChannelWidgetCount: 1,
  needsTaGuidance: false,
};

describe("calculateOobMessagingLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateOobMessagingLineItem(EXAMPLE_INPUT);
    expect(result.widgetHours).toBe(12);
    expect(result.taHours).toBe(0);
    expect(result.totalHours).toBe(12);
  });

  it("charges nothing for a widget type with zero widgets", () => {
    const result = calculateOobMessagingLineItem({ ...EXAMPLE_INPUT, otherChannelWidgetCount: 0 });
    expect(result.widgetHours).toBe(6);
  });

  it("adds additional-widget hours beyond the first, per type", () => {
    const result = calculateOobMessagingLineItem({ ...EXAMPLE_INPUT, messagingWidgetCount: 3 });
    expect(result.widgetHours).toBe(6 + 2 * 2 + 6);
  });

  it("adds the TA guidance add-on when requested", () => {
    const result = calculateOobMessagingLineItem({ ...EXAMPLE_INPUT, needsTaGuidance: true });
    expect(result.taHours).toBe(5);
    expect(result.totalHours).toBe(17);
  });
});

describe("computeOobMessaging", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result } = computeOobMessaging([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBe(12);
    expect(result.pmHours).toBeCloseTo(4.2);
    expect(result.finalHours).toBeCloseTo(16.2);
    expect(result.finalCost).toBeCloseTo(4179.6, 1);
  });
});
