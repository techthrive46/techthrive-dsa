"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import Link from "next/link";
import { RECURSION_ALGOS, type RecursionAlgoKey } from "@/lib/recursion";
import { useRecursionPlayer } from "@/hooks/useRecursionPlayer";
import { CallStackCanvas } from "@/components/CallStackCanvas";
import { CallTreeCanvas } from "@/components/CallTreeCanvas";
import { HanoiTowersCanvas } from "@/components/HanoiTowersCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { RecursionControls } from "@/components/RecursionControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { recursionInput } from "@/lib/tutor/agent";
import { RECURSION_CODE } from "@/lib/code/recursion";
import { paramsFromParam } from "@/lib/inputs";

type RecursionVisualizerProps = {
  algoKey: RecursionAlgoKey;
};

export function RecursionVisualizer({ algoKey }: RecursionVisualizerProps) {
  // The prerendered HTML shows the default run; a shared link's input
  // (?args=…) is read on the client, inside this boundary.
  return (
    <Suspense fallback={<RecursionVisualizerInner key={algoKey} algoKey={algoKey} />}>
      <RecursionVisualizerFromUrl key={algoKey} algoKey={algoKey} />
    </Suspense>
  );
}

function RecursionVisualizerFromUrl({ algoKey }: { algoKey: RecursionAlgoKey }) {
  const searchParams = useSearchParams();
  const algo = RECURSION_ALGOS[algoKey];
  const initialParams = paramsFromParam(
    searchParams.get("args"),
    algo.minParams,
    algo.maxParams,
  );
  return <RecursionVisualizerInner algoKey={algoKey} initialParams={initialParams} />;
}

function RecursionVisualizerInner({
  algoKey,
  initialParams,
}: {
  algoKey: RecursionAlgoKey;
  initialParams?: number[];
}) {
  const algo = RECURSION_ALGOS[algoKey];
  const player = useRecursionPlayer({ algo: algoKey, initialParams });
  useUrlSync({ args: player.params.join(",") });
  const frame = player.currentFrame;

  const hint = algo.paramLabels
    .map((label, i) => `${label}: ${algo.minParams[i]}–${algo.maxParams[i]}`)
    .join(", ");

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/recursion"
            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All recursion topics
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="heading-slab text-3xl sm:text-4xl">{algo.name}</h1>
            <ShareLinkButton />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Legend color="var(--bar-compare)" label="Active" />
          <Legend color="var(--bar-sorted)" label="Returned" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {algo.hasTowers && frame.towers ? (
          <HanoiTowersCanvas towers={frame.towers} />
        ) : (
          <CallStackCanvas stack={frame.stack} />
        )}
        <PseudocodePanel
          pseudocode={algo.pseudocode}
          line={frame.line}
          code={RECURSION_CODE[algoKey]}
        />
      </div>

      {algo.hasTree && frame.tree ? <CallTreeCanvas tree={frame.tree} /> : null}

      <FrameCaption
        caption={frame.caption}
        note={frame.note}
        frameIndex={player.currentIndex}
        totalFrames={player.totalFrames}
      />

      <RecursionControls
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
        paramLabels={algo.paramLabels}
        params={player.params}
        minParams={algo.minParams}
        maxParams={algo.maxParams}
        onSetParams={player.setParams}
        hint={hint}
      />

      <TutorPanel
        context={{
          topic: "Recursion",
          algorithmName: algo.name,
          input: algo.paramLabels.map((label, i) => `${label} = ${player.params[i]}`).join(", "),
          pseudocode: algo.pseudocode,
          code: RECURSION_CODE[algoKey],
          stepIndex: player.currentIndex,
          totalSteps: player.totalFrames,
          frame: frame,
          previousCaption: player.frames[player.currentIndex - 1]?.caption,
        }}
        agent={{
          frames: player.frames,
          goTo: player.goTo,
          play: player.play,
          pause: player.pause,
          setSpeed: player.setSpeed,
          input: recursionInput(algo.paramLabels, algo.minParams, algo.maxParams, player.setParams),
        }}
      />

      <AlgorithmInfoCard
        name={algo.name}
        blurb={algo.blurb}
        time={algo.time}
        space={algo.space}
        stats={[
          { label: "Calls", value: frame.calls },
          { label: "Result", value: frame.result ?? "—" },
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
