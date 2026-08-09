"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { spring } from "@/lib/springs";
import { getDocsNavDirection } from "@/lib/docs-nav-direction";

/**
 * A few more pixels than the tooltip/popover slide-toward-trigger offset
 * (4px) — this is the largest surface in the app that moves, so it gets a
 * proportionally bigger cue, still restrained rather than a full-width
 * swipe.
 */
const OFFSET = 24;

/**
 * Directional replacement for a native `<ViewTransition>` attempt — React's
 * ViewTransition integration never actually invoked the browser API for
 * plain `<Link>` navigation in this Next/React combination, confirmed by
 * polling `:active-view-transition` across a full second on every tested
 * nav path. This uses the same Motion/spring system every other animation
 * in the app already relies on, so it's guaranteed to actually run.
 *
 * Vertical, not horizontal: forward navigation rises up into place (enters
 * from `+OFFSET`, below its resting position — "content sliding up
 * communicates arrival"), back navigation drops down into place (enters
 * from `-OFFSET`, above). `spring.slow` — this is the largest moving
 * surface in the app, matching docs/design-system.md's "the bigger the
 * thing that moves, the slower the tier."
 *
 * `mode="popLayout"` pulls the exiting page out of layout flow immediately
 * so the entering page doesn't wait for it or get pushed down — critical
 * here since docs pages vary a lot in height.
 *
 * Direction lives on `AnimatePresence`'s `custom` prop rather than baked
 * directly into each element's `initial`/`exit`. Motion clones an exiting
 * element with whatever props it already had — it doesn't re-render mid-exit
 * — so a plain `sign * OFFSET` computed inline would freeze the *outgoing*
 * page's direction at whatever it was when that page entered, not the
 * direction of the nav that's now carrying it away. On rapid prev/next
 * clicks that mismatch had the outgoing and incoming pages sliding opposite
 * ways at once, reading as a bounce. `custom` is threaded through context,
 * so a variants function keeps reading the live direction even after the
 * element has left the tree.
 */
type TransitionCue = { sign: number; reduceMotion: boolean | null };

const variants = {
  initial: ({ sign, reduceMotion }: TransitionCue) =>
    reduceMotion ? { opacity: 0 } : { opacity: 0, y: sign * OFFSET },
  animate: { opacity: 1, y: 0, transition: spring.slow.enter },
  exit: ({ sign, reduceMotion }: TransitionCue) =>
    reduceMotion
      ? { opacity: 0, transition: spring.slow.exit }
      : { opacity: 0, y: sign * -OFFSET, transition: spring.slow.exit },
};

export function DocsPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const sign = getDocsNavDirection() === "back" ? -1 : 1;
  const cue: TransitionCue = { sign, reduceMotion };

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={cue}>
      <motion.div
        key={pathname}
        custom={cue}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
