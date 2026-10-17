"use client";
import { useSyncExternalStore } from "react";
import {
  HOME_STORAGE_KEY,
  parseHomeChoices,
  changeHomeChoice,
  type HomeChoices,
} from "@/lib/home-preferences";
const listeners = new Set<() => void>();
let temporarySnapshot: string | null = null;
const notify = () => listeners.forEach((callback) => callback());
function onStorage(event: StorageEvent) {
  if (event.key === HOME_STORAGE_KEY || event.key === null) {
    temporarySnapshot = null;
    notify();
  }
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
function snapshot() {
  if (temporarySnapshot !== null) return temporarySnapshot;
  try {
    return window.localStorage.getItem(HOME_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}
const serverSnapshot = () => "";
function write(next: HomeChoices) {
  const serialized = JSON.stringify(next);
  try {
    window.localStorage.setItem(HOME_STORAGE_KEY, serialized);
    temporarySnapshot = null;
  } catch {
    temporarySnapshot = serialized;
  }
  notify();
}
export function useHomeChoices() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const state = parseHomeChoices(raw);
  return {
    ...state,
    temporary: temporarySnapshot !== null,
    toggle(kind: "saved" | "compare", id: string) {
      const result = changeHomeChoice(parseHomeChoices(snapshot()), kind, id);
      if (!result.limited) write(result.next);
      return !result.limited;
    },
    clear(kind: "saved" | "compare") {
      write({ ...parseHomeChoices(snapshot()), [kind]: [] });
    },
  };
}
