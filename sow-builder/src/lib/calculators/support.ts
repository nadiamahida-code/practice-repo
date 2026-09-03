// Mirrors the "Support" sheet in Sow Calcs 8.26.26.xlsx.
// Section 1 (assumptions) -> RATE_CARD below. Section 2 (calculator rows) -> calculateSupportLineItem.
// Section 3 (result roll-up) -> computeSupport, via the shared rollUpResult helper.

import { DEFAULT_HOURLY_RATE, type TimelineOption } from "./globalAssumptions";
import { rollUpResult, type ModuleResult } from "./shared";

export const SUPPORT_RATE_CARD = {
  hourlyRate: DEFAULT_HOURLY_RATE, // B14, linked to 'Global Assumptions'!$B$6
  discoveryHoursStandard: 3, // B17
  discoveryHoursHigher: 6, // B18
  groupsIncluded: 3, // B21 — groups included before extra effort kicks in
  extraDiscoveryHoursPerGroup: 2, // B22
  extraConfigHoursPerGroup: 3, // B23
  businessRulesTiers: [
    { maxRules: 25, hours: 15 }, // B26
    { maxRules: 55, hours: 20 }, // B27 (*includes two action flows)
    { maxRules: 85, hours: 30 }, // B28 (*includes two action flows)
    { maxRules: 100, hours: 35 }, // B29 — beyond 100 is fully custom scoping
  ],
  guideOobSetupHours: 10, // B32
  additionalActionFlowHours: 4, // B35
} as const;

export type DiscoveryTier = "Standard" | "Higher";

export interface SupportLineItemInput {
  scopeName: string;
  discoveryTier: DiscoveryTier;
  groupCount: number;
  businessRuleCount: number;
  includeGuideOob: boolean;
  additionalActionFlows: number;
}

export interface SupportLineItemResult {
  discoveryHours: number; // column G
  businessRulesHours: number; // column H
  guideHours: number; // column I
  addonHours: number; // column J
  totalHours: number; // column K
  totalCost: number; // column L
}

function businessRulesHoursFor(count: number): number {
  const tier = SUPPORT_RATE_CARD.businessRulesTiers.find((t) => count <= t.maxRules);
  return (tier ?? SUPPORT_RATE_CARD.businessRulesTiers[SUPPORT_RATE_CARD.businessRulesTiers.length - 1]).hours;
}

export function calculateSupportLineItem(input: SupportLineItemInput): SupportLineItemResult {
  const rc = SUPPORT_RATE_CARD;
  const extraGroups = Math.max(0, input.groupCount - rc.groupsIncluded);

  const discoveryHours =
    (input.discoveryTier === "Higher" ? rc.discoveryHoursHigher : rc.discoveryHoursStandard) +
    extraGroups * rc.extraDiscoveryHoursPerGroup;

  const businessRulesHours =
    businessRulesHoursFor(input.businessRuleCount) + extraGroups * rc.extraConfigHoursPerGroup;

  const guideHours = input.includeGuideOob ? rc.guideOobSetupHours : 0;

  const addonHours = input.additionalActionFlows * rc.additionalActionFlowHours;

  const totalHours = discoveryHours + businessRulesHours + guideHours + addonHours;
  const totalCost = totalHours * rc.hourlyRate;

  return { discoveryHours, businessRulesHours, guideHours, addonHours, totalHours, totalCost };
}

export function computeSupport(
  lineItems: SupportLineItemInput[],
  timeline: TimelineOption
): { lineResults: SupportLineItemResult[]; result: ModuleResult } {
  const lineResults = lineItems.map(calculateSupportLineItem);
  const totalHoursPreP = lineResults.reduce((sum, r) => sum + r.totalHours, 0);
  const result = rollUpResult(totalHoursPreP, timeline, { hourlyRate: SUPPORT_RATE_CARD.hourlyRate });
  return { lineResults, result };
}
