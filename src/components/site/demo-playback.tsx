"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

interface DemoPlaybackContextValue {
  isPlaying: boolean;
}

const DemoPlaybackContext = createContext<DemoPlaybackContextValue>({ isPlaying: true });

/**
 * Supplies the play/pause state ComponentPreview's transport controls set,
 * so a scripted demo nested anywhere underneath can read it without prop
 * drilling. Demos that don't animate can ignore it entirely.
 */
export function DemoPlaybackProvider({
  isPlaying,
  children,
}: {
  isPlaying: boolean;
  children: ReactNode;
}) {
  return (
    <DemoPlaybackContext.Provider value={{ isPlaying }}>{children}</DemoPlaybackContext.Provider>
  );
}

export function useDemoPlaying(): boolean {
  return useContext(DemoPlaybackContext).isPlaying;
}

interface PendingWait {
  remaining: number;
  startedAt: number;
  timer?: number;
  resolve: () => void;
}

/**
 * A `wait(ms)` a scripted demo can `await` in a linear sequence. Pausing
 * (ComponentPreview's transport control) freezes whichever wait is
 * in-flight — remaining time is preserved and a fresh timer picks up on
 * resume — rather than the demo racing ahead in the background or losing
 * its place. `wait`'s identity is stable across renders, so it's safe to
 * capture once inside a `useEffect` that only runs on mount.
 */
export function usePausableWait() {
  const isPlaying = useDemoPlaying();
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const pendingRef = useRef<PendingWait | null>(null);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    if (isPlaying) {
      pending.startedAt = performance.now();
      pending.timer = window.setTimeout(
        () => {
          pendingRef.current = null;
          pending.resolve();
        },
        Math.max(0, pending.remaining),
      );
    } else if (pending.timer !== undefined) {
      window.clearTimeout(pending.timer);
      pending.remaining -= performance.now() - pending.startedAt;
      pending.timer = undefined;
    }
  }, [isPlaying]);

  // Unmount-only cleanup — the effect above intentionally doesn't clear on
  // every dependency change, since a pause/resume toggle must hand the same
  // pending wait's timer off rather than cancel it outright.
  useEffect(() => {
    return () => {
      const pending = pendingRef.current;
      if (pending?.timer !== undefined) window.clearTimeout(pending.timer);
    };
  }, []);

  const waitRef = useRef((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      const pending: PendingWait = { remaining: ms, startedAt: performance.now(), resolve };
      pendingRef.current = pending;
      if (isPlayingRef.current) {
        pending.timer = window.setTimeout(() => {
          pendingRef.current = null;
          resolve();
        }, ms);
      }
    });
  });

  return { wait: waitRef.current, isPlaying };
}
