// Mirrors the "WFM" (Workforce Management) sheet in Sow Calcs 8.26.26.xlsx.
// Discovery and Config both scale with the number of Agent Teams.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const WFM_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B9, linked to 'Global Assumptions'!$B$6
  discoveryBaseHours: 6, // B12
  discoveryHoursPerAgentTeam: 1.5, // B13
  configBaseHours: 6, // B14
  configHoursPerAgentTeam: 1, // B15
  uatSoftLaunchTrainingHours: 6, // B16
  hypercareHours: 2, // B17
  workstreamsIncluded: 4, // B20
  hoursPerAdditionalWorkstream: 2, // B23
} as const;

export interface WfmLineItemInput {
  scopeName: string;
  totalWorkstreams: number;
  agentTeamCount: number;
}

export interface WfmLineItemResult {
  baselineHours: number; // column D
  addonHours: number; // column E
  totalHours: number; // column H
}

export function calculateWfmLineItem(input: WfmLineItemInput): WfmLineItemResult {
  const rc = WFM_RATE_CARD;

  const baselineHours =
    rc.discoveryBaseHours +
    input.agentTeamCount * rc.discoveryHoursPerAgentTeam +
    rc.configBaseHours +
    input.agentTeamCount * rc.configHoursPerAgentTeam +
    rc.uatSoftLaunchTrainingHours +
    rc.hypercareHours;

  const addonHours = Math.max(0, input.totalWorkstreams - rc.workstreamsIncluded) * rc.hoursPerAdditionalWorkstream;

  const totalHours = baselineHours + addonHours;

  return { baselineHours, addonHours, totalHours };
}

export function computeWfm(
  lineItems: WfmLineItemInput[],
  timeline: TimelineOption
): { lineResults: WfmLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateWfmLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: WFM_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
