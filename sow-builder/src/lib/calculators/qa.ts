// Mirrors the "QA" sheet in Sow Calcs 8.26.26.xlsx. No PM is applied on this
// tab per the original rate card note.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const QA_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B10, linked to 'Global Assumptions'!$B$6
  // Baseline components (B13-B19), sum to 20 hrs flat, included in every scope.
  discoveryHours: 5, // B13
  scorecardRatingCategoriesHours: 1, // B14
  autoQaHours: 1, // B15
  spotlightReviewWorkflowsHours: 1, // B16
  calibrationCoachingHours: 1, // B17
  dashboardsHours: 2, // B18
  configHours: 4, // B19
  workspacesIncluded: 2, // B22
  scorecardsIncluded: 2, // B23
  hoursPerAdditionalWorkspace: 1, // B26
  hoursPerAdditionalScorecard: 1, // B27
} as const;

export interface QaLineItemInput {
  scopeName: string;
  totalWorkspaces: number;
  totalScorecards: number;
}

export interface QaLineItemResult {
  baselineHours: number; // column D
  addonHours: number; // column E
  totalHours: number; // column H
}

export function calculateQaLineItem(input: QaLineItemInput): QaLineItemResult {
  const rc = QA_RATE_CARD;

  const baselineHours =
    rc.discoveryHours +
    rc.scorecardRatingCategoriesHours +
    rc.autoQaHours +
    rc.spotlightReviewWorkflowsHours +
    rc.calibrationCoachingHours +
    rc.dashboardsHours +
    rc.configHours;

  const addonHours =
    Math.max(0, input.totalWorkspaces - rc.workspacesIncluded) * rc.hoursPerAdditionalWorkspace +
    Math.max(0, input.totalScorecards - rc.scorecardsIncluded) * rc.hoursPerAdditionalScorecard;

  const totalHours = baselineHours + addonHours;

  return { baselineHours, addonHours, totalHours };
}

// No PM applied on this tab (pmExempt: true).
export function computeQa(
  lineItems: QaLineItemInput[],
  timeline: TimelineOption
): { lineResults: QaLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateQaLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, {
    hourlyRate: QA_RATE_CARD.hourlyRate,
    pmExempt: true,
  });
  return { lineResults, result };
}
