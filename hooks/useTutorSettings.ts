"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AnswerLanguage } from "@/lib/tutor/prompt";

export type TutorSettings = {
  apiKey: string | null;
  /** Model chosen when the key was connected. */
  model: string | null;
  language: AnswerLanguage;
};

const STORAGE_KEY = "algothrive:tutor";
const DEFAULTS: TutorSettings = { apiKey: null, model: null, language: "english" };

let current: TutorSettings | null = null;
const listeners = new Set<() => void>();

function readStored(): TutorSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TutorSettings>;
      return {
        apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : null,
        model: typeof parsed.model === "string" ? parsed.model : null,
        language:
          parsed.language === "tenglish" || parsed.language === "telugu"
            ? parsed.language
            : "english",
      };
    }
  } catch {
    // Blocked or corrupt storage: start fresh.
  }
  return DEFAULTS;
}

function getSnapshot(): TutorSettings {
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

/**
 * The student's Gemini key and tutor preferences. Stored only in this browser;
 * the key is sent to Google's API and nowhere else.
 */
export function useTutorSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULTS);

  const update = useCallback((patch: Partial<TutorSettings>) => {
    current = { ...getSnapshot(), ...patch };
    try {
      if (current.apiKey === null && current.language === "english") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
    } catch {
      // Not persisted; still works until the tab closes.
    }
    listeners.forEach((l) => l());
  }, []);

  return [settings, update] as const;
}
