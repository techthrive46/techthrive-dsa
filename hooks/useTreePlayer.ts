"use client";

import { useCallback, useMemo, useState } from "react";
import { TREE_OPS, buildTreeFrames, type TreeOpKey } from "@/lib/trees";
import { useFramePlayer } from "@/hooks/useFramePlayer";

function randomUniqueValues(count: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

type UseTreePlayerOptions = {
  op: TreeOpKey;
  initialValues?: number[];
  initialTarget?: number;
};

export function useTreePlayer({ op, initialValues, initialTarget }: UseTreePlayerOptions) {
  const meta = TREE_OPS[op];
  const [values, setValuesState] = useState<number[]>(initialValues ?? meta.defaultValues);
  const [target, setTargetState] = useState<number | null>(
    initialTarget ?? meta.defaultTarget ?? null,
  );

  const frames = useMemo(
    () => buildTreeFrames(op, values, meta.needsTarget ? target : null),
    [op, values, target, meta.needsTarget],
  );
  const player = useFramePlayer(frames);
  const { reset } = player;

  const apply = useCallback(
    (nextValues: number[], nextTarget: number | null) => {
      reset();
      setValuesState(nextValues);
      if (meta.needsTarget) setTargetState(nextTarget);
    },
    [reset, meta.needsTarget],
  );

  const randomize = useCallback(() => {
    const count = 5 + Math.floor(Math.random() * 3);
    const nextValues = randomUniqueValues(count, 1, 99);
    let nextTarget: number | null = null;
    if (meta.needsTarget) {
      const useExisting = Math.random() < 0.5;
      nextTarget = useExisting
        ? nextValues[Math.floor(Math.random() * nextValues.length)]!
        : (randomUniqueValues(5, 1, 99).find((v) => !nextValues.includes(v)) ?? 50);
    }
    apply(nextValues, nextTarget);
  }, [meta.needsTarget, apply]);

  return {
    ...player,
    values,
    target,
    apply,
    randomize,
  };
}
