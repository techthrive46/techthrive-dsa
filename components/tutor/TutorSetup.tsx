"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, KeyRound, LoaderCircle, Lock } from "lucide-react";
import { connect, GeminiError } from "@/lib/tutor/gemini";

export const AI_STUDIO_KEY_URL = "https://aistudio.google.com/apikey";

type TutorSetupProps = {
  onConnected: (apiKey: string, model: string) => void;
  /** Shown when replacing a key that stopped working. */
  reason?: string;
  onCancel?: () => void;
};

function setupError(e: unknown): string {
  if (!(e instanceof GeminiError)) return "Something went wrong. Please try again.";
  switch (e.kind) {
    case "invalid-key":
      return "Google says this key isn't valid. Copy it again from AI Studio — the whole key, no spaces.";
    case "permission":
      return "This key isn't allowed to use the Gemini API. Create the key in Google AI Studio (link above).";
    case "quota":
      return "The key works, but Gemini's free limit is used up right now. Try again in a minute — daily limits reset at midnight US Pacific time (early afternoon in India).";
    case "network":
      return e.message;
    default:
      return `Couldn't connect: ${e.message}`;
  }
}

export function TutorSetup({ onConnected, reason, onCancel }: TutorSetupProps) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleConnect = async () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Paste your key first.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setChecking(true);
    setError(null);
    try {
      const model = await connect(trimmed, controller.signal);
      onConnected(trimmed, model);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(setupError(e));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-5">
      {reason ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">
          {reason}
        </p>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-background/60 p-4">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            example
          </p>
          <p className="mt-2 text-sm font-bold">“Why did 9 and 4 swap here?”</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bubble Sort compares neighbours. At this step a[2] = 9 and a[3] = 4 — since 9 &gt; 4
            they&apos;re in the wrong order, so they swap, moving the bigger value one place
            closer to the end.
          </p>
        </div>
      )}

      <ol className="space-y-3 text-sm">
        <li className="flex gap-3">
          <Step n={1} />
          <div className="min-w-0">
            <a
              href={AI_STUDIO_KEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-primary underline-offset-4 hover:underline"
            >
              Open Google AI Studio <ExternalLink className="size-3.5" />
            </a>
            <p className="text-muted-foreground">Sign in with any Google account. It&apos;s free.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <Step n={2} />
          <p className="min-w-0">
            Click <strong>Create API key</strong>, then copy the key.
          </p>
        </li>
        <li className="flex gap-3">
          <Step n={3} />
          <div className="min-w-0 flex-1 space-y-2">
            <p>Paste it here:</p>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-0 flex-1 basis-56">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  placeholder="Your Gemini API key"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Gemini API key"
                  className="w-full rounded-md border border-border bg-background py-2 pr-10 pl-9 font-mono text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide key" : "Show key"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={checking}
                className="ink-lift inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-60"
              >
                {checking && <LoaderCircle className="size-4 animate-spin" />}
                {checking ? "Checking key…" : "Connect"}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              )}
            </div>
            {error && (
              <p role="alert" className="text-sm font-bold text-destructive">
                {error}
              </p>
            )}
          </div>
        </li>
      </ol>

      <div className="flex gap-2 border-t border-dashed border-border pt-4 text-xs text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Your key is saved only in this browser and sent only to Google — AlgoThrive has no
          server that sees it. Free keys have daily limits; leave billing off so you&apos;re never
          charged. On the free tier Google may use prompts to improve its products, so ask about
          algorithms, not personal details.
        </p>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-foreground/70 font-mono text-xs font-bold">
      {n}
    </span>
  );
}
