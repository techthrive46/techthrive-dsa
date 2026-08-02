"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { SearchFrame } from "@/lib/searching";

type SearchCanvasProps = {
  frame: SearchFrame;
  pointerLabel: string;
};

const CELL_MIN_WIDTH = 46;

export function SearchCanvas({ frame, pointerLabel }: SearchCanvasProps) {
  const n = frame.array.length;
  const win = frame.window;
  const ruledOut = new Set(frame.ruledOut);
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          array
        </p>
        <span className="rounded-md border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-sm font-bold">
          target = {frame.target}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="relative" style={{ minWidth: n * CELL_MIN_WIDTH }}>
          <div className="relative h-7">
            {frame.checking !== null ? (
              <motion.div
                className="absolute top-0 flex flex-col items-center text-foreground"
                style={{ x: "-50%" }}
                initial={false}
                animate={{ left: `${((frame.checking + 0.5) / n) * 100}%` }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
              >
                <span className="font-mono text-[11px] font-bold">
                  {pointerLabel}
                </span>
                <ChevronDown className="size-4" />
              </motion.div>
            ) : null}
          </div>

          <div className="relative">
            {win ? (
              <motion.div
                className="pointer-events-none absolute -top-1.5 rounded-lg border-2 border-dashed border-primary/45 bg-primary/5"
                style={{ height: "calc(100% + 0.75rem)" }}
                initial={false}
                animate={{
                  left: `${(win.lo / n) * 100}%`,
                  width: `${((win.hi - win.lo + 1) / n) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            ) : null}

            <div className="grid" style={columns}>
              {frame.array.map((item, index) => (
                <Cell
                  key={item.id}
                  value={item.value}
                  isChecking={frame.checking === index}
                  isFound={frame.found === index}
                  isRuledOut={ruledOut.has(index)}
                />
              ))}
            </div>
          </div>

          <div className="grid" style={columns}>
            {frame.array.map((item, index) => {
              const tag = win
                ? [win.lo === index ? "lo" : null, win.hi === index ? "hi" : null]
                    .filter(Boolean)
                    .join(" ")
                : "";
              return (
                <div key={item.id} className="mt-2 text-center">
                  <span className="block font-mono text-[11px] text-muted-foreground">
                    {index}
                  </span>
                  <span className="block h-4 font-mono text-[10px] font-bold text-primary">
                    {tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({
  value,
  isChecking,
  isFound,
  isRuledOut,
}: {
  value: number;
  isChecking: boolean;
  isFound: boolean;
  isRuledOut: boolean;
}) {
  const tone = isFound
    ? "border-bar-sorted bg-bar-sorted/25 text-foreground"
    : isChecking
      ? "border-bar-compare bg-bar-compare/30 text-foreground"
      : isRuledOut
        ? "border-border/60 bg-background/40 text-muted-foreground/50"
        : "border-border bg-background/70 text-foreground";

  return (
    <div className="px-1">
      <motion.div
        className={`flex h-12 items-center justify-center rounded-md border font-mono text-sm font-bold tabular-nums transition-colors duration-200 sm:h-14 sm:text-base ${tone}`}
        animate={{ scale: isChecking || isFound ? 1.06 : 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
      >
        {value}
      </motion.div>
    </div>
  );
}
