// Declarative UI config for every "ready" module: the real one-line
// description from the sheet's own A2 cell (WHAT'S INCLUDED), plus a field
// spec list the generic ModuleInputForm renders. One place to add a module
// to the UI without writing a bespoke form component per module.

import type { ModuleId } from "./types";

export type FieldSpec =
  | { key: string; label: string; kind: "number"; min?: number; step?: number }
  | { key: string; label: string; kind: "select"; options: readonly string[] }
  | { key: string; label: string; kind: "boolean" };

export interface ModuleFormConfig {
  description: string;
  nameField: string;
  nameLabel: string;
  fields: FieldSpec[];
  defaultInputs: (name: string) => Record<string, unknown>;
}

export const MODULE_FORM_CONFIGS: Partial<Record<ModuleId, ModuleFormConfig>> = {
  support: {
    description:
      "Core Zendesk Support setup — discovery by agent-group tier, business-rule (trigger/automation) build scaled by count, optional Guide OOB knowledge base setup, and action-flow add-ons.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "discoveryTier", label: "Discovery tier", kind: "select", options: ["Standard", "Higher"] },
      { key: "groupCount", label: "# groups", kind: "number", min: 0 },
      { key: "businessRuleCount", label: "# business rules", kind: "number", min: 0 },
      { key: "includeGuideOob", label: "Include Guide OOB?", kind: "boolean" },
      { key: "additionalActionFlows", label: "# additional action flows", kind: "number", min: 0 },
    ],
    defaultInputs: (scopeName) => ({
      scopeName,
      discoveryTier: "Standard",
      groupCount: 3,
      businessRuleCount: 25,
      includeGuideOob: false,
      additionalActionFlows: 0,
    }),
  },
  dc: {
    description:
      "Localization/translation setup for dynamic content items (macros, triggers, articles, etc.) across one or more languages. Effort tiers cascade by item count.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "customItemCount", label: "# custom items", kind: "number", min: 0 },
      { key: "languageCount", label: "# languages", kind: "number", min: 0 },
    ],
    defaultInputs: (scopeName) => ({ scopeName, customItemCount: 40, languageCount: 1 }),
  },
  multiBrand: {
    description: "Configuring additional brands within a single Zendesk instance. Flat allowance covers up to 3 brands.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [{ key: "totalBrands", label: "# total brands", kind: "number", min: 0 }],
    defaultInputs: (scopeName) => ({ scopeName, totalBrands: 3 }),
  },
  voice: {
    description:
      "Out-of-the-box Zendesk Talk setup — discovery, phone number configuration, IVR build (scaled by complexity), and training/documentation/testing. No PM applied per the original rate card.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "phoneNumberCount", label: "# phone numbers", kind: "number", min: 0 },
      { key: "ivrCount", label: "# IVRs", kind: "number", min: 0 },
      { key: "ivrComplexity", label: "IVR complexity", kind: "select", options: ["Normal", "High"] },
    ],
    defaultInputs: (scopeName) => ({ scopeName, phoneNumberCount: 1, ivrCount: 0, ivrComplexity: "Normal" }),
  },
  oobMessaging: {
    description:
      "Out-of-the-box messaging widget setup (web messaging widget, plus other channel widgets like WhatsApp/Facebook), per brand. Does not include AIAA (bot) setup.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "messagingWidgetCount", label: "# messaging widgets", kind: "number", min: 0 },
      { key: "otherChannelWidgetCount", label: "# other channel widgets", kind: "number", min: 0 },
      { key: "needsTaGuidance", label: "Needs TA guidance?", kind: "boolean" },
    ],
    defaultInputs: (scopeName) => ({ scopeName, messagingWidgetCount: 1, otherChannelWidgetCount: 0, needsTaGuidance: false }),
  },
  aiCopilot: {
    description:
      "Two tiers — simply turning on Copilot features (overview only, no config), or the fuller tier that also builds auto-assist procedures and configures suggestions.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      {
        key: "tier",
        label: "Tier",
        kind: "select",
        options: ["Tier 1 — Enable only", "Tier 2 — Enable + procedures/config"],
      },
    ],
    defaultInputs: (scopeName) => ({ scopeName, tier: "Tier 1 — Enable only" }),
  },
  aiaa: {
    description:
      "AI Agents/Advanced Automation setup — source connection & discovery, build of up to 3 standard use cases, 2 included API connections, ZD support routing, and TA guidance.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "apiConnectionCount", label: "# API connections/action flows", kind: "number", min: 0 },
      { key: "useCaseCount", label: "# use cases", kind: "number", min: 0 },
    ],
    defaultInputs: (scopeName) => ({ scopeName, apiConnectionCount: 2, useCaseCount: 3 }),
  },
  qa: {
    description:
      "Up to 2 scorecards, 2 workspaces, AutoQA, Spotlight filters, agent groups, and calibration/coaching methodology. No PM applied per the original rate card.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "totalWorkspaces", label: "# total workspaces", kind: "number", min: 0 },
      { key: "totalScorecards", label: "# total scorecards", kind: "number", min: 0 },
    ],
    defaultInputs: (scopeName) => ({ scopeName, totalWorkspaces: 2, totalScorecards: 2 }),
  },
  wfm: {
    description:
      "Workforce Management setup — discovery, configuration, UAT/soft launch/training, and hypercare. Discovery and Config scale with the number of Agent Teams.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "totalWorkstreams", label: "# total workstreams", kind: "number", min: 0 },
      { key: "agentTeamCount", label: "# agent teams", kind: "number", min: 0 },
    ],
    defaultInputs: (scopeName) => ({ scopeName, totalWorkstreams: 4, agentTeamCount: 1 }),
  },
  advDataPrivacy: {
    description:
      "Two engagement types — a quick Feature Review, or the Full Implementation walking through all 6 phases (Discovery, Access Request, KMS Config, Sandbox Testing, Production Rollout, Docs & Handoff).",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [{ key: "engagementType", label: "Engagement type", kind: "select", options: ["Feature Review", "Full Implementation"] }],
    defaultInputs: (scopeName) => ({ scopeName, engagementType: "Feature Review" }),
  },
  customObjects: {
    description:
      "Zendesk Custom Object scope — data model design, build, object-facing UI (sidebar app or admin CRUD UI), and migration of data into the objects.",
    nameField: "objectName",
    nameLabel: "Object name",
    fields: [
      { key: "fieldCount", label: "# fields", kind: "number", min: 0 },
      { key: "relationshipFieldCount", label: "# relationship fields", kind: "number", min: 0 },
      { key: "migrationNeeded", label: "Migration needed?", kind: "boolean" },
      { key: "uiType", label: "UI type", kind: "select", options: ["None", "Read-only sidebar", "Admin CRUD UI"] },
      { key: "uiScreenCount", label: "# UI screens", kind: "number", min: 0 },
    ],
    defaultInputs: (objectName) => ({
      objectName,
      fieldCount: 10,
      relationshipFieldCount: 0,
      migrationNeeded: false,
      uiType: "None",
      uiScreenCount: 0,
    }),
  },
  migration: {
    description:
      "Ticket/user/org/attachment data migration into Zendesk — data mapping, ticket-volume build/import/testing, attachment handling, and open/non-closed ticket delta handling.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "ticketCount", label: "# tickets", kind: "number", min: 0 },
      { key: "attachmentCount", label: "# attachments", kind: "number", min: 0 },
      { key: "customFieldCount", label: "# custom fields", kind: "number", min: 0 },
      { key: "openTicketCount", label: "# open/non-closed tickets", kind: "number", min: 0 },
      {
        key: "sourceSystem",
        label: "Source system",
        kind: "select",
        options: ["CSV export", "API pull", "CRM (Salesforce / other)"],
      },
      { key: "migrationMethod", label: "Migration method", kind: "select", options: ["Custom developer", "Migration tool (e.g. Relokia)"] },
    ],
    defaultInputs: (scopeName) => ({
      scopeName,
      ticketCount: 10000,
      attachmentCount: 0,
      customFieldCount: 10,
      openTicketCount: 0,
      sourceSystem: "CSV export",
      migrationMethod: "Custom developer",
    }),
  },
  customApp: {
    description:
      "Custom Zendesk apps/integrations — sidebar apps, ticket-sidebar widgets, and backend integrations (e.g. Envoy Connect). Not custom objects or data migration.",
    nameField: "appName",
    nameLabel: "App name",
    fields: [
      { key: "fieldCount", label: "# fields/data points", kind: "number", min: 0 },
      { key: "fieldOptionCount", label: "# field options", kind: "number", min: 0 },
      { key: "attachmentSync", label: "Attachment sync?", kind: "boolean" },
      { key: "callsExternalApi", label: "Calls external API?", kind: "boolean" },
      {
        key: "appType",
        label: "App type",
        kind: "select",
        options: [
          "Read-only sidebar app (display only)",
          "Sidebar app with write-back actions",
          "Backend integration (e.g. Envoy Connect, no UI)",
          "Combined sidebar UI + backend integration",
        ],
      },
    ],
    defaultInputs: (appName) => ({
      appName,
      fieldCount: 10,
      fieldOptionCount: 0,
      attachmentSync: false,
      callsExternalApi: false,
      appType: "Read-only sidebar app (display only)",
    }),
  },
  analytics: {
    description:
      "Baseline Explore reporting setup — up to 1 dashboard, 5 reports, and 3 custom metrics/attributes, plus an overview meeting. Anything beyond baseline is scoped as additional units.",
    nameField: "scopeName",
    nameLabel: "Scope name",
    fields: [
      { key: "totalDashboards", label: "# total dashboards", kind: "number", min: 0 },
      { key: "totalReports", label: "# total reports", kind: "number", min: 0 },
      { key: "totalMetrics", label: "# total custom metrics", kind: "number", min: 0 },
      { key: "includeTraining", label: "Include training session?", kind: "boolean" },
    ],
    defaultInputs: (scopeName) => ({ scopeName, totalDashboards: 1, totalReports: 5, totalMetrics: 3, includeTraining: false }),
  },
  publicSlack: {
    description:
      "A modifier for projects that include a shared/public Slack channel for client support alongside the main engagement — a flat 8% add-on to that project's PM + Consultant time, not a standalone build.",
    nameField: "projectName",
    nameLabel: "Project name",
    fields: [{ key: "projectPmAndConsultantHours", label: "Project's PM + Consultant hrs", kind: "number", min: 0 }],
    defaultInputs: (projectName) => ({ projectName, projectPmAndConsultantHours: 0 }),
  },
};
