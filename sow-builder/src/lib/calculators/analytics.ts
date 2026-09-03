// Mirrors the "Analytics" (Explore) sheet in Sow Calcs 8.26.26.xlsx.
// Enter TOTAL counts for dashboards/reports/metrics; the baseline allowance
// is netted out automatically.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const ANALYTICS_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B14, linked to 'Global Assumptions'!$B$6
  baselineFlatHours: 10, // B17 — up to 1 dashboard, 5 reports, 3 custom metrics
  dashboardsIncluded: 1,
  reportsIncluded: 5,
  metricsIncluded: 3,
  hoursPerAdditionalDashboard: 2.5, // B20
  hoursPerAdditionalReport: 1.5, // B21
  hoursPerAdditionalMetric: 2, // B22
  trainingSessionFlatHours: 2, // B25
  requirementsReviewFlatHours: 1, // B28 — once per scope
} as const;

export interface AnalyticsLineItemInput {
  scopeName: string;
  totalDashboards: number;
  totalReports: number;
  totalMetrics: number;
  includeTraining: boolean;
}

export interface AnalyticsLineItemResult {
  baselineAndAddonHours: number; // column F
  requirementsMeetingHours: number; // column G
  totalHours: number; // column H
}

export function calculateAnalyticsLineItem(input: AnalyticsLineItemInput): AnalyticsLineItemResult {
  const rc = ANALYTICS_RATE_CARD;

  const baselineAndAddonHours =
    rc.baselineFlatHours +
    Math.max(0, input.totalDashboards - rc.dashboardsIncluded) * rc.hoursPerAdditionalDashboard +
    Math.max(0, input.totalReports - rc.reportsIncluded) * rc.hoursPerAdditionalReport +
    Math.max(0, input.totalMetrics - rc.metricsIncluded) * rc.hoursPerAdditionalMetric +
    (input.includeTraining ? rc.trainingSessionFlatHours : 0);

  const requirementsMeetingHours = rc.requirementsReviewFlatHours;
  const totalHours = baselineAndAddonHours + requirementsMeetingHours;

  return { baselineAndAddonHours, requirementsMeetingHours, totalHours };
}

export function computeAnalytics(
  lineItems: AnalyticsLineItemInput[],
  timeline: TimelineOption
): { lineResults: AnalyticsLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateAnalyticsLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: ANALYTICS_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
