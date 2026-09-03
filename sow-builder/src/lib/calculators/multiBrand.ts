// Mirrors the "Multi Brand" sheet in Sow Calcs 8.26.26.xlsx.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const MULTI_BRAND_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B10, linked to 'Global Assumptions'!$B$6
  flatHoursIncluded: 5, // B12 — covers up to the included brand allowance
  brandsIncluded: 3, // B13
  hoursPerAdditionalBrand: 5, // B14
} as const;

export interface MultiBrandLineItemInput {
  scopeName: string;
  totalBrands: number;
}

export interface MultiBrandLineItemResult {
  additionalBrands: number; // column C
  totalHours: number; // column F
  totalCost: number; // column G
}

export function calculateMultiBrandLineItem(input: MultiBrandLineItemInput): MultiBrandLineItemResult {
  const rc = MULTI_BRAND_RATE_CARD;
  const additionalBrands = Math.max(0, input.totalBrands - rc.brandsIncluded);
  const totalHours = rc.flatHoursIncluded + additionalBrands * rc.hoursPerAdditionalBrand;
  const totalCost = totalHours * rc.hourlyRate;
  return { additionalBrands, totalHours, totalCost };
}

export function computeMultiBrand(
  lineItems: MultiBrandLineItemInput[],
  timeline: TimelineOption
): { lineResults: MultiBrandLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateMultiBrandLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: MULTI_BRAND_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
