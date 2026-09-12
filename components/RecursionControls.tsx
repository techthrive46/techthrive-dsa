"use client";

import { useRef, useState } from "react";
import { Pause, Play, Shuffle, SkipBack, SkipForward, RotateCcw } from "lucide-react";

type RecursionControlsProps = {
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
  paramLabels: string[];
  params: number[];
  minParams: number[];
  maxParams: number[];
  onSetParams: (params: number[]) => void;
  hint?: string;
};

export function RecursionControls({
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
  paramLabels,
  params,
  minParams,
  maxParams,
  onSetParams,
  hint,
}: RecursionControlsProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleApply = () => {
    const next: number[] = [];
    for (let i = 0; i < paramLabels.length; i++) {
      const raw = inputRefs.current[i]?.value ?? "";
      const n = Number(raw);
      if (!Number.isInteger(n) || n < minParams[i]! || n > maxParams[i]!) {
        setError(
          `${paramLabels[i]} must be an integer from ${minParams[i]} to ${maxParams[i]}.`,
        );
        return;
      }
      next.push(n);
    }
    setError(null);
    onSetParams(next);
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

      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-border pt-4">
        {paramLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <label
              htmlFor={`param-${label}`}
              className="shrink-0 font-mono text-sm font-bold text-muted-foreground"
            >
              {label} =
            </label>
            <input
              key={`${label}-${params[i]}`}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              id={`param-${label}`}
              type="number"
              min={minParams[i]}
              max={maxParams[i]}
              defaultValue={params[i]}
              onChange={() => setError(null)}
              className="w-20 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:bg-accent"
        >
          Apply
        </button>
      </div>
      {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}

      {hint ? <p className="font-mono text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
