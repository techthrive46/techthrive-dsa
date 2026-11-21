"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Language } from "@/lib/code/types";

export type CodeTab = "pseudo" | Language;

const STORAGE_KEY = "algothrive:code-tab";
const TABS: CodeTab[] = ["pseudo", "cpp", "java", "python"];

let current: CodeTab | null = null;
const listeners = new Set<() => void>();

function readStored(): CodeTab {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && (TABS as string[]).includes(v)) return v as CodeTab;
  } catch {
    // Storage can be blocked (private mode, previews); fall back to the default.
  }
  return "pseudo";
}

function getSnapshot(): CodeTab {
  if (current === null) current = readStored();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    current = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The selected code tab, remembered per browser so a Java student stays on Java. */
export function useCodeTab() {
  const tab = useSyncExternalStore(subscribe, getSnapshot, () => "pseudo" as CodeTab);
  const setTab = useCallback((next: CodeTab) => {
    current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted, but still applies for this visit.
    }
    listeners.forEach((l) => l());
  }, []);
  return [tab, setTab] as const;
}
