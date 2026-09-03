// Mirrors the "DC" (Dynamic Content) sheet in Sow Calcs 8.26.26.xlsx.
// Localization/translation setup for dynamic content items. Effort tiers
// cascade: Mid = Low base x 1.5, High = Mid base x 1.25.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const DC_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B9, linked to 'Global Assumptions'!$B$6
  lowTierMaxItems: 40, // B12
  midTierMaxItems: 85, // B13 — beyond this is High; beyond B14 (200) is fully custom scoping
  lowTierBaseHoursUnder5Languages: 10, // B17
  lowTierBaseHoursAt5PlusLanguages: 20, // B18
  midTierMultiplier: 1.5, // B21 — applied to the Low base
  highTierMultiplier: 1.25, // B22 — applied to the Mid base
} as const;

export type DcTier = "Low" | "Mid" | "High";

export interface DcLineItemInput {
  scopeName: string;
  customItemCount: number;
  languageCount: number;
}

export interface DcLineItemResult {
  tier: DcTier; // column D
  baseHours: number; // column E
  totalHours: number; // column F/H
  totalCost: number; // column I
}

function tierFor(customItemCount: number): DcTier {
  const rc = DC_RATE_CARD;
  if (customItemCount <= rc.lowTierMaxItems) return "Low";
  if (customItemCount <= rc.midTierMaxItems) return "Mid";
  return "High";
}

export function calculateDcLineItem(input: DcLineItemInput): DcLineItemResult {
  const rc = DC_RATE_CARD;
  const tier = tierFor(input.customItemCount);
  const baseHours =
    input.languageCount < 5 ? rc.lowTierBaseHoursUnder5Languages : rc.lowTierBaseHoursAt5PlusLanguages;

  const totalHours =
    tier === "Low" ? baseHours : tier === "Mid" ? baseHours * rc.midTierMultiplier : baseHours * rc.midTierMultiplier * rc.highTierMultiplier;

  const totalCost = totalHours * rc.hourlyRate;

  return { tier, baseHours, totalHours, totalCost };
}

export function computeDc(
  lineItems: DcLineItemInput[],
  timeline: TimelineOption
): { lineResults: DcLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateDcLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: DC_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
