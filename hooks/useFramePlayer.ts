"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function speedToDelay(speed: number): number {
  // speed 1 (slow) → 1500ms, speed 10 (fast) → 150ms
  const clamped = Math.min(10, Math.max(1, speed));
  return Math.round(1500 - ((clamped - 1) / 9) * 1350);
}

/** Playback state shared by every visualizer: play, pause, step, scrub, speed. */
export function useFramePlayer<T>(frames: T[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  /** Jumps straight to a frame (clamped) and pauses there. */
  const goTo = useCallback(
    (index: number) => {
      pause();
      setCurrentIndex(Math.min(Math.max(0, Math.round(index)), Math.max(0, frames.length - 1)));
    },
    [pause, frames.length],
  );

  const reset = useCallback(() => {
    pause();
    setCurrentIndex(0);
  }, [pause]);

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
    play,
    pause,
    stepForward,
    stepBackward,
    goTo,
    reset,
    setSpeed,
  };
}
