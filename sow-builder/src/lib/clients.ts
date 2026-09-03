"use client";

// Client store, same localStorage + useSyncExternalStore pattern as projects.ts.
// Projects reference a client via clientId.

import { useSyncExternalStore } from "react";

export interface Client {
  id: string;
  name: string;
}

const STORAGE_KEY = "sow-builder:clients";

const SEED_CLIENTS: Client[] = [
  { id: "client-acme", name: "Acme Corp" },
  { id: "client-brightpath", name: "Bright Path Logistics" },
  { id: "client-solace", name: "Solace Health" },
  { id: "client-northwind", name: "Northwind Traders" },
];

const listeners = new Set<() => void>();
let cache: Client[] | null = null;

function readFromStorage(): Client[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Client[];
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to seed.
  }
  writeToStorage(SEED_CLIENTS);
  return SEED_CLIENTS;
}

function writeToStorage(clients: Client[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {
    // localStorage unavailable — state just won't persist across reloads.
  }
}

function getSnapshot(): Client[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

const EMPTY_CLIENTS: Client[] = [];

function getServerSnapshot(): Client[] {
  return EMPTY_CLIENTS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Live-subscribed client list. Empty array until the client store hydrates. */
export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function createClient(name: string): string {
  const id = `client-${Math.random().toString(36).slice(2, 10)}`;
  const next = [...getSnapshot(), { id, name }];
  cache = next;
  writeToStorage(next);
  emitChange();
  return id;
}
