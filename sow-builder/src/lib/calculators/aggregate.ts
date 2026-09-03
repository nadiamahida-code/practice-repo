// Combines several module line items into one SOW's totals — something the
// source workbook doesn't do (each sheet's Section 3 stands alone). Each
// line item is computed with its own timeline via a single-row call to its
// module's compute function; because PM% and the timeline multiplier are
// linear over the row total, summing single-row results equals a full batch
// call when every row shares one timeline, and is the only correct behavior
// when they don't.

import type { EffortBand, LineItem, ModuleId, SowState } from "./types";
import { computeAdvDataPrivacy, type AdvDataPrivacyLineItemInput } from "./advDataPrivacy";
import { calculateAiCopilotLineItem, computeAiCopilot, type AiCopilotLineItemInput } from "./aiCopilot";
import { calculateAiaaLineItem, computeAiaa, type AiaaLineItemInput } from "./aiaa";
import { calculateAnalyticsLineItem, computeAnalytics, type AnalyticsLineItemInput } from "./analytics";
import { calculateCustomAppLineItem, computeCustomApp, type CustomAppLineItemInput } from "./customApp";
import { calculateCustomObjectsLineItem, computeCustomObjects, type CustomObjectLineItemInput } from "./customObjects";
import { calculateDcLineItem, computeDc, type DcLineItemInput } from "./dc";
import { calculateMigrationLineItem, computeMigration, type MigrationLineItemInput } from "./migration";
import { computeMultiBrand, type MultiBrandLineItemInput } from "./multiBrand";
import { calculateOobMessagingLineItem, computeOobMessaging, type OobMessagingLineItemInput } from "./oobMessaging";
import { computePublicSlack, type PublicSlackLineItemInput } from "./publicSlack";
import { calculateQaLineItem, computeQa, type QaLineItemInput } from "./qa";
import { calculateSupportLineItem, computeSupport, type SupportLineItemInput } from "./support";
import { calculateVoiceLineItem, computeVoice, type VoiceLineItemInput } from "./voice";
import { calculateWfmLineItem, computeWfm, type WfmLineItemInput } from "./wfm";
import type { TimelineOption } from "./globalAssumptions";
import type { ModuleResult } from "./shared";

export interface LineItemTotals {
  hoursPreP: number;
  pmHours: number;
  finalHours: number;
  finalCost: number;
}

function fromModuleResult(result: ModuleResult): LineItemTotals {
  return { hoursPreP: result.totalHoursPreP, pmHours: result.pmHours, finalHours: result.finalHours, finalCost: result.finalCost };
}

export function computeLineItemTotals(item: LineItem): LineItemTotals {
  switch (item.moduleId) {
    case "support":
      return fromModuleResult(computeSupport([item.inputs as SupportLineItemInput], item.timeline).result);
    case "dc":
      return fromModuleResult(computeDc([item.inputs as DcLineItemInput], item.timeline).result);
    case "multiBrand":
      return fromModuleResult(computeMultiBrand([item.inputs as MultiBrandLineItemInput], item.timeline).result);
    case "voice":
      return fromModuleResult(computeVoice([item.inputs as VoiceLineItemInput], item.timeline).result);
    case "oobMessaging":
      return fromModuleResult(computeOobMessaging([item.inputs as OobMessagingLineItemInput], item.timeline).result);
    case "aiCopilot":
      return fromModuleResult(computeAiCopilot([item.inputs as AiCopilotLineItemInput], item.timeline).result);
    case "aiaa":
      return fromModuleResult(computeAiaa([item.inputs as AiaaLineItemInput], item.timeline).result);
    case "qa":
      return fromModuleResult(computeQa([item.inputs as QaLineItemInput], item.timeline).result);
    case "wfm":
      return fromModuleResult(computeWfm([item.inputs as WfmLineItemInput], item.timeline).result);
    case "advDataPrivacy":
      return fromModuleResult(computeAdvDataPrivacy([item.inputs as AdvDataPrivacyLineItemInput], item.timeline).result);
    case "customObjects":
      return fromModuleResult(computeCustomObjects([item.inputs as CustomObjectLineItemInput], item.timeline).result);
    case "migration":
      return fromModuleResult(computeMigration([item.inputs as MigrationLineItemInput], item.timeline).result);
    case "customApp":
      return fromModuleResult(computeCustomApp([item.inputs as CustomAppLineItemInput], item.timeline).result);
    case "analytics":
      return fromModuleResult(computeAnalytics([item.inputs as AnalyticsLineItemInput], item.timeline).result);
    case "publicSlack": {
      const { totalHours, totalCost } = computePublicSlack([item.inputs as PublicSlackLineItemInput]);
      return { hoursPreP: totalHours, pmHours: 0, finalHours: totalHours, finalCost: totalCost };
    }
    case "customHC":
      throw new Error("Custom HC has no calculator yet — it's a visible placeholder, not a selectable line item.");
  }
}

