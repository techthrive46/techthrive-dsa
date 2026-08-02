"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildFrames, randomArray, type AlgoKey } from "@/lib/sorting";

function speedToDelay(speed: number): number {
  // speed 1 (slow) → 1500ms, speed 10 (fast) → 150ms
  const clamped = Math.min(10, Math.max(1, speed));
  return Math.round(1500 - ((clamped - 1) / 9) * 1350);
}

const DEFAULT_ARRAY = [8, 3, 11, 6, 1, 9, 4, 7];

type UsePlayerOptions = {
  algo: AlgoKey;
  initialArray?: number[];
};

export function usePlayer({ algo, initialArray = DEFAULT_ARRAY }: UsePlayerOptions) {
  const [array, setArrayState] = useState<number[]>(initialArray);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const frames = useMemo(() => buildFrames(array, algo), [array, algo]);
  const currentFrame = frames[currentIndex] ?? frames[0];
  const isAtEnd = currentIndex >= frames.length - 1;

  const clearPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    clearPlayback();
    setIsPlaying(false);
  }, [clearPlayback]);

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= frames.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, [pause]);

  const play = useCallback(() => {
    if (frames.length <= 1) return;

    setCurrentIndex((prev) => {
      if (prev >= frames.length - 1) return 0;
      return prev;
    });
    setIsPlaying(true);
  }, [frames.length]);

  const reset = useCallback(() => {
    pause();
    setCurrentIndex(0);
  }, [pause]);

  const setArray = useCallback(
    (next: number[]) => {
      pause();
      setArrayState(next);
      setCurrentIndex(0);
    },
    [pause],
  );

  const randomize = useCallback(() => {
    setArray(randomArray(8));
  }, [setArray]);

  useEffect(() => {
    if (!isPlaying) {
      clearPlayback();
      return;
    }

    clearPlayback();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedToDelay(speed));

    return clearPlayback;
  }, [isPlaying, speed, frames.length, clearPlayback]);

  return {
    frames,
    currentFrame,
    currentIndex,
    totalFrames: frames.length,
    isPlaying,
    isAtEnd,
    speed,
    array,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    setArray,
    randomize,
  };
}
