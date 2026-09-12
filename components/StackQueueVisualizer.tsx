"use client";

import Link from "next/link";
import { STRUCTURES, type StructureKey } from "@/lib/stacksQueues";
import { useStackQueuePlayer } from "@/hooks/useStackQueuePlayer";
import { StackCanvas } from "@/components/StackCanvas";
import { QueueCanvas } from "@/components/QueueCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { StackQueueControls } from "@/components/StackQueueControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";

type StackQueueVisualizerProps = {
  structureKey: StructureKey;
};

export function StackQueueVisualizer({ structureKey }: StackQueueVisualizerProps) {
  return <StackQueueVisualizerInner key={structureKey} structureKey={structureKey} />;
}

function StackQueueVisualizerInner({ structureKey }: { structureKey: StructureKey }) {
  const meta = STRUCTURES[structureKey];
  const player = useStackQueuePlayer({ structure: structureKey });
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
          <h1 className="heading-slab mt-1 text-3xl sm:text-4xl">{meta.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Legend color="var(--bar-compare)" label={isStack ? "Pushed" : "Enqueued"} />
          <Legend color="var(--bar-swap)" label={isStack ? "Popping" : "Dequeuing"} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {isStack ? <StackCanvas frame={frame} /> : <QueueCanvas frame={frame} />}
        <PseudocodePanel pseudocode={meta.pseudocode} line={frame.line} />
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
