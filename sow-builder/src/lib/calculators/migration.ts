// Mirrors the "Migration" sheet in Sow Calcs 8.26.26.xlsx.
// Ticket/user/org/attachment data migration into Zendesk. NOT ongoing
// integrations or custom object build — see customApp.ts and customObjects.ts.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";
import type { EffortBand } from "./types";

export const MIGRATION_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B13, linked to 'Global Assumptions'!$B$6
  projectLevelFlatHours: 8, // B16 — split evenly across rows, divided by 15 per row
  projectLevelRowDivisor: 15,
  mappingHoursUpTo10Fields: 2, // B19
  mappingHoursUpTo30Fields: 4, // B20
  mappingHoursPerAdditional20FieldGrouping: 4, // B21 — beyond 30, per grouping of 20 (or part thereof)
  volumeHoursPer1000Tickets: 0.2, // B24
  attachmentHoursPer1000Attachments: 0.15, // B27
  openTicketThreshold: 200, // B30
  openTicketManualHours: 3, // B31 — used when open tickets <= threshold
  openTicketAutomationBaseHours: 4, // B32 — used when open tickets > threshold
  openTicketAutomationHoursPer1000: 1.5, // B33
  sourceSystemMultiplierCsv: 0.75, // B36
  sourceSystemMultiplierApi: 1.0, // B37
  sourceSystemMultiplierCrm: 1.0, // B38
  methodOverheadCustomDeveloper: 0, // B41
  methodOverheadMigrationTool: 10, // B42
  qaPercentOfMappingVolumeAttachmentOpenTicket: 0.15, // B45
} as const;

export type MigrationSourceSystem = "CSV export" | "API pull" | "CRM (Salesforce / other)";
export type MigrationMethod = "Custom developer" | "Migration tool (e.g. Relokia)";

export interface MigrationLineItemInput {
  scopeName: string;
  ticketCount: number;
  attachmentCount: number;
  customFieldCount: number;
  openTicketCount: number;
  sourceSystem: MigrationSourceSystem;
  migrationMethod: MigrationMethod;
}

export interface MigrationLineItemResult {
  mappingHours: number; // column H
  volumeHours: number; // column I
  attachmentHours: number; // column J
  openTicketHours: number; // column K
  qaHours: number; // column L
  totalHours: number; // column M
  totalCost: number; // column N
}

function sourceSystemMultiplierFor(sourceSystem: MigrationSourceSystem): number {
  const rc = MIGRATION_RATE_CARD;
  if (sourceSystem === "API pull") return rc.sourceSystemMultiplierApi;
  if (sourceSystem === "CRM (Salesforce / other)") return rc.sourceSystemMultiplierCrm;
  return rc.sourceSystemMultiplierCsv;
}

export function calculateMigrationLineItem(input: MigrationLineItemInput): MigrationLineItemResult {
  const rc = MIGRATION_RATE_CARD;

  const mappingHours =
    input.customFieldCount <= 10
      ? rc.mappingHoursUpTo10Fields
      : input.customFieldCount <= 30
        ? rc.mappingHoursUpTo30Fields
        : rc.mappingHoursUpTo30Fields + Math.ceil((input.customFieldCount - 30) / 20) * rc.mappingHoursPerAdditional20FieldGrouping;

  const volumeHours = (input.ticketCount / 1000) * rc.volumeHoursPer1000Tickets;
  const attachmentHours = (input.attachmentCount / 1000) * rc.attachmentHoursPer1000Attachments;

  const openTicketHours =
    input.openTicketCount <= rc.openTicketThreshold
      ? rc.openTicketManualHours
      : rc.openTicketAutomationBaseHours + Math.ceil(input.openTicketCount / 1000) * rc.openTicketAutomationHoursPer1000;

  const sourceMultiplier = sourceSystemMultiplierFor(input.sourceSystem);
  const preQaHours = (mappingHours + volumeHours + attachmentHours + openTicketHours) * sourceMultiplier;
  const qaHours = preQaHours * rc.qaPercentOfMappingVolumeAttachmentOpenTicket;

  const methodOverhead =
    input.migrationMethod === "Migration tool (e.g. Relokia)" ? rc.methodOverheadMigrationTool : rc.methodOverheadCustomDeveloper;

  const totalHours = preQaHours + qaHours + methodOverhead + rc.projectLevelFlatHours / rc.projectLevelRowDivisor;
  const totalCost = totalHours * rc.hourlyRate;

  return { mappingHours, volumeHours, attachmentHours, openTicketHours, qaHours, totalHours, totalCost };
}

function effortBandFor(totalTickets: number): EffortBand {
  if (totalTickets < 25000) return "Low";
  if (totalTickets <= 150000) return "Mid";
  return "High";
}

export function computeMigration(
  lineItems: MigrationLineItemInput[],
  timeline: TimelineOption
): { lineResults: MigrationLineItemResult[]; result: ModuleResult; effortBand: EffortBand | null } {
  const lineResults = lineItems.map(calculateMigrationLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: MIGRATION_RATE_CARD.hourlyRate });

  const totalTickets = lineItems.reduce((sum, i) => sum + i.ticketCount, 0);
  const effortBand = lineItems.length === 0 ? null : effortBandFor(totalTickets);

  return { lineResults, result, effortBand };
}
