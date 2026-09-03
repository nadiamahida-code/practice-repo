import type { ModuleId, ModuleMeta } from "./types";
import { CUSTOM_HC_STATUS_NOTE } from "./customHC";

// Registry of every module from Sow Calcs 8.26.26.xlsx. Modules not yet implemented
// as calculators still get an entry here so the UI can list all 16 and mark status
// honestly, rather than silently omitting ones that aren't built yet.
export const MODULE_REGISTRY: ModuleMeta[] = [
  { id: "support", label: "Support", status: "ready" },
  { id: "dc", label: "DC", status: "ready" },
  { id: "multiBrand", label: "Multi Brand", status: "ready" },
  { id: "customHC", label: "Custom HC", status: "placeholder", placeholderNote: CUSTOM_HC_STATUS_NOTE },
  { id: "voice", label: "Voice", status: "ready" },
  { id: "oobMessaging", label: "OOB Messaging", status: "ready" },
  { id: "aiCopilot", label: "AI Copilot", status: "ready" },
  { id: "aiaa", label: "AIAA", status: "ready" },
  { id: "qa", label: "QA", status: "ready" },
  { id: "wfm", label: "WFM", status: "ready" },
  { id: "advDataPrivacy", label: "Adv Data Privacy", status: "ready" },
  { id: "customObjects", label: "Custom Objects", status: "ready" },
  { id: "migration", label: "Migration", status: "ready" },
  { id: "customApp", label: "Custom App", status: "ready" },
  { id: "analytics", label: "Analytics", status: "ready" },
  { id: "publicSlack", label: "Public Slack", status: "ready" },
];

export const MODULE_LABELS: Record<ModuleId, string> = Object.fromEntries(
  MODULE_REGISTRY.map((m) => [m.id, m.label])
) as Record<ModuleId, string>;
