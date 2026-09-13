"use client";

import Link from "next/link";
import { TREE_OPS, type TreeOpKey } from "@/lib/trees";
import { useTreePlayer } from "@/hooks/useTreePlayer";
import { TreeCanvas } from "@/components/TreeCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { TreeControls } from "@/components/TreeControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";

type TreeVisualizerProps = {
  opKey: TreeOpKey;
};

export function TreeVisualizer({ opKey }: TreeVisualizerProps) {
  return <TreeVisualizerInner key={opKey} opKey={opKey} />;
}

function TreeVisualizerInner({ opKey }: { opKey: TreeOpKey }) {
  const meta = TREE_OPS[opKey];
  const player = useTreePlayer({ op: opKey });
  const frame = player.currentFrame;
  const isTraversal = opKey === "inorder" || opKey === "preorder" || opKey === "postorder";

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/trees"
            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All tree operations
          </Link>
          <h1 className="heading-slab mt-1 text-3xl sm:text-4xl">{meta.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Legend color="var(--bar-compare)" label={isTraversal ? "Visiting" : "Comparing"} />
          <Legend color="var(--bar-sorted)" label={isTraversal ? "Visited" : "Inserted"} />
          {opKey === "delete" ? <Legend color="var(--bar-swap)" label="Deleted" /> : null}
          {opKey === "avl" ? (
            <>
              <Legend color="var(--bar-swap)" label="Unbalanced" />
              <Legend color="var(--bar-pivot)" label="Rotating" />
            </>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <TreeCanvas tree={frame.tree} />
        <PseudocodePanel pseudocode={meta.pseudocode} line={frame.line} />
      </div>

      {isTraversal ? (
        <div className="paper-sheet rounded-xl p-5">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            output
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {frame.visited.length === 0 ? (
              <span className="text-sm text-muted-foreground">nothing visited yet</span>
            ) : (
              frame.visited.map((v, i) => (
                <span
                  key={i}
                  className="rounded-md border border-bar-sorted bg-bar-sorted/15 px-3 py-1 font-mono text-sm font-bold"
                >
                  {v}
                </span>
              ))
            )}
          </div>
        </div>
      ) : null}

      <FrameCaption
        caption={frame.caption}
        note={frame.note}
        frameIndex={player.currentIndex}
        totalFrames={player.totalFrames}
      />

      <TreeControls
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
        values={player.values}
        needsTarget={meta.needsTarget}
        target={player.target}
        onApply={player.apply}
      />

      <AlgorithmInfoCard
        name={meta.name}
        blurb={meta.blurb}
        time={meta.time}
        space={meta.space}
        stats={[
          { label: "Comparisons", value: frame.comparisons },
          { label: "Nodes", value: frame.tree.nodes.length },
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
