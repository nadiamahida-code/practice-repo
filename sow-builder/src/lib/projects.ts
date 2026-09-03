"use client";

// Lightweight client-side project store, backed by localStorage and exposed
// via useSyncExternalStore. There's no backend yet — good enough for the
// Projects module until a real data source (CRM sync, database) replaces it.

import { useSyncExternalStore } from "react";

export type ProjectPhase = "Sales" | "Delivery" | "Complete";

export interface Project {
  id: string;
  name: string;
  client: string;
  phase: ProjectPhase;
  /** Set once a SOW has been started for this project (Sales phase's "Create SOW" flow). */
  sowId: string | null;
}

const STORAGE_KEY = "sow-builder:projects";

const SEED_PROJECTS: Project[] = [
  { id: "proj-acme-wfm", name: "Acme Corp — WFM Rollout", client: "Acme Corp", phase: "Sales", sowId: null },
  {
    id: "proj-brightpath-copilot",
    name: "Bright Path Logistics — Copilot Pilot",
    client: "Bright Path Logistics",
    phase: "Sales",
    sowId: "sow-seed-brightpath",
  },
  { id: "proj-solace-migration", name: "Solace Health — Full Migration", client: "Solace Health", phase: "Delivery", sowId: "sow-seed-solace" },
  {
    id: "proj-northwind-support",
    name: "Northwind Traders — Support Setup",
    client: "Northwind Traders",
    phase: "Complete",
    sowId: "sow-seed-northwind",
  },
];

const listeners = new Set<() => void>();
let cache: Project[] | null = null;

function readFromStorage(): Project[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
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

export function newSowId(): string {
  return `sow-${Math.random().toString(36).slice(2, 10)}`;
}
