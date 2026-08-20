import type { Easing, Transition } from "motion/react";

/**
 * Motion tokens. Four tiers, each an enter spring paired with a faster,
 * bounce-free exit tween. Import the tier that matches how big the thing
 * moving is, and how often it fires. Don't hand-write a duration to taste.
 *
 * Gesture and physics motion is exempt. A drag that tracks the pointer one
 * to one, a rubber-band overshoot, a throw carrying velocity, and a hold
 * whose duration *is* the interaction all own their own curves, because
 * none of these four can express them. Name the curve and the reason in the
 * component's file header. `hold-to-delete-button` is the shipped example:
 * a linear two-second fill against a fast snap back, where the asymmetry is
 * the whole component.
 */

/** Strong ease-out, matching this repo's `docs/design-system.md` guidance that built-in
 *  easing keywords are too weak for deliberate UI motion. Used on every
 *  tier's exit tween. Motion's array form of `cubic-bezier(0.23, 1, 0.32, 1)`.
 *  Exported so a component with its own bespoke, non-tier tween (e.g. a
 *  checkmark `pathLength` draw) can reuse the same curve instead of a bare
 *  easing keyword. */
export const easeOutStrong: Easing = [0.23, 1, 0.32, 1];

interface SpringTier {
  /** Enter transition — spring, responds naturally to interruption. */
  enter: Transition;
  /** Exit transition — plain tween, one notch quicker, no bounce. */
  exit: Transition;
}

export const spring = {
  /** Continuous, pointer-tracked motion only: proximity-hover pills, live
   *  highlight rects that follow the cursor, drag indicators. Anything
   *  triggered by a discrete click/open — even something small — belongs on
   *  `quick` or above. Kept at its current speed; this tier is not part of
   *  the retune, it already needs to feel instant. */
  fast: {
    enter: { type: "spring", duration: 0.08, bounce: 0 },
    exit: { duration: 0.06, ease: easeOutStrong },
  },
  /** One-shot feedback that isn't continuously tracked: tooltips, preview
   *  cards, icon crossfades, small entrance staggers. Enough spring to read
   *  as motion rather than a cut, still fast enough to keep up with the
   *  interaction that triggered it. */
  quick: {
    enter: { type: "spring", duration: 0.14, bounce: 0.1 },
    exit: { duration: 0.1, ease: easeOutStrong },
  },
  /**
   * Short travel / small expansion (dropdown & tab indicators, switch
   * thumb, accordions) and panels that must land exactly (mobile drawer,
   * selection merge/split).
   */
  moderate: {
    enter: { type: "spring", duration: 0.2, bounce: 0.12 },
    exit: { duration: 0.15, ease: easeOutStrong },
  },
  /** Large surfaces: dialogs, side panels, stepped flows. */
  slow: {
    enter: { type: "spring", duration: 0.32, bounce: 0.18 },
    exit: { duration: 0.22, ease: easeOutStrong },
  },
} satisfies Record<"fast" | "quick" | "moderate" | "slow", SpringTier>;
