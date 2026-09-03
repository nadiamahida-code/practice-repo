import type { TimelineOption } from "./globalAssumptions";

// One entry per sheet in Sow Calcs 8.26.26.xlsx.
export const MODULE_IDS = [
  "support",
  "dc",
  "multiBrand",
  "customHC",
  "voice",
  "oobMessaging",
  "aiCopilot",
  "aiaa",
  "qa",
  "wfm",
  "advDataPrivacy",
  "customObjects",
  "migration",
  "customApp",
  "analytics",
  "publicSlack",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

// "placeholder" = the sheet itself has no real rate card yet (e.g. Custom HC).
// The module should render as visibly not-yet-configured, not silently omitted.
export type ModuleStatus = "ready" | "placeholder";

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  status: ModuleStatus;
  /** Shown in the UI when status is "placeholder". */
  placeholderNote?: string;
}

/**
 * A few modules (custom objects, Migration, Custom App) also output a
 * suggested effort-band label based on size thresholds, purely informational.
 */
export type EffortBand = "Low" | "Mid" | "High";

/**
 * One line item in an in-progress SOW: a single module calculator, configured
 * with concrete inputs and a chosen delivery timeline. A full SOW combines
 * several of these (e.g. Support + Voice + Migration), unlike the source
 * workbook where each sheet's Section 3 stands alone.
 */
export interface LineItem<TInputs = unknown> {
  id: string;
  moduleId: ModuleId;
  name: string;
  timeline: TimelineOption;
  inputs: TInputs;
}

export interface SowState {
  lineItems: LineItem[];
}
