"use client";

import { useEffect, useState } from "react";

import { usePausableWait } from "@/components/site/demo-playback";

export interface DemoStepTiming {
  /** Time the current step remains active before the next one begins. */
  hold: number;
  /** Millisecond offsets at which concrete result fragments arrive. */
  reveals?: readonly number[];
}

/**
 * Advance a demo through working, result, and complete states. Result fragments
 * arrive while their step is active, so a trace reads as work being done rather
 * than as a completed record appearing all at once. `wait` comes from
 * usePausableWait so ComponentPreview's pause control freezes the sequence
 * mid-step instead of it continuing in the background.
 */
export function useDemoSequence(
  timings: readonly DemoStepTiming[],
  reduceMotion: boolean | null,
  startDelay = 400,
) {
  const { wait } = usePausableWait();
  const [visible, setVisible] = useState(reduceMotion ? timings.length + 1 : 0);
  const [revealLevels, setRevealLevels] = useState<number[]>(
    reduceMotion ? timings.map((timing) => timing.reveals?.length ?? 0) : timings.map(() => 0),
  );

  useEffect(() => {
    if (reduceMotion) {
      setVisible(timings.length + 1);
      setRevealLevels(timings.map((timing) => timing.reveals?.length ?? 0));
      return;
    }

    let cancelled = false;

    const run = async () => {
      setVisible(0);
      setRevealLevels(timings.map(() => 0));

      await wait(startDelay);
      if (cancelled) return;

      for (const [index, timing] of timings.entries()) {
        setVisible(index + 1);

        let elapsed = 0;
        for (const [revealIndex, revealAt] of (timing.reveals ?? []).entries()) {
          await wait(Math.max(0, revealAt - elapsed));
          if (cancelled) return;
          elapsed = revealAt;
          setRevealLevels((levels) =>
            levels.map((level, levelIndex) => (levelIndex === index ? revealIndex + 1 : level)),
          );
        }

        await wait(Math.max(0, timing.hold - elapsed));
        if (cancelled) return;
      }

      setVisible(timings.length + 1);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [reduceMotion, startDelay, timings, wait]);

  return { revealLevels, visible };
}
