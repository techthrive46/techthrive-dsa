"use client";

import { useCallback, useMemo, useState } from "react";
import {
  STRUCTURES,
  buildStructureFrames,
  randomScript,
  type Operation,
  type StructureKey,
} from "@/lib/stacksQueues";
import { useFramePlayer } from "@/hooks/useFramePlayer";

type UseStackQueuePlayerOptions = {
  structure: StructureKey;
};

export function useStackQueuePlayer({ structure }: UseStackQueuePlayerOptions) {
  const meta = STRUCTURES[structure];
  const [script, setScriptState] = useState<Operation[]>(meta.defaultScript);
  const frames = useMemo(
    () => buildStructureFrames(structure, script),
    [structure, script],
  );
  const player = useFramePlayer(frames);
  const { reset } = player;

  const setScript = useCallback(
    (next: Operation[]) => {
      reset();
      setScriptState(next);
    },
    [reset],
  );

  const randomize = useCallback(() => {
    setScript(randomScript(structure));
  }, [structure, setScript]);

  return {
    ...player,
    script,
    setScript,
    randomize,
  };
}
