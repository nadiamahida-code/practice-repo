// Shared "Section 3 — Result" roll-up used by every module sheet:
//   Total hours (pre-PM) -> + PM hours -> x timeline multiplier -> x rate = final cost
// Some modules are PM-exempt (Voice, QA, AI Copilot tier 1) or conditionally PM-exempt
// (AIAA: no PM unless standalone AND >40 total hours) — those pass pmExempt accordingly.

import {
  DEFAULT_HOURLY_RATE,
  STANDARD_PM_PERCENT,
  TIMELINE_MULTIPLIERS,
  type TimelineOption,
} from "./globalAssumptions";

export interface ModuleResult {
  totalHoursPreP: number; // Section 3, "Total hours (pre-PM)"
  pmHours: number;
  timeline: TimelineOption;
  finalHours: number;
  finalCost: number;
}

export function rollUpResult(
  totalHoursPreP: number,
  timeline: TimelineOption,
  opts: { pmExempt?: boolean; hourlyRate?: number } = {}
): ModuleResult {
  const hourlyRate = opts.hourlyRate ?? DEFAULT_HOURLY_RATE;
  const pmHours = opts.pmExempt || totalHoursPreP === 0
    ? 0
    : totalHoursPreP * STANDARD_PM_PERCENT;
  const finalHours = (totalHoursPreP + pmHours) * TIMELINE_MULTIPLIERS[timeline];
  const finalCost = finalHours * hourlyRate;

  return { totalHoursPreP, pmHours, timeline, finalHours, finalCost };
}
