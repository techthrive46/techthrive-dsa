"use client";

import { useEffect, useMemo, useState } from "react";
import { buildFrames } from "@/lib/sorting";

const SEED = [6, 2, 9, 4, 11, 7, 3, 8];

export function HeroDemo() {
  const frames = useMemo(() => buildFrames(SEED, "bubble"), []);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % frames.length), 520);
    return () => clearInterval(t);
  }, [frames.length]);

  const frame = frames[i]!;
  const max = Math.max(...SEED);

  return (
    <div className="paper-sheet rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          live preview
        </p>
        <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-bar-swap" />
          bubble sort
        </span>
      </div>

      <div className="relative mt-4 h-44">
        {frame.array.map((item, idx) => {
          const state = frame.swapping.includes(idx)
            ? "var(--bar-swap)"
            : frame.comparing.includes(idx)
              ? "var(--bar-compare)"
              : frame.sorted.includes(idx)
                ? "var(--bar-sorted)"
                : "var(--bar)";
          const slot = 100 / frame.array.length;
          return (
            <div
              key={item.id}
              className="absolute bottom-0 rounded-t-md transition-all duration-300 ease-out"
              style={{
                left: `${idx * slot + slot * 0.15}%`,
                width: `${slot * 0.7}%`,
                height: `${(item.value / max) * 100}%`,
                backgroundColor: state,
              }}
            />
          );
        })}
      </div>

      <p className="script-note mt-3 text-xl text-primary">{frame.note}</p>
    </div>
  );
}
