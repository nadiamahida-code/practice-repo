// Mirrors the "custom objects" sheet in Sow Calcs 8.26.26.xlsx.
// Zendesk Custom Object scope: data model design, build, object-facing UI
// (sidebar app or admin CRUD UI), and migration of data into the objects.
// Does NOT cover integrations/middleware — see customApp.ts and migration.ts.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";
import type { EffortBand } from "./types";

export const CUSTOM_OBJECTS_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B13, linked to 'Global Assumptions'!$B$6
  designBaseHoursPerObject: 2, // B16
  designHoursPerField: 0.15, // B17
  designHoursPerRelationshipField: 1, // B18
  buildBaseHoursPerObject: 3, // B21
  buildHoursPerField: 0.25, // B22
  buildHoursPerRelationshipField: 2, // B23
  migrationFlatHoursPerObject: 8, // B26 — only applied if migration needed
  uiNoneBaseHours: 0, // B29
  uiNonePerScreenHours: 0, // B30
  uiReadOnlySidebarBaseHours: 24, // B31
  uiReadOnlySidebarPerScreenHours: 6, // B32
  uiAdminCrudBaseHours: 40, // B33
  uiAdminCrudPerScreenHours: 10, // B34
  qaPercentOfDesignBuildUi: 0.15, // B37
  docsFlatHoursPerProject: 4, // B38 — the sheet apportions this as B38/20 per row (capped at a
  // 20-row calculator), which under-counts the true flat 4hrs unless all 20 rows are filled.
  // Reproduced literally here for fidelity with the sheet; see calculateCustomObjectsLineItem.
  docsRowDivisor: 20,
} as const;

export type CustomObjectUiType = "None" | "Read-only sidebar" | "Admin CRUD UI";

export interface CustomObjectLineItemInput {
  objectName: string;
  fieldCount: number;
  relationshipFieldCount: number;
  migrationNeeded: boolean;
  uiType: CustomObjectUiType;
  uiScreenCount: number;
}

export interface CustomObjectLineItemResult {
  designHours: number; // column G
  buildHours: number; // column H
  migrationHours: number; // column I
  uiHours: number; // column J
  qaHours: number; // column K
  docsHours: number; // column L
  totalHours: number; // column M
  totalCost: number; // column N
}

export function calculateCustomObjectsLineItem(input: CustomObjectLineItemInput): CustomObjectLineItemResult {
  const rc = CUSTOM_OBJECTS_RATE_CARD;

  const designHours =
    rc.designBaseHoursPerObject + input.fieldCount * rc.designHoursPerField + input.relationshipFieldCount * rc.designHoursPerRelationshipField;

  const buildHours =
    rc.buildBaseHoursPerObject + input.fieldCount * rc.buildHoursPerField + input.relationshipFieldCount * rc.buildHoursPerRelationshipField;

  const migrationHours = input.migrationNeeded ? rc.migrationFlatHoursPerObject : 0;

  const uiHours =
    input.uiType === "Read-only sidebar"
      ? rc.uiReadOnlySidebarBaseHours + input.uiScreenCount * rc.uiReadOnlySidebarPerScreenHours
      : input.uiType === "Admin CRUD UI"
        ? rc.uiAdminCrudBaseHours + input.uiScreenCount * rc.uiAdminCrudPerScreenHours
        : rc.uiNoneBaseHours + input.uiScreenCount * rc.uiNonePerScreenHours;

  const qaHours = (designHours + buildHours + uiHours) * rc.qaPercentOfDesignBuildUi;
  const docsHours = rc.docsFlatHoursPerProject / rc.docsRowDivisor;
  const totalHours = designHours + buildHours + migrationHours + uiHours + qaHours + docsHours;
  const totalCost = totalHours * rc.hourlyRate;

  return { designHours, buildHours, migrationHours, uiHours, qaHours, docsHours, totalHours, totalCost };
}

function effortBandFor(objectCount: number, totalFields: number, totalRelationshipFields: number): EffortBand {
  if (objectCount <= 1 && totalFields < 25 && totalRelationshipFields === 0) return "Low";
  if (objectCount <= 2 && totalFields <= 100) return "Mid";
  return "High";
}

export function computeCustomObjects(
  lineItems: CustomObjectLineItemInput[],
  timeline: TimelineOption
): { lineResults: CustomObjectLineItemResult[]; result: ModuleResult; effortBand: EffortBand | null } {
  const lineResults = lineItems.map(calculateCustomObjectsLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: CUSTOM_OBJECTS_RATE_CARD.hourlyRate });

  const totalFields = lineItems.reduce((sum, i) => sum + i.fieldCount, 0);
  const totalRelationshipFields = lineItems.reduce((sum, i) => sum + i.relationshipFieldCount, 0);
  const effortBand = lineItems.length === 0 ? null : effortBandFor(lineItems.length, totalFields, totalRelationshipFields);

  return { lineResults, result, effortBand };
}
