"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Internal context that hands each BentoCell its position within the grid,
 * purely so the entrance animation can stagger deterministically without
 * asking callers to pass an index prop by hand.
 */
const BentoIndexContext = React.createContext(0);

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Asymmetric CSS-grid container for feature-highlight layouts. Compose it
 * with `BentoCell` children of varying `colSpan`/`rowSpan` to build a
 * bento-box rhythm — a wide hero cell alongside smaller supporting cells.
 *
 * Collapses to a single column on small screens; expands to a 3-column
 * grid at the `md` breakpoint, where span props take effect.
 */
function BentoGrid({ children, className }: BentoGridProps) {
  const items = React.Children.toArray(children);

  return (
    <div
      data-slot="bento-grid"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(13rem,auto)]",
        className,
      )}
    >
      {items.map((child, index) => (
        <BentoIndexContext.Provider key={index} value={index}>
          {child}
        </BentoIndexContext.Provider>
      ))}
    </div>
  );
}

const colSpanClasses = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
} as const;

const rowSpanClasses = {
  1: "md:row-span-1",
  2: "md:row-span-2",
} as const;

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

interface BentoCellProps {
  children: React.ReactNode;
  className?: string;
  /** How many grid columns this cell spans at `md` and above. */
  colSpan?: 1 | 2 | 3;
  /** How many grid rows this cell spans at `md` and above. */
  rowSpan?: 1 | 2;
}

/**
 * A single cell within a `BentoGrid`. Reveals with a deliberate, weighted
 * fade-and-rise as it scrolls into view, staggered relative to its
 * siblings, then offers a gentle hover lift with a `--primary`-tinted border.
 */
function BentoCell({ children, className, colSpan = 1, rowSpan = 1 }: BentoCellProps) {
  const index = React.useContext(BentoIndexContext);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      data-slot="bento-cell"
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={cellVariants}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      whileHover={
        shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.35, ease: EASE } }
      }
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors duration-300 ease-out hover:border-primary/40",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export { BentoGrid, BentoCell };
