"use client";

import { motion } from "framer-motion";
import type { Frame } from "@/lib/sorting";

type VisualizerCanvasProps = {
  frame: Frame;
};

function getBarColor(index: number, frame: Frame): string {
  if (frame.swapping.includes(index)) return "var(--bar-swap)";
  if (frame.pivot === index) return "var(--bar-pivot)";
  if (frame.comparing.includes(index)) return "var(--bar-compare)";
  if (frame.sorted.includes(index)) return "var(--bar-sorted)";
  return "var(--bar)";
}

export function VisualizerCanvas({ frame }: VisualizerCanvasProps) {
  const max = Math.max(...frame.array.map((item) => item.value), 1);
  const counts = frame.counts;
  const activeCountIndex = frame.activeCountIndex;
  const buckets = frame.buckets;
  const {
    minPointer,
    keyIndex,
    gap,
    direction,
    digitPlace,
    heapSize,
    gnomePos,
    pivot,
  } = frame;

  return (
    <div className="paper-sheet flex flex-col gap-6 rounded-xl p-5 sm:p-6">
      {/* Main Array Bar Visualizer */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Main Array Workflow
          </span>

          {/* Workflow Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {minPointer !== null && minPointer !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                Min: {frame.array[minPointer]?.value ?? minPointer} (idx {minPointer})
              </span>
            )}

            {keyIndex !== null && keyIndex !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                Key: {frame.array[keyIndex]?.value ?? keyIndex}
              </span>
            )}

            {gap !== null && gap !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                Gap = {gap}
              </span>
            )}

            {direction && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {direction === "forward" ? "Forward L→R ➡️" : "Backward R←L ⬅️"}
              </span>
            )}

            {digitPlace !== null && digitPlace !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-indigo-500/15 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Place = {digitPlace}s
              </span>
            )}

            {heapSize !== null && heapSize !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-teal-500/15 px-2 py-0.5 font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                Heap Size = {heapSize}
              </span>
            )}

            {gnomePos !== null && gnomePos !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                Gnome Pos = {gnomePos}
              </span>
            )}

            {pivot !== null && pivot !== undefined && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                Pivot = {frame.array[pivot]?.value}
              </span>
            )}
          </div>
        </div>

        <div className="relative h-56 sm:h-64">
          {/* Shell Sort SVG Gap Arc Overlay */}
          {gap !== null && gap !== undefined && (frame.comparing.length === 2 || frame.swapping.length === 2) && (
            <svg className="absolute inset-0 size-full pointer-events-none overflow-visible z-10" style={{ strokeWidth: 2 }}>
              {(() => {
                const activePair = frame.swapping.length === 2 ? frame.swapping : frame.comparing;
                const [i1, i2] = activePair.sort((a, b) => a - b);
                const n = frame.array.length;
                const x1 = ((i1 + 0.5) / n) * 100;
                const x2 = ((i2 + 0.5) / n) * 100;
                return (
                  <path
                    d={`M ${x1}% 120 Q ${(x1 + x2) / 2}% 20 ${x2}% 120`}
                    fill="none"
                    stroke={frame.swapping.length === 2 ? "var(--bar-swap)" : "var(--bar-compare)"}
                    strokeWidth="3"
                    strokeDasharray="6 3"
                  />
                );
              })()}
            </svg>
          )}

          <div className="absolute inset-0 flex items-end justify-around gap-2 px-1 pb-6 sm:gap-3 sm:px-2">
            {frame.array.map((item, index) => {
              const isMin = minPointer === index;
              const isKey = keyIndex === index;
              const isPivot = pivot === index;
              const isGnome = gnomePos === index;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  {/* Floating Pointer Tag */}
                  {(isMin || isKey || isPivot || isGnome) && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm ${
                        isMin
                          ? "bg-amber-500"
                          : isKey
                            ? "bg-blue-500"
                            : isPivot
                              ? "bg-rose-500"
                              : "bg-teal-500"
                      }`}
                    >
                      {isMin ? "min" : isKey ? "key" : isPivot ? "pivot" : "gnome"}
                    </motion.span>
                  )}

                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="w-full max-w-14 rounded-t-md sm:max-w-16"
                    style={{
                      height: `${(item.value / max) * 100}%`,
                      backgroundColor: getBarColor(index, frame),
                      minHeight: 8,
                    }}
                    animate={{
                      scale: frame.swapping.includes(index) ? 1.06 : 1,
                    }}
                  />
                  <span className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cocktail Shaker Directional Pass Visualizer */}
      {direction && (
        <div className="border-t border-dashed border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Cocktail Shaker Pass Direction
            </h4>
            <span className="text-xs text-muted-foreground">
              Alternates left-to-right & right-to-left
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 font-mono text-xs font-bold text-white ${direction === "forward" ? "bg-emerald-600" : "bg-blue-600"}`}>
                {direction === "forward" ? "Pass 1: Left → Right ➡️" : "Pass 2: Right → Left ⬅️"}
              </span>
              <span className="text-xs font-bold text-foreground">
                {direction === "forward"
                  ? "Bubbling largest element right to the end"
                  : "Sinking smallest element left to the start"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Turtles (small values near the end) move left fast in backward passes!
            </p>
          </div>
        </div>
      )}

      {/* Shell Sort Gap Sub-sequences Visualizer */}
      {gap !== null && gap !== undefined && (
        <div className="border-t border-dashed border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Shell Sort Gap Sub-Sequences <span className="font-sans normal-case text-muted-foreground">(gap = {gap})</span>
            </h4>
            <span className="text-xs text-muted-foreground">
              {gap > 1 ? `Elements ${gap} steps apart are sorted together` : "Final pass (gap = 1): Standard insertion sort on nearly-sorted data"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: gap }, (_, trackIdx) => {
              const trackIndices: number[] = [];
              for (let idx = trackIdx; idx < frame.array.length; idx += gap) {
                trackIndices.push(idx);
              }
              return (
                <div key={trackIdx} className="flex flex-col gap-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-2.5">
                  <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-300">
                    Gap Track {trackIdx + 1}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {trackIndices.map((idx) => {
                      const item = frame.array[idx]!;
                      const isActive = frame.comparing.includes(idx) || frame.swapping.includes(idx);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-bold transition-all ${
                            isActive
                              ? "bg-purple-500 text-white shadow-sm scale-105"
                              : "bg-card border border-border text-foreground"
                          }`}
                        >
                          a[{idx}] = {item.value}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auxiliary Counting Array Visualizer */}
      {counts && counts.length > 0 && (
        <div className="border-t border-dashed border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              Auxiliary Frequency Array: <span className="font-sans normal-case text-muted-foreground">count[0…{counts.length - 1}]</span>
            </h4>
            <span className="text-xs text-muted-foreground">
              {activeCountIndex !== null && activeCountIndex !== undefined
                ? `Active index count[${activeCountIndex}]`
                : "Initial state"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {counts.map((count, valIndex) => {
              const isActive = activeCountIndex === valIndex;
              return (
                <motion.div
                  key={valIndex}
                  layout
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`flex min-w-[3rem] flex-1 flex-col items-center rounded-lg border p-2 text-center transition-colors sm:min-w-[3.5rem] ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/60"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    Val {valIndex}
                  </span>
                  <span
                    className={`font-mono text-base font-bold ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {count}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/70">
                    count[{valIndex}]
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auxiliary Buckets Visualizer (for Bucket & Radix Sort) */}
      {buckets && buckets.length > 0 && (
        <div className="border-t border-dashed border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              Auxiliary Buckets Partitioning
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {buckets.map((b, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-card/50 p-2.5"
              >
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {b.label}
                </span>
                <div className="flex min-h-[2rem] flex-wrap items-center gap-1.5">
                  {b.values.length > 0 ? (
                    b.values.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary"
                      >
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-[11px] italic text-muted-foreground/50">
                      empty
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Auxiliary Heap Binary Tree Visualizer */}
      {heapSize !== null && heapSize !== undefined && (
        <div className="border-t border-dashed border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              Max-Heap Binary Tree View <span className="font-sans normal-case text-muted-foreground">(Parent ≥ Children)</span>
            </h4>
            <span className="text-xs text-muted-foreground">
              Heap Size: {heapSize} / {frame.array.length}
            </span>
          </div>

          <div className="relative min-h-[160px] w-full rounded-lg border border-border bg-card/40 p-4">
            <svg className="absolute inset-0 size-full pointer-events-none stroke-border/70" style={{ strokeWidth: 2 }}>
              {frame.array.map((_, i) => {
                if (i === 0) return null;
                const p = Math.floor((i - 1) / 2);
                const pDepth = Math.floor(Math.log2(p + 1));
                const pPos = (p + 1) - Math.pow(2, pDepth);
                const pMax = Math.pow(2, pDepth);
                const px = ((pPos + 0.5) / pMax) * 100;
                const py = pDepth * 44 + 22;

                const depth = Math.floor(Math.log2(i + 1));
                const pos = (i + 1) - Math.pow(2, depth);
                const maxInDepth = Math.pow(2, depth);
                const cx = ((pos + 0.5) / maxInDepth) * 100;
                const cy = depth * 44 + 22;

                return (
                  <line
                    key={`edge-${i}`}
                    x1={`${px}%`}
                    y1={py}
                    x2={`${cx}%`}
                    y2={cy}
                    strokeDasharray={i >= heapSize ? "4 3" : undefined}
                  />
                );
              })}
            </svg>

            <div className="relative min-h-[150px] w-full">
              {frame.array.map((item, i) => {
                const depth = Math.floor(Math.log2(i + 1));
                const pos = (i + 1) - Math.pow(2, depth);
                const maxInDepth = Math.pow(2, depth);
                const cx = ((pos + 0.5) / maxInDepth) * 100;
                const cy = depth * 44;

                const isExcluded = i >= heapSize;
                const isComparing = frame.comparing.includes(i);
                const isSwapping = frame.swapping.includes(i);

                let bgClass = "bg-card border-primary text-foreground";
                if (isExcluded) {
                  bgClass = "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60";
                } else if (isSwapping) {
                  bgClass = "bg-rose-500 border-rose-500 text-white font-bold shadow-md scale-110";
                } else if (isComparing) {
                  bgClass = "bg-amber-500 border-amber-500 text-white font-bold shadow-md scale-105";
                }

                return (
                  <motion.div
                    key={`${item.id}-${i}`}
                    layout
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    style={{
                      left: `${cx}%`,
                      top: `${cy}px`,
                      transform: "translate(-50%, 0)",
                    }}
                    className={`absolute flex size-8 items-center justify-center rounded-full border-2 text-xs font-mono font-bold shadow-sm transition-all ${bgClass}`}
                  >
                    {item.value}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

