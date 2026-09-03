// Mirrors the "AI Copilot" sheet in Sow Calcs 8.26.26.xlsx.
// Two tiers: Tier 1 = turn on features only (no PM), Tier 2 = fuller setup
// (flat hrs TOTAL, inclusive of Tier 1 — not additive). Unlike most modules,
// PM here is computed PER ROW (Tier 2 only) rather than once on the module
// total, so Section 3 just applies the timeline multiplier with no further
// PM step — see rollUpResult's pmExempt usage in computeAiCopilot below.

import { DEFAULT_HOURLY_RATE, STANDARD_PM_PERCENT, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const AI_COPILOT_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B11, linked to 'Global Assumptions'!$B$6
  tier1FlatHours: 5, // B13 — turning on features & overview, no PM
  tier2FlatHoursTotal: 15, // B14 — TOTAL for the full tier, inclusive of Tier 1
} as const;

export type AiCopilotTier = "Tier 1 — Enable only" | "Tier 2 — Enable + procedures/config";

export interface AiCopilotLineItemInput {
  scopeName: string;
  tier: AiCopilotTier;
}

export interface AiCopilotLineItemResult {
  hours: number; // column F
  pmHours: number; // column G — only nonzero for Tier 2
  totalHours: number; // column H
}

export function calculateAiCopilotLineItem(input: AiCopilotLineItemInput): AiCopilotLineItemResult {
  const rc = AI_COPILOT_RATE_CARD;
  const isTier2 = input.tier === "Tier 2 — Enable + procedures/config";

  const hours = isTier2 ? rc.tier2FlatHoursTotal : rc.tier1FlatHours;
  const pmHours = isTier2 ? hours * STANDARD_PM_PERCENT : 0;
  const totalHours = hours + pmHours;

  return { hours, pmHours, totalHours };
}

export function computeAiCopilot(
  lineItems: AiCopilotLineItemInput[],
  timeline: TimelineOption
): { lineResults: AiCopilotLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateAiCopilotLineItem);
  // Total already includes per-row PM, so pmExempt:true keeps Section 3 from adding it again.
  const totalHoursIncludingPm = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursIncludingPm, timeline, {
    hourlyRate: AI_COPILOT_RATE_CARD.hourlyRate,
    pmExempt: true,
  });
  return { lineResults, result };
}
