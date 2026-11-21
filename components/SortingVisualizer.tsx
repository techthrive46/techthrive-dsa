"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import Link from "next/link";
import { ALGOS, type AlgoKey } from "@/lib/sorting";
import { usePlayer } from "@/hooks/usePlayer";
import { VisualizerCanvas } from "@/components/VisualizerCanvas";
import { MergeTreeCanvas } from "@/components/MergeTreeCanvas";
import { QuickTreeCanvas } from "@/components/QuickTreeCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { PlaybackControls } from "@/components/PlaybackControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { sortingInput } from "@/lib/tutor/agent";
import { SORTING_CODE } from "@/lib/code/sorting";
import { ARRAY_LIMITS, intListFromParam } from "@/lib/inputs";

type SortingVisualizerProps = {
  algoKey: AlgoKey;
};

export function SortingVisualizer({ algoKey }: SortingVisualizerProps) {
  // The prerendered HTML shows the default run; a shared link's input
  // (?arr=…) is read on the client, inside this boundary.
  return (
    <Suspense fallback={<SortingVisualizerInner key={algoKey} algoKey={algoKey} />}>
      <SortingVisualizerFromUrl key={algoKey} algoKey={algoKey} />
    </Suspense>
  );
}

function SortingVisualizerFromUrl({ algoKey }: { algoKey: AlgoKey }) {
  const searchParams = useSearchParams();
  const initialArray = intListFromParam(searchParams.get("arr"), ARRAY_LIMITS);
  return <SortingVisualizerInner algoKey={algoKey} initialArray={initialArray} />;
}

function SortingVisualizerInner({
  algoKey,
  initialArray,
}: {
  algoKey: AlgoKey;
  initialArray?: number[];
}) {
  const algo = ALGOS[algoKey];
  const player = usePlayer({ algo: algoKey, initialArray });
  useUrlSync({ arr: player.array.join(",") });
  const tree = player.currentFrame.tree;

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/sorting"
            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All sorting algorithms
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="heading-slab text-3xl sm:text-4xl">{algo.name}</h1>
            <ShareLinkButton />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          {tree?.kind === "merge" ? (
            <>
              <Legend color="var(--bar-compare)" label="Splitting" />
              <Legend color="var(--bar-swap)" label="Merging" />
              <Legend color="var(--bar-sorted)" label="Sorted run" />
            </>
          ) : tree?.kind === "quick" ? (
            <>
              <Legend color="var(--bar-pivot)" label="Pivot" />
              <Legend color="var(--bar-compare)" label="Partitioning" />
              <Legend color="var(--bar-swap)" label="Pivot placed" />
              <Legend color="var(--bar-sorted)" label="Sorted" />
            </>
          ) : (
            <>
              <Legend color="var(--bar)" label="Default" />
              <Legend color="var(--bar-compare)" label="Comparing" />
              <Legend color="var(--bar-swap)" label="Swapping" />
              <Legend color="var(--bar-pivot)" label="Pivot" />
              <Legend color="var(--bar-sorted)" label="Sorted" />
            </>
          )}
        </div>
      </header>

      <div
        className={`grid gap-6 ${tree ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-[1.5fr_1fr]"}`}
      >
        {tree?.kind === "merge" ? (
          <MergeTreeCanvas tree={tree} />
        ) : tree?.kind === "quick" ? (
          <QuickTreeCanvas tree={tree} />
        ) : (
          <VisualizerCanvas frame={player.currentFrame} />
        )}
        <PseudocodePanel
          pseudocode={algo.pseudocode}
          line={player.currentFrame.line}
          code={SORTING_CODE[algoKey]}
        />
      </div>

      <FrameCaption
        caption={player.currentFrame.caption}
        note={player.currentFrame.note}
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
      />

      <TutorPanel
        context={{
          topic: "Sorting",
          algorithmName: algo.name,
          input: `array = [${player.array.join(", ")}]`,
          pseudocode: algo.pseudocode,
          code: SORTING_CODE[algoKey],
          stepIndex: player.currentIndex,
          totalSteps: player.totalFrames,
          frame: player.currentFrame,
          previousCaption: player.frames[player.currentIndex - 1]?.caption,
        }}
        agent={{
          frames: player.frames,
          goTo: player.goTo,
          play: player.play,
          pause: player.pause,
          setSpeed: player.setSpeed,
          input: sortingInput(player.setArray),
        }}
      />

      <AlgorithmInfoCard
        name={algo.name}
        blurb={algo.blurb}
        time={algo.time}
        space={algo.space}
        stats={[
          { label: "Stable", value: algo.stable ? "Yes" : "No" },
          { label: "In-place", value: algo.inPlace ? "Yes" : "No" },
          { label: "Comparisons", value: player.currentFrame.comparisons },
          { label: "Swaps", value: player.currentFrame.swaps },
        ]}
      />
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground">
      <span className="inline-block size-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
