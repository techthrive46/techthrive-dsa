"use client";

import { motion } from "framer-motion";
import type { PegId, Towers } from "@/lib/recursion";

const PEG_ORDER: PegId[] = ["A", "B", "C"];
const DISK_HEIGHT = 22;
const DISK_GAP = 4;
const MIN_DISK_WIDTH = 44;
const DISK_WIDTH_STEP = 16;
const BASE_HEIGHT = 10;
const DISK_COLORS = [
  "var(--bar)",
  "var(--bar-compare)",
  "var(--bar-swap)",
  "var(--bar-pivot)",
];

export function HanoiTowersCanvas({ towers }: { towers: Towers }) {
  const { pegs, totalDisks, move } = towers;
  const poleHeight = totalDisks * (DISK_HEIGHT + DISK_GAP) + 24;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          towers
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          move n-1 out of the way, move disk n, move n-1 back on
        </p>
      </div>

      <div className="mt-6 flex items-end justify-around gap-4">
        {PEG_ORDER.map((peg) => {
          const active = move?.from === peg || move?.to === peg;
          return (
            <div key={peg} className="flex flex-col items-center gap-2">
              <div
                className="relative flex w-full flex-col-reverse items-center"
                style={{ height: poleHeight, minWidth: MIN_DISK_WIDTH + 24 }}
              >
                <div
                  className={`absolute bottom-0 z-0 w-2 rounded-t-full transition-colors duration-300 ${
                    active ? "bg-primary" : "bg-foreground/60"
                  }`}
                  style={{ height: poleHeight - BASE_HEIGHT }}
                />
                <div
                  className={`absolute bottom-0 z-0 h-2.5 w-full rounded transition-colors duration-300 ${
                    active ? "bg-primary" : "bg-foreground/60"
                  }`}
                />

                {pegs[peg].map((size) => (
                  <motion.div
                    key={`disk-${size}`}
                    layoutId={`disk-${size}`}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="relative z-10 mb-1 flex items-center justify-center rounded-md border border-foreground/30 font-mono text-xs font-bold text-primary-foreground shadow-sm"
                    style={{
                      width: MIN_DISK_WIDTH + (size - 1) * DISK_WIDTH_STEP,
                      height: DISK_HEIGHT,
                      backgroundColor: DISK_COLORS[(size - 1) % DISK_COLORS.length],
                    }}
                  >
                    {size}
                  </motion.div>
                ))}
              </div>
              <span className="heading-slab text-lg">{peg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
