"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import Link from "next/link";
import {
  STRUCTURES,
  scriptToText,
  type Operation,
  type StructureKey,
} from "@/lib/stacksQueues";
import { useStackQueuePlayer } from "@/hooks/useStackQueuePlayer";
import { StackCanvas } from "@/components/StackCanvas";
import { QueueCanvas } from "@/components/QueueCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { StackQueueControls } from "@/components/StackQueueControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { scriptInput } from "@/lib/tutor/agent";
import { STACKS_QUEUES_CODE } from "@/lib/code/stacksQueues";
import { scriptFromParam } from "@/lib/inputs";

type StackQueueVisualizerProps = {
  structureKey: StructureKey;
};

export function StackQueueVisualizer({ structureKey }: StackQueueVisualizerProps) {
  // The prerendered HTML shows the default run; a shared link's input
  // (?ops=…) is read on the client, inside this boundary.
  return (
    <Suspense fallback={<StackQueueVisualizerInner key={structureKey} structureKey={structureKey} />}>
      <StackQueueVisualizerFromUrl key={structureKey} structureKey={structureKey} />
    </Suspense>
  );
}

function StackQueueVisualizerFromUrl({ structureKey }: { structureKey: StructureKey }) {
  const searchParams = useSearchParams();
  const initialScript = scriptFromParam(searchParams.get("ops"), structureKey);
  return (
    <StackQueueVisualizerInner structureKey={structureKey} initialScript={initialScript} />
  );
}

function StackQueueVisualizerInner({
  structureKey,
  initialScript,
}: {
  structureKey: StructureKey;
  initialScript?: Operation[];
}) {
  const meta = STRUCTURES[structureKey];
  const player = useStackQueuePlayer({ structure: structureKey, initialScript });
  useUrlSync({ ops: scriptToText(structureKey, player.script).replace(/, /g, ",") });
  const frame = player.currentFrame;
  const isStack = structureKey === "stack";

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/stacks-queues"
            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All structures
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="heading-slab text-3xl sm:text-4xl">{meta.name}</h1>
            <ShareLinkButton />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Legend color="var(--bar-compare)" label={isStack ? "Pushed" : "Enqueued"} />
          <Legend color="var(--bar-swap)" label={isStack ? "Popping" : "Dequeuing"} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {isStack ? <StackCanvas frame={frame} /> : <QueueCanvas frame={frame} />}
        <PseudocodePanel
          pseudocode={meta.pseudocode}
          line={frame.line}
          code={STACKS_QUEUES_CODE[structureKey]}
        />
      </div>

      <FrameCaption
        caption={frame.caption}
        note={frame.note}
        frameIndex={player.currentIndex}
        totalFrames={player.totalFrames}
      />

      <StackQueueControls
        structure={structureKey}
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
        script={player.script}
        onSetScript={player.setScript}
      />

      <TutorPanel
        context={{
          topic: "Stacks & Queues",
          algorithmName: meta.name,
          input: `operations: ${scriptToText(structureKey, player.script)}`,
          pseudocode: meta.pseudocode,
          code: STACKS_QUEUES_CODE[structureKey],
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
          input: scriptInput(structureKey, player.setScript),
        }}
      />

      <AlgorithmInfoCard
        name={meta.name}
        blurb={meta.blurb}
        time={meta.time}
        space={meta.space}
        stats={[
          { label: "Order", value: meta.order },
          { label: "Size", value: frame.elements.length },
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
