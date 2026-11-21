"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUrlSync } from "@/hooks/useUrlSync";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import Link from "next/link";
import { TREE_OPS, type TreeOpKey } from "@/lib/trees";
import { useTreePlayer } from "@/hooks/useTreePlayer";
import { TreeCanvas } from "@/components/TreeCanvas";
import { FrameCaption } from "@/components/StepNarration";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { TreeControls } from "@/components/TreeControls";
import { AlgorithmInfoCard } from "@/components/AlgorithmInfoCard";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { treeInput } from "@/lib/tutor/agent";
import { TREES_CODE } from "@/lib/code/trees";
import { TREE_LIMITS, intFromParam, intListFromParam } from "@/lib/inputs";

type TreeVisualizerProps = {
  opKey: TreeOpKey;
};

export function TreeVisualizer({ opKey }: TreeVisualizerProps) {
  // The prerendered HTML shows the default run; a shared link's input
  // (?values=…&target=…) is read on the client, inside this boundary.
  return (
    <Suspense fallback={<TreeVisualizerInner key={opKey} opKey={opKey} />}>
      <TreeVisualizerFromUrl key={opKey} opKey={opKey} />
    </Suspense>
  );
}

function TreeVisualizerFromUrl({ opKey }: { opKey: TreeOpKey }) {
  const searchParams = useSearchParams();
  return (
    <TreeVisualizerInner
      opKey={opKey}
      initialValues={intListFromParam(searchParams.get("values"), TREE_LIMITS)}
      initialTarget={intFromParam(
        searchParams.get("target"),
        TREE_LIMITS.minValue,
        TREE_LIMITS.maxValue,
      )}
    />
  );
}

function TreeVisualizerInner({
  opKey,
  initialValues,
  initialTarget,
}: {
  opKey: TreeOpKey;
  initialValues?: number[];
  initialTarget?: number;
}) {
  const meta = TREE_OPS[opKey];
  const player = useTreePlayer({ op: opKey, initialValues, initialTarget });
  useUrlSync({
    values: player.values.join(","),
    target: meta.needsTarget && player.target !== null ? String(player.target) : null,
  });
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
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="heading-slab text-3xl sm:text-4xl">{meta.name}</h1>
            <ShareLinkButton />
          </div>
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
        <PseudocodePanel
          pseudocode={meta.pseudocode}
          line={frame.line}
          code={TREES_CODE[opKey]}
        />
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

      <TutorPanel
        context={{
          topic: "Trees",
          algorithmName: meta.name,
          input: `BST built by inserting [${player.values.join(", ")}] in order${meta.needsTarget && player.target !== null ? `, target = ${player.target}` : ""}`,
          pseudocode: meta.pseudocode,
          code: TREES_CODE[opKey],
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
          input: treeInput(
            player.apply,
            () => ({ values: player.values, target: player.target }),
            meta.needsTarget,
          ),
        }}
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
