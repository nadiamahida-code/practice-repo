// Mirrors the "Adv Data Privacy" sheet in Sow Calcs 8.26.26.xlsx.
// Two engagement types: a quick Feature Review, or the Full Implementation
// walking through all 6 phases.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const ADV_DATA_PRIVACY_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B11, linked to 'Global Assumptions'!$B$6
  featureReviewHours: 2, // B13
  phase1DiscoveryReadinessHours: 2, // B16
  phase2AccessRequestPortalSetupHours: 2, // B17
  phase3KmsConfigurationHours: 8, // B18
  phase4SandboxTestingHours: 6, // B19
  phase5ProductionRolloutHours: 4, // B20
  phase6DocumentationHandoffHours: 2.5, // B21
} as const;

export type AdvDataPrivacyEngagementType = "Feature Review" | "Full Implementation";

export interface AdvDataPrivacyLineItemInput {
  scopeName: string;
  engagementType: AdvDataPrivacyEngagementType;
}

export interface AdvDataPrivacyLineItemResult {
  totalHours: number; // column H
}

export function calculateAdvDataPrivacyLineItem(input: AdvDataPrivacyLineItemInput): AdvDataPrivacyLineItemResult {
  const rc = ADV_DATA_PRIVACY_RATE_CARD;

  const totalHours =
    input.engagementType === "Feature Review"
      ? rc.featureReviewHours
      : rc.phase1DiscoveryReadinessHours +
        rc.phase2AccessRequestPortalSetupHours +
        rc.phase3KmsConfigurationHours +
        rc.phase4SandboxTestingHours +
        rc.phase5ProductionRolloutHours +
        rc.phase6DocumentationHandoffHours;

  return { totalHours };
}

export function computeAdvDataPrivacy(
  lineItems: AdvDataPrivacyLineItemInput[],
  timeline: TimelineOption
): { lineResults: AdvDataPrivacyLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateAdvDataPrivacyLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: ADV_DATA_PRIVACY_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
