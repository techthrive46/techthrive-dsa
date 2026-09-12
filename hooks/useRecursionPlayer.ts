"use client";

import { useCallback, useMemo, useState } from "react";
import {
  RECURSION_ALGOS,
  buildRecursionFrames,
  type RecursionAlgoKey,
} from "@/lib/recursion";
import { useFramePlayer } from "@/hooks/useFramePlayer";

type UseRecursionPlayerOptions = {
  algo: RecursionAlgoKey;
};

export function useRecursionPlayer({ algo }: UseRecursionPlayerOptions) {
  const meta = RECURSION_ALGOS[algo];
  const [params, setParamsState] = useState<number[]>(meta.defaultParams);
  const frames = useMemo(() => buildRecursionFrames(algo, params), [algo, params]);
  const player = useFramePlayer(frames);
  const { reset } = player;

  const setParams = useCallback(
    (next: number[]) => {
      reset();
      setParamsState(next);
    },
    [reset],
  );

  const randomize = useCallback(() => {
    const next = meta.paramLabels.map((_, i) => {
      const min = meta.minParams[i]!;
      const max = meta.maxParams[i]!;
      return min + Math.floor(Math.random() * (max - min + 1));
    });
    setParams(next);
  }, [meta, setParams]);

  return {
    ...player,
    params,
    setParams,
    randomize,
  };
}
