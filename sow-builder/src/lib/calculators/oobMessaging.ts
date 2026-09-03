// Mirrors the "OOB Messaging" sheet in Sow Calcs 8.26.26.xlsx.
// Out-of-the-box messaging widget setup (web messaging + other channel
// widgets like WhatsApp/Facebook), per brand. Does not include AIAA (bot)
// setup — see aiaa.ts.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const OOB_MESSAGING_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B10, linked to 'Global Assumptions'!$B$6
  messagingWidgetFirstHours: 6, // B12
  messagingWidgetAdditionalHours: 2, // B13 — each beyond the first
  otherChannelWidgetFirstHours: 6, // B14
  otherChannelWidgetAdditionalHours: 2, // B15 — each beyond the first
  taGuidanceAddonHours: 5, // B16
} as const;

export interface OobMessagingLineItemInput {
  scopeName: string;
  messagingWidgetCount: number;
  otherChannelWidgetCount: number;
  needsTaGuidance: boolean;
}

export interface OobMessagingLineItemResult {
  widgetHours: number; // column F
  taHours: number; // column G
  totalHours: number; // column H
}

export function calculateOobMessagingLineItem(input: OobMessagingLineItemInput): OobMessagingLineItemResult {
  const rc = OOB_MESSAGING_RATE_CARD;

  const messagingHours =
    input.messagingWidgetCount > 0
      ? rc.messagingWidgetFirstHours + Math.max(0, input.messagingWidgetCount - 1) * rc.messagingWidgetAdditionalHours
      : 0;

  const otherChannelHours =
    input.otherChannelWidgetCount > 0
      ? rc.otherChannelWidgetFirstHours + Math.max(0, input.otherChannelWidgetCount - 1) * rc.otherChannelWidgetAdditionalHours
      : 0;

  const widgetHours = messagingHours + otherChannelHours;
  const taHours = input.needsTaGuidance ? rc.taGuidanceAddonHours : 0;
  const totalHours = widgetHours + taHours;

  return { widgetHours, taHours, totalHours };
}

export function computeOobMessaging(
  lineItems: OobMessagingLineItemInput[],
  timeline: TimelineOption
): { lineResults: OobMessagingLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateOobMessagingLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: OOB_MESSAGING_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
