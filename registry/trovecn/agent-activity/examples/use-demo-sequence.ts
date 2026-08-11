"use client";

import { useEffect, useState } from "react";

export interface DemoStepTiming {
  /** Time the current step remains active before the next one begins. */
  hold: number;
  /** Millisecond offsets at which concrete result fragments arrive. */
  reveals?: readonly number[];
}

/**
 * Advance a demo through working, result, and complete states. Result fragments
 * arrive while their step is active, so a trace reads as work being done rather
 * than as a completed record appearing all at once.
 */
export function useDemoSequence(
  timings: readonly DemoStepTiming[],
  reduceMotion: boolean | null,
  startDelay = 400,
) {
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
    let timer: number | undefined;

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, duration);
      });

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
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduceMotion, startDelay, timings]);

  return { revealLevels, visible };
}
