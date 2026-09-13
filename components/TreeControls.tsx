"use client";

import { useRef, useState } from "react";
import { Pause, Play, Shuffle, SkipBack, SkipForward, RotateCcw } from "lucide-react";

type TreeControlsProps = {
  isPlaying: boolean;
  isAtEnd: boolean;
  currentIndex: number;
  totalFrames: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onRandomize: () => void;
  values: number[];
  needsTarget: boolean;
  target: number | null;
  onApply: (values: number[], target: number | null) => void;
};

const MIN_SIZE = 3;
const MAX_SIZE = 9;
const MIN_VALUE = 1;
const MAX_VALUE = 99;

function parseValues(
  input: string,
): { ok: true; values: number[] } | { ok: false; error: string } {
  const parts = input
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < MIN_SIZE || parts.length > MAX_SIZE) {
    return { ok: false, error: `Enter ${MIN_SIZE}–${MAX_SIZE} numbers.` };
  }

  const values: number[] = [];
  const seen = new Set<number>();
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < MIN_VALUE || n > MAX_VALUE) {
      return { ok: false, error: `Values must be integers from ${MIN_VALUE} to ${MAX_VALUE}.` };
    }
    if (seen.has(n)) {
      return { ok: false, error: `"${n}" is repeated — BST values must be unique.` };
    }
    seen.add(n);
    values.push(n);
  }
  return { ok: true, values };
}

export function TreeControls({
  isPlaying,
  isAtEnd,
  currentIndex,
  totalFrames,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onRandomize,
  values,
  needsTarget,
  target,
  onApply,
}: TreeControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const valuesRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef<HTMLInputElement | null>(null);
  const valuesText = values.join(", ");

  const handleApply = () => {
    const raw = valuesRef.current?.value ?? "";
    const result = parseValues(raw);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    let nextTarget: number | null = null;
    if (needsTarget) {
      const t = Number(targetRef.current?.value ?? "");
      if (!Number.isInteger(t) || t < MIN_VALUE || t > MAX_VALUE) {
        setError(`Target must be an integer from ${MIN_VALUE} to ${MAX_VALUE}.`);
        return;
      }
      nextTarget = t;
    }

    setError(null);
    onApply(result.values, nextTarget);
  };

  return (
    <div className="paper-sheet space-y-4 rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="ink-lift inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
        >
          {isPlaying ? (
            <>
              <Pause className="size-4" /> Pause
            </>
          ) : (
            <>
              <Play className="size-4" /> {isAtEnd ? "Replay" : "Play"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onStepBackward}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipBack className="size-4" /> Back
        </button>

        <button
          type="button"
          onClick={onStepForward}
          disabled={isAtEnd}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SkipForward className="size-4" /> Forward
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
        >
          <RotateCcw className="size-4" /> Reset
        </button>

        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
        >
          <Shuffle className="size-4" /> Randomize
        </button>

        <div className="ml-auto flex min-w-[180px] flex-1 items-center gap-3 sm:max-w-xs">
          <label htmlFor="speed" className="shrink-0 text-sm font-bold text-muted-foreground">
            Speed
          </label>
          <input
            id="speed"
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="w-6 text-right font-mono text-sm font-bold">{speed}</span>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full border border-border bg-background/60">
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{
            width: `${totalFrames > 1 ? (currentIndex / (totalFrames - 1)) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-dashed border-border pt-4 sm:flex-row sm:items-center">
        <label htmlFor="tree-values" className="shrink-0 text-sm font-bold text-muted-foreground">
          Tree values
        </label>
        <input
          key={valuesText}
          ref={valuesRef}
          id="tree-values"
          type="text"
          defaultValue={valuesText}
          onChange={() => setError(null)}
          placeholder="e.g. 50, 30, 70, 20, 40"
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm outline-none focus:border-primary"
        />
        {needsTarget ? (
          <>
            <label htmlFor="tree-target" className="shrink-0 text-sm font-bold text-muted-foreground">
              Target
            </label>
            <input
              key={`target-${target}`}
              ref={targetRef}
              id="tree-target"
              type="number"
              min={MIN_VALUE}
              max={MAX_VALUE}
              defaultValue={target ?? undefined}
              onChange={() => setError(null)}
              className="w-24 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
          </>
        ) : null}
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:bg-accent"
        >
          Apply
        </button>
      </div>
      {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}

      <p className="font-mono text-xs text-muted-foreground">
        {MIN_SIZE}–{MAX_SIZE} unique integers, {MIN_VALUE}–{MAX_VALUE} each — inserted in
        order to build the starting tree.
      </p>
    </div>
  );
}
