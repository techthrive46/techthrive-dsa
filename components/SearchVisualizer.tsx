"use client";

import Link from "next/link";
import {
  MAX_TARGET,
  MIN_TARGET,
  SEARCH_ALGOS,
  type SearchAlgoKey,
} from "@/lib/searching";
import { useSearchPlayer } from "@/hooks/useSearchPlayer";
import { SearchCanvas } from "@/components/SearchCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { PlaybackControls } from "@/components/PlaybackControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";

type SearchVisualizerProps = {
  algoKey: SearchAlgoKey;
};

export function SearchVisualizer({ algoKey }: SearchVisualizerProps) {
  return <SearchVisualizerInner key={algoKey} algoKey={algoKey} />;
}

function SearchVisualizerInner({ algoKey }: { algoKey: SearchAlgoKey }) {
  const algo = SEARCH_ALGOS[algoKey];
  const player = useSearchPlayer({ algo: algoKey });
  const frame = player.currentFrame;

  const result =
    frame.status === "found"
      ? `index ${frame.found}`
      : frame.status === "missing"
        ? "-1"
        : "searching…";

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/searching"
            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All searching algorithms
          </Link>
          <h1 className="heading-slab mt-1 text-3xl sm:text-4xl">{algo.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Legend color="var(--bar-compare)" label="Checking" />
          <Legend color="var(--border)" label="Ruled out" />
          <Legend color="var(--bar-sorted)" label="Found" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <SearchCanvas frame={frame} pointerLabel={algo.pointerLabel} />
        <PseudocodePanel pseudocode={algo.pseudocode} line={frame.line} />
      </div>

      <FrameCaption
        caption={frame.caption}
        note={frame.note}
        frameIndex={player.currentIndex}
        totalFrames={player.totalFrames}
      />

      <PlaybackControls
        isPlaying={player.isPlaying}
        isAtEnd={player.isAtEnd}
        currentIndex={player.currentIndex}
        totalFrames={player.totalFrames}
        speed={player.speed}
        onPlay={player.play}
        onPause={player.pause}
        onStepForward={player.stepForward}
        onStepBackward={player.stepBackward}
        onReset={player.reset}
        onSpeedChange={player.setSpeed}
        onRandomize={player.randomize}
        onSetArray={player.setArray}
        defaultArrayText={player.array.join(", ")}
        hint={
          algo.needsSorted
            ? `3–16 integers between ${MIN_TARGET} and ${MAX_TARGET} — the array is sorted for you, because binary search needs ordered data.`
            : `3–16 integers between ${MIN_TARGET} and ${MAX_TARGET}.`
        }
      >
        <div className="flex flex-col gap-2 border-t border-dashed border-border pt-4 sm:flex-row sm:items-center">
          <label
            htmlFor="target"
            className="shrink-0 text-sm font-bold text-muted-foreground"
          >
            Target
          </label>
          <input
            id="target"
            type="number"
            min={MIN_TARGET}
            max={MAX_TARGET}
            value={player.target}
            onChange={(event) => {
              if (event.target.value === "") return;
              player.setTarget(Number(event.target.value));
            }}
            className="w-24 rounded-md border border-border bg-card px-3 py-2 font-mono text-sm outline-none focus:border-primary"
          />
          <p className="text-sm text-muted-foreground">
            Pick a value that is in the array — or one that isn&apos;t, to watch
            the search fail.
          </p>
        </div>
      </PlaybackControls>

      <AlgorithmInfoCard
        name={algo.name}
        blurb={algo.blurb}
        time={algo.time}
        space={algo.space}
        stats={[
          { label: "Comparisons", value: frame.comparisons },
          { label: "Result", value: result },
        ]}
      />
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground">
      <span
        className="inline-block size-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
