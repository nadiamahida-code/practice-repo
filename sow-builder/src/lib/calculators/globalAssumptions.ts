// Mirrors the "Global Assumptions" sheet in Sow Calcs 8.26.26.xlsx (cells B6, B7, B10-B13).
// Every module calculator references these same values, exactly as the sheet's
// modules reference 'Global Assumptions'!$B$6 etc. Edit here to update every module.

export const DEFAULT_HOURLY_RATE = 258;

export const STANDARD_PM_PERCENT = 0.35;

export type TimelineOption =
  | "standard" // 7+ weeks
  | "5-7-weeks"
  | "3-4-weeks"
  | "under-3-weeks";

export const TIMELINE_LABELS: Record<TimelineOption, string> = {
  standard: "Standard (7+ weeks)",
  "5-7-weeks": "5-7 weeks",
  "3-4-weeks": "3-4 weeks",
  "under-3-weeks": "<3 weeks",
};

export const TIMELINE_MULTIPLIERS: Record<TimelineOption, number> = {
  standard: 1.0,
  "5-7-weeks": 1.2,
  "3-4-weeks": 1.3,
  "under-3-weeks": 1.4,
};

// Reference only (sheet cell B14) — a standalone (non-Support-bundled) engagement's
// kickoff + design sign-off. Not auto-added to any module's hours in the sheet.
export const STANDALONE_KO_AND_SIGNOFF_HOURS = 1.0;
