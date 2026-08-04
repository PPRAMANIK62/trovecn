import type { Transition } from "framer-motion";

/**
 * Motion tokens — see docs/design-system.md "Motion & interaction
 * principles". Three tiers, each an enter spring paired with a faster,
 * bounce-free exit tween. Never hand-write a duration/transition inline —
 * import the tier that matches how big the thing moving is.
 */

interface SpringTier {
  /** Enter transition — spring, responds naturally to interruption. */
  enter: Transition;
  /** Exit transition — plain tween, one notch quicker, no bounce. */
  exit: Transition;
}

export const spring = {
  /** Hover, focus rings, fades, tooltips, selection indicators. */
  fast: {
    enter: { type: "spring", duration: 0.08, bounce: 0 },
    exit: { duration: 0.06, ease: "easeOut" },
  },
  /**
   * Short travel / small expansion (dropdown & tab indicators, switch
   * thumb, accordions) and panels that must land exactly (mobile drawer,
   * selection merge/split).
   */
  moderate: {
    enter: { type: "spring", duration: 0.16, bounce: 0 },
    exit: { duration: 0.12, ease: "easeOut" },
  },
  /** Large surfaces: dialogs, side panels, stepped flows. */
  slow: {
    enter: { type: "spring", duration: 0.24, bounce: 0.12 },
    exit: { duration: 0.16, ease: "easeOut" },
  },
} satisfies Record<"fast" | "moderate" | "slow", SpringTier>;
