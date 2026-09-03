// Mirrors the "Custom App" sheet in Sow Calcs 8.26.26.xlsx.
// Custom Zendesk apps/integrations — sidebar apps, ticket-sidebar widgets,
// and backend integrations. NOT custom objects or data migration — see
// customObjects.ts and migration.ts.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";
import type { EffortBand } from "./types";

export const CUSTOM_APP_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B11, linked to 'Global Assumptions'!$B$6
  projectLevelFlatHours: 10, // B14 — split evenly across rows, divided by 15 per row
  projectLevelRowDivisor: 15,
  designBaseHoursPerApp: 9, // B17
  designHoursPerField: 0.5, // B18
  designHoursPerFieldOption: 0.1, // B19
  designAttachmentSyncFlatHours: 6, // B20
  buildBaseHoursPerApp: 6, // B23
  buildHoursPerField: 0.66, // B24
  buildHoursPerFieldOption: 0.15, // B25
  buildAttachmentSyncFlatHours: 8, // B26
  externalApiMultiplier: 1.3, // B29 — applied to Design + Build + QA hours
  appTypeMultiplierReadOnlySidebar: 0.75, // B32
  appTypeMultiplierWriteBackSidebar: 1.0, // B33
  appTypeMultiplierBackendIntegration: 1.0, // B34
  appTypeMultiplierCombined: 1.3, // B35
  qaBaseHoursPerApp: 7, // B38
  qaHoursPerField: 0.2, // B39
  qaAttachmentSyncFlatHours: 2, // B40
  trainingFlatHoursPerApp: 5, // B43
} as const;

export type CustomAppType =
  | "Read-only sidebar app (display only)"
  | "Sidebar app with write-back actions"
  | "Backend integration (e.g. Envoy Connect, no UI)"
  | "Combined sidebar UI + backend integration";

export interface CustomAppLineItemInput {
  appName: string;
  fieldCount: number;
  fieldOptionCount: number;
  attachmentSync: boolean;
  callsExternalApi: boolean;
  appType: CustomAppType;
}

export interface CustomAppLineItemResult {
  designHours: number; // column H
  buildHours: number; // column I
  qaHours: number; // column J
  trainingHours: number; // column K
  totalHours: number; // column M
  totalCost: number; // column N
}

function appTypeMultiplierFor(appType: CustomAppType): number {
  const rc = CUSTOM_APP_RATE_CARD;
  if (appType === "Read-only sidebar app (display only)") return rc.appTypeMultiplierReadOnlySidebar;
  if (appType === "Sidebar app with write-back actions") return rc.appTypeMultiplierWriteBackSidebar;
  if (appType === "Combined sidebar UI + backend integration") return rc.appTypeMultiplierCombined;
  return rc.appTypeMultiplierBackendIntegration;
}

export function calculateCustomAppLineItem(input: CustomAppLineItemInput): CustomAppLineItemResult {
  const rc = CUSTOM_APP_RATE_CARD;
  const apiMultiplier = input.callsExternalApi ? rc.externalApiMultiplier : 1;
  const appTypeMultiplier = appTypeMultiplierFor(input.appType);

  const designHours =
    (rc.designBaseHoursPerApp +
      input.fieldCount * rc.designHoursPerField +
      input.fieldOptionCount * rc.designHoursPerFieldOption +
      (input.attachmentSync ? rc.designAttachmentSyncFlatHours : 0)) *
    apiMultiplier *
    appTypeMultiplier;

  const buildHours =
    (rc.buildBaseHoursPerApp +
      input.fieldCount * rc.buildHoursPerField +
      input.fieldOptionCount * rc.buildHoursPerFieldOption +
      (input.attachmentSync ? rc.buildAttachmentSyncFlatHours : 0)) *
    apiMultiplier *
    appTypeMultiplier;

  // QA carries the external-API multiplier but NOT the app-type multiplier.
  const qaHours =
    (rc.qaBaseHoursPerApp + input.fieldCount * rc.qaHoursPerField + (input.attachmentSync ? rc.qaAttachmentSyncFlatHours : 0)) *
    apiMultiplier;

  const trainingHours = rc.trainingFlatHoursPerApp;

  const totalHours = designHours + buildHours + qaHours + trainingHours + rc.projectLevelFlatHours / rc.projectLevelRowDivisor;
  const totalCost = totalHours * rc.hourlyRate;

  return { designHours, buildHours, qaHours, trainingHours, totalHours, totalCost };
}

function effortBandFor(totalHours: number): EffortBand {
  if (totalHours < 60) return "Low";
  if (totalHours <= 120) return "Mid";
  return "High";
}

export function computeCustomApp(
  lineItems: CustomAppLineItemInput[],
  timeline: TimelineOption
): { lineResults: CustomAppLineItemResult[]; result: ModuleResult; effortBand: EffortBand | null } {
  const lineResults = lineItems.map(calculateCustomAppLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: CUSTOM_APP_RATE_CARD.hourlyRate });

  const effortBand = lineItems.length === 0 ? null : effortBandFor(totalHoursPreP);

  return { lineResults, result, effortBand };
}
