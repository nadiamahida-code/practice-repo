// Mirrors the "AIAA" (AI Agents / Advanced Automation) sheet in Sow Calcs 8.26.26.xlsx.
// PM is only added, per row, when a row's baseline+add-on hours exceed the
// 40-hour threshold — Section 3 then just applies the timeline multiplier,
// same per-row-PM pattern as aiCopilot.ts.

import { DEFAULT_HOURLY_RATE, STANDARD_PM_PERCENT, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const AIAA_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B12, linked to 'Global Assumptions'!$B$6
  connectSourcesDiscoveryHours: 8, // B15
  buildUpToThreeUseCasesHours: 8, // B16
  zdSupportRoutingHours: 5, // B17
  taGuidanceHours: 5, // B18
  apiConnectionsIncluded: 2, // B21
  useCasesIncluded: 3, // B22
  hoursPerAdditionalApiConnection: 3, // B25
  hoursPerAdditionalUseCase: 3, // B26
  pmRequiredHourThreshold: 40, // B29
} as const;

export interface AiaaLineItemInput {
  scopeName: string;
  apiConnectionCount: number;
  useCaseCount: number;
}

export interface AiaaLineItemResult {
  baselineHours: number; // column D
  addonHours: number; // column E
  pmHours: number; // column F
  totalHours: number; // column H
}

export function calculateAiaaLineItem(input: AiaaLineItemInput): AiaaLineItemResult {
  const rc = AIAA_RATE_CARD;

  const baselineHours =
    rc.connectSourcesDiscoveryHours + rc.buildUpToThreeUseCasesHours + rc.zdSupportRoutingHours + rc.taGuidanceHours;

  const addonHours =
    Math.max(0, input.apiConnectionCount - rc.apiConnectionsIncluded) * rc.hoursPerAdditionalApiConnection +
    Math.max(0, input.useCaseCount - rc.useCasesIncluded) * rc.hoursPerAdditionalUseCase;

  const preHours = baselineHours + addonHours;
  const pmHours = preHours > rc.pmRequiredHourThreshold ? preHours * STANDARD_PM_PERCENT : 0;
  const totalHours = preHours + pmHours;

  return { baselineHours, addonHours, pmHours, totalHours };
}

export function computeAiaa(
  lineItems: AiaaLineItemInput[],
  timeline: TimelineOption
): { lineResults: AiaaLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateAiaaLineItem);
  // Total already includes per-row PM, so pmExempt:true keeps Section 3 from adding it again.
  const totalHoursIncludingPm = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursIncludingPm, timeline, {
    hourlyRate: AIAA_RATE_CARD.hourlyRate,
    pmExempt: true,
  });
  return { lineResults, result };
}
