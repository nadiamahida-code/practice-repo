// Mirrors the "Public Slack" sheet in Sow Calcs 8.26.26.xlsx.
// Unlike every other module, this is a flat % MODIFIER on another line
// item's PM + Consultant hours, not a standalone build. It has no PM step
// and no timeline multiplier of its own (Section 3 note: "this is already
// a % modifier"), so it does not use shared.ts's rollUpResult.

import { DEFAULT_HOURLY_RATE } from "./globalAssumptions";

export const PUBLIC_SLACK_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B10, linked to 'Global Assumptions'!$B$6
  percentOfProjectPmAndConsultantHours: 0.08, // B11
} as const;

export interface PublicSlackLineItemInput {
  projectName: string;
  /** The other project's total PM + Consultant hours, read off that project's own tab. */
  projectPmAndConsultantHours: number;
}

export interface PublicSlackLineItemResult {
  hours: number; // column C / E
  cost: number; // column F
}

export function calculatePublicSlackLineItem(input: PublicSlackLineItemInput): PublicSlackLineItemResult {
  const rc = PUBLIC_SLACK_RATE_CARD;
  const hours = input.projectPmAndConsultantHours * rc.percentOfProjectPmAndConsultantHours;
  const cost = hours * rc.hourlyRate;
  return { hours, cost };
}

export function computePublicSlack(lineItems: PublicSlackLineItemInput[]): {
  lineResults: PublicSlackLineItemResult[];
  totalHours: number;
  totalCost: number;
} {
  const lineResults = lineItems.map(calculatePublicSlackLineItem);
  const totalHours = lineResults.reduce((sum, r) => sum + r.hours, 0);
  const totalCost = lineResults.reduce((sum, r) => sum + r.cost, 0);
  return { lineResults, totalHours, totalCost };
}
