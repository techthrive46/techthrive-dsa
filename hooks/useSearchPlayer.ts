"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildSearchFrames,
  prepareArray,
  randomSearchArray,
  randomTarget,
  MAX_TARGET,
  MIN_TARGET,
  type SearchAlgoKey,
} from "@/lib/searching";
import { useFramePlayer } from "@/hooks/useFramePlayer";

const DEFAULTS: Record<SearchAlgoKey, { array: number[]; target: number }> = {
  linear: { array: [7, 2, 14, 9, 4, 18, 11, 5], target: 18 },
  binary: { array: [2, 4, 6, 9, 12, 15, 18, 20], target: 15 },
};

type UseSearchPlayerOptions = {
  algo: SearchAlgoKey;
};

export function useSearchPlayer({ algo }: UseSearchPlayerOptions) {
  const [array, setArrayState] = useState<number[]>(DEFAULTS[algo].array);
  const [target, setTargetState] = useState<number>(DEFAULTS[algo].target);

  const frames = useMemo(
    () => buildSearchFrames(array, target, algo),
    [array, target, algo],
  );
  const player = useFramePlayer(frames);
  const { reset } = player;

  const setArray = useCallback(
    (next: number[]) => {
      reset();
      setArrayState(next);
    },
    [reset],
  );

  const setTarget = useCallback(
    (next: number) => {
      reset();
      setTargetState(Math.min(MAX_TARGET, Math.max(MIN_TARGET, Math.round(next))));
    },
    [reset],
  );

  const randomize = useCallback(() => {
    const next = randomSearchArray(array.length, algo);
    reset();
    setArrayState(next);
    setTargetState(randomTarget(next));
  }, [algo, array.length, reset]);

  return {
    ...player,
    array: prepareArray(array, algo),
    target,
    setArray,
    setTarget,
    randomize,
  };
}
