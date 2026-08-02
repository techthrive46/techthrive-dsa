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

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="relative h-64 sm:h-80">
        <div className="absolute inset-0 flex items-end justify-around gap-2 px-1 pb-6 sm:gap-3 sm:px-2">
          {frame.array.map((item, index) => (
            <div
              key={item.id}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
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
          ))}
        </div>
      </div>
    </div>
  );
}
