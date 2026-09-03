// Mirrors the "Voice" sheet in Sow Calcs 8.26.26.xlsx.
// Out-of-the-box Zendesk Talk setup. No PM is applied on this tab per the
// original rate card note.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const VOICE_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B11, linked to 'Global Assumptions'!$B$6
  discoveryFlatHours: 1.5, // B13
  hoursPerPhoneNumber: 1.5, // B14
  hoursPerIvrNormal: 1, // B15
  hoursPerIvrHigh: 4, // B16
  trainingDocsTestingFlatHours: 7, // B17
} as const;

export type IvrComplexity = "Normal" | "High";

export interface VoiceLineItemInput {
  scopeName: string;
  phoneNumberCount: number;
  ivrCount: number;
  ivrComplexity: IvrComplexity;
}

export interface VoiceLineItemResult {
  discoveryHours: number; // column E
  configHours: number; // column F
  ivrHours: number; // column G
  trainingHours: number; // column H
  totalHours: number; // column I
}

export function calculateVoiceLineItem(input: VoiceLineItemInput): VoiceLineItemResult {
  const rc = VOICE_RATE_CARD;
  const discoveryHours = rc.discoveryFlatHours;
  const configHours = input.phoneNumberCount * rc.hoursPerPhoneNumber;
  const ivrHours = input.ivrCount * (input.ivrComplexity === "High" ? rc.hoursPerIvrHigh : rc.hoursPerIvrNormal);
  const trainingHours = rc.trainingDocsTestingFlatHours;
  const totalHours = discoveryHours + configHours + ivrHours + trainingHours;

  return { discoveryHours, configHours, ivrHours, trainingHours, totalHours };
}

// No PM applied on this tab (pmExempt: true).
export function computeVoice(
  lineItems: VoiceLineItemInput[],
  timeline: TimelineOption
): { lineResults: VoiceLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateVoiceLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, {
    hourlyRate: VOICE_RATE_CARD.hourlyRate,
    pmExempt: true,
  });
  return { lineResults, result };
}
