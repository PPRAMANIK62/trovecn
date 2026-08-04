"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface AnimatedBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /**
   * Seconds for one full lap around the border. Kept slow by default so it
   * reads as light catching an edge in a display case, not a loading
   * spinner — see the motion principles in docs/design-system.md.
   */
  duration?: number;
}

// A comet-like arc: mostly transparent, with a brief build-up and a bright
// peak before fading back out. Built from `--link` (the one accent color)
// via color-mix rather than a hardcoded hue, so it tracks the palette
// automatically. Deliberately not `--primary`/`--accent` — those are
// grayscale ink tokens, and a blurred grayscale glow reads as a shadow
// smudge on a light background instead of a glow.
const BEAM_GRADIENT =
  "conic-gradient(from 0deg, transparent 0%, transparent 68%, color-mix(in oklch, var(--link) 55%, transparent) 80%, var(--link) 87%, color-mix(in oklch, var(--link) 35%, transparent) 92%, transparent 100%)";

/**
 * A card with a light beam that continuously travels around its border —
 * a thin rotating conic-gradient ring, masked so only a hairline shows,
 * plus a soft blurred bloom of the same gradient behind it. Restrained by
 * design: a slow, low-key glow rather than an RGB-gamer effect.
 */
function AnimatedBorderCard({
  children,
  className,
  duration = 7,
  ...props
}: AnimatedBorderCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const animate = prefersReducedMotion ? undefined : { rotate: 360 };
  const transition = prefersReducedMotion
    ? undefined
    : { duration, repeat: Infinity, ease: "linear" as const };

  return (
    <div
      data-slot="animated-border-card"
      className={cn("relative rounded-lg", className)}
      {...props}
    >
      {/* Ambient bloom: same gradient, blurred and dim, bleeding softly
          past the edge so the beam reads as a glow, not a hard line. The
          conic-gradient fills its whole box by angle (a pie, not a ring),
          so it's clipped to a narrow halo around the card before blurring —
          otherwise the blur smears that wedge into a shape that reads as
          floating off the card entirely as it rotates. */}
      <div aria-hidden className="pointer-events-none absolute -inset-3 overflow-hidden rounded-xl">
        <motion.div
          className="absolute inset-0 opacity-40 blur-md"
          style={{ background: BEAM_GRADIENT }}
          animate={animate}
          transition={transition}
        />
      </div>

      {/* The ring: a rotating gradient far larger than the card so it
          always fills the frame, clipped by the inner bg-card layer down
          to a hairline (border-width) at the edge — the standard
          "border beam" masking technique. */}
      <div className="relative overflow-hidden rounded-lg p-px">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[50%]"
          style={{ background: BEAM_GRADIENT }}
          animate={animate}
          transition={transition}
        />
        <div className="relative z-10 rounded-[calc(var(--radius)-1px)] bg-card p-6 text-card-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export { AnimatedBorderCard };