// Breakdown field labels per module, for display — keys must match each
// module's calculate*LineItem result shape (excluding totalHours/totalCost).
const BREAKDOWN_LABELS: Partial<Record<ModuleId, Record<string, string>>> = {
  support: { discoveryHours: "Discovery", businessRulesHours: "Business rules", guideHours: "Guide", addonHours: "Add-ons" },
  dc: { baseHours: "Base" },
  voice: { discoveryHours: "Discovery", configHours: "Config", ivrHours: "IVR", trainingHours: "Training" },
  oobMessaging: { widgetHours: "Widgets", taHours: "TA guidance" },
  aiCopilot: { hours: "Enablement", pmHours: "PM" },
  aiaa: { baselineHours: "Baseline", addonHours: "Add-ons", pmHours: "PM" },
  qa: { baselineHours: "Baseline", addonHours: "Add-ons" },
  wfm: { baselineHours: "Baseline", addonHours: "Add-ons" },
  customObjects: { designHours: "Design", buildHours: "Build", migrationHours: "Migration", uiHours: "UI", qaHours: "QA", docsHours: "Docs" },
  migration: { mappingHours: "Mapping", volumeHours: "Volume", attachmentHours: "Attachments", openTicketHours: "Open tickets", qaHours: "QA" },
  customApp: { designHours: "Design", buildHours: "Build", qaHours: "QA", trainingHours: "Training" },
  analytics: { baselineAndAddonHours: "Baseline + add-ons", requirementsMeetingHours: "Requirements meeting" },
};

export function computeLineItemBreakdown(item: LineItem): { label: string; hours: number }[] {
  const labels = BREAKDOWN_LABELS[item.moduleId];
  if (!labels) return [];

  let raw: Record<string, number>;
  switch (item.moduleId) {
    case "support":
      raw = calculateSupportLineItem(item.inputs as SupportLineItemInput) as unknown as Record<string, number>;
      break;
    case "dc":
      raw = calculateDcLineItem(item.inputs as DcLineItemInput) as unknown as Record<string, number>;
      break;
    case "voice":
      raw = calculateVoiceLineItem(item.inputs as VoiceLineItemInput) as unknown as Record<string, number>;
      break;
    case "oobMessaging":
      raw = calculateOobMessagingLineItem(item.inputs as OobMessagingLineItemInput) as unknown as Record<string, number>;
      break;
    case "aiCopilot":
      raw = calculateAiCopilotLineItem(item.inputs as AiCopilotLineItemInput) as unknown as Record<string, number>;
      break;
    case "aiaa":
      raw = calculateAiaaLineItem(item.inputs as AiaaLineItemInput) as unknown as Record<string, number>;
      break;
    case "qa":
      raw = calculateQaLineItem(item.inputs as QaLineItemInput) as unknown as Record<string, number>;
      break;
    case "wfm":
      raw = calculateWfmLineItem(item.inputs as WfmLineItemInput) as unknown as Record<string, number>;
      break;
    case "customObjects":
      raw = calculateCustomObjectsLineItem(item.inputs as CustomObjectLineItemInput) as unknown as Record<string, number>;
      break;
    case "migration":
      raw = calculateMigrationLineItem(item.inputs as MigrationLineItemInput) as unknown as Record<string, number>;
      break;
    case "customApp":
      raw = calculateCustomAppLineItem(item.inputs as CustomAppLineItemInput) as unknown as Record<string, number>;
      break;
    case "analytics":
      raw = calculateAnalyticsLineItem(item.inputs as AnalyticsLineItemInput) as unknown as Record<string, number>;
      break;
    default:
      return [];
  }

  return Object.entries(labels)
    .map(([key, label]) => ({ label, hours: Number(raw[key] ?? 0) }))
    .filter((row) => row.hours !== 0);
}

export interface ModuleEffortBand {
  moduleId: ModuleId;
  effortBand: EffortBand;
}

// Effort bands are properties of a whole module's inputs (e.g. total ticket
// volume across every Migration line item in the SOW), not of one row, and
// don't depend on timeline — so these group by module across the full SOW,
// independent of computeLineItemTotals' per-row totals above.
const EFFORT_BAND_TIMELINE: TimelineOption = "standard";

export function computeModuleEffortBands(sow: SowState): ModuleEffortBand[] {
  const bands: ModuleEffortBand[] = [];

  const customObjectsInputs = sow.lineItems.filter((i) => i.moduleId === "customObjects").map((i) => i.inputs as CustomObjectLineItemInput);
  if (customObjectsInputs.length > 0) {
    const { effortBand } = computeCustomObjects(customObjectsInputs, EFFORT_BAND_TIMELINE);
    if (effortBand) bands.push({ moduleId: "customObjects", effortBand });
  }

  const migrationInputs = sow.lineItems.filter((i) => i.moduleId === "migration").map((i) => i.inputs as MigrationLineItemInput);
  if (migrationInputs.length > 0) {
    const { effortBand } = computeMigration(migrationInputs, EFFORT_BAND_TIMELINE);
    if (effortBand) bands.push({ moduleId: "migration", effortBand });
  }

  const customAppInputs = sow.lineItems.filter((i) => i.moduleId === "customApp").map((i) => i.inputs as CustomAppLineItemInput);
  if (customAppInputs.length > 0) {
    const { effortBand } = computeCustomApp(customAppInputs, EFFORT_BAND_TIMELINE);
    if (effortBand) bands.push({ moduleId: "customApp", effortBand });
  }

  return bands;
}

export interface SowTotals {
  lineItemTotals: Record<string, LineItemTotals>;
  totalHours: number;
  totalCost: number;
  moduleEffortBands: ModuleEffortBand[];
}

export function computeSowTotals(sow: SowState): SowTotals {
  const lineItemTotals: Record<string, LineItemTotals> = {};
  let totalHours = 0;
  let totalCost = 0;

  for (const item of sow.lineItems) {
    if (item.moduleId === "customHC") continue; // placeholder module, not estimable
    const totals = computeLineItemTotals(item);
    lineItemTotals[item.id] = totals;
    totalHours += totals.finalHours;
    totalCost += totals.finalCost;
  }

  return { lineItemTotals, totalHours, totalCost, moduleEffortBands: computeModuleEffortBands(sow) };
}
