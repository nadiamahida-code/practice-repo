"use client";

// Lightweight client-side project store, backed by localStorage and exposed
// via useSyncExternalStore. There's no backend yet — good enough for the
// Projects module until a real data source (CRM sync, database) replaces it.

import { useSyncExternalStore } from "react";

export type ProjectPhase = "Sales" | "Delivery" | "Complete";

export const SALES_MILESTONES = ["Client introduction call", "Client discovery", "Prepared to sign SOW", "SOW signed"] as const;

export const DELIVERY_MILESTONES = ["Project kickoff", "Discovery", "Configuration", "Trainings", "User acceptance training", "Completion"] as const;

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  phase: ProjectPhase;
  /** Set once a SOW has been started for this project (Sales phase's "Create SOW" flow). */
  sowId: string | null;
  team: TeamMember[];
  /** Index into the current phase's milestone list of the furthest-reached milestone. -1 = none yet. */
  milestoneIndex: number;
}

const STORAGE_KEY = "sow-builder:projects";

const SEED_PROJECTS: Project[] = [
  {
    id: "proj-acme-wfm",
    clientId: "client-acme",
    name: "Acme Corp — WFM Rollout",
    phase: "Sales",
    sowId: null,
    team: [{ id: "m-priya", name: "Priya Nandakumar", role: "Sales Rep" }],
    milestoneIndex: 0,
  },
  {
    id: "proj-brightpath-copilot",
    clientId: "client-brightpath",
    name: "Bright Path Logistics — Copilot Pilot",
    phase: "Sales",
    sowId: "sow-seed-brightpath",
    team: [
      { id: "m-marcus", name: "Marcus T.", role: "Solutions Consultant" },
      { id: "m-jordan", name: "Jordan B.", role: "Project Manager" },
    ],
    milestoneIndex: 2,
  },
  {
    id: "proj-solace-migration",
    clientId: "client-solace",
    name: "Solace Health — Full Migration",
    phase: "Delivery",
    sowId: "sow-seed-solace",
    team: [
      { id: "m-sasha", name: "Sasha L.", role: "Delivery Consultant" },
      { id: "m-jordan2", name: "Jordan B.", role: "Project Manager" },
    ],
    milestoneIndex: 2,
  },
  {
    id: "proj-northwind-support",
    clientId: "client-northwind",
    name: "Northwind Traders — Support Setup",
    phase: "Complete",
    sowId: "sow-seed-northwind",
    team: [{ id: "m-priya2", name: "Priya Nandakumar", role: "Account Owner" }],
    milestoneIndex: DELIVERY_MILESTONES.length - 1,
  },
];

/** Backfills fields added after a record may have already been persisted. */
function normalize(projects: Project[]): Project[] {
  return projects.map((p) => ({ ...p, team: p.team ?? [], milestoneIndex: p.milestoneIndex ?? -1 }));
}

const listeners = new Set<() => void>();
let cache: Project[] | null = null;

function readFromStorage(): Project[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw) as Project[]);
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to seed.
  }
  writeToStorage(SEED_PROJECTS);
  return SEED_PROJECTS;
}

function writeToStorage(projects: Project[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // localStorage unavailable — state just won't persist across reloads.
  }
}

function getSnapshot(): Project[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

const EMPTY_PROJECTS: Project[] = [];

function getServerSnapshot(): Project[] {
  return EMPTY_PROJECTS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Live-subscribed project list. Empty array until the client store hydrates. */
export function useProjects(): Project[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function updateProject(id: string, patch: Partial<Project>): void {
  const next = getSnapshot().map((p) => (p.id === id ? { ...p, ...patch } : p));
  cache = next;
  writeToStorage(next);
  emitChange();
}

export function addTeamMember(projectId: string, member: { name: string; role: string }): void {
  const project = getSnapshot().find((p) => p.id === projectId);
  if (!project) return;
  const newMember: TeamMember = { id: `member-${Math.random().toString(36).slice(2, 10)}`, ...member };
  updateProject(projectId, { team: [...project.team, newMember] });
}

export function removeTeamMember(projectId: string, memberId: string): void {
  const project = getSnapshot().find((p) => p.id === projectId);
  if (!project) return;
  updateProject(projectId, { team: project.team.filter((m) => m.id !== memberId) });
}

export function newSowId(): string {
  return `sow-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Sets the furthest-reached milestone for the project's current phase.
 * Reaching the last milestone of Sales or Delivery auto-advances the phase
 * (Sales -> Delivery on "SOW signed", Delivery -> Complete on "Completion"),
 * resetting milestone progress for the new phase.
 */
export function setMilestone(projectId: string, index: number): void {
  const project = getSnapshot().find((p) => p.id === projectId);
  if (!project) return;

  const milestones = project.phase === "Sales" ? SALES_MILESTONES : project.phase === "Delivery" ? DELIVERY_MILESTONES : [];
  const isLastMilestone = index === milestones.length - 1;

  if (isLastMilestone && project.phase === "Sales") {
    updateProject(projectId, { phase: "Delivery", milestoneIndex: -1 });
  } else if (isLastMilestone && project.phase === "Delivery") {
    updateProject(projectId, { phase: "Complete", milestoneIndex: -1 });
  } else {
    updateProject(projectId, { milestoneIndex: index });
  }
}

export function createProject(input: { name: string; clientId: string }): string {
  const id = `proj-${Math.random().toString(36).slice(2, 10)}`;
  const newProject: Project = { id, clientId: input.clientId, name: input.name, phase: "Sales", sowId: null, team: [], milestoneIndex: -1 };
  const next = [...getSnapshot(), newProject];
  cache = next;
  writeToStorage(next);
  emitChange();
  return id;
}
