"use client";

import { useCallback, useMemo, useState } from "react";
import { buildFrames, randomArray, type AlgoKey } from "@/lib/sorting";
import { useFramePlayer } from "@/hooks/useFramePlayer";

const DEFAULT_ARRAY = [8, 3, 11, 6, 1, 9, 4, 7];

type UsePlayerOptions = {
  algo: AlgoKey;
  initialArray?: number[];
};

export function usePlayer({ algo, initialArray = DEFAULT_ARRAY }: UsePlayerOptions) {
  const [array, setArrayState] = useState<number[]>(initialArray);
  const frames = useMemo(() => buildFrames(array, algo), [array, algo]);
  const player = useFramePlayer(frames);
  const { reset } = player;

  const setArray = useCallback(
    (next: number[]) => {
      reset();
      setArrayState(next);
    },
    [reset],
  );

  const randomize = useCallback(() => {
    setArray(randomArray(8));
  }, [setArray]);

  return {
    ...player,
    array,
    setArray,
    randomize,
  };
}
