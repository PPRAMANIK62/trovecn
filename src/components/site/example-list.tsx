"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { spring } from "@/lib/springs";

/**
 * First-paint stagger for a component page's example sections
 * (docs/design-system.md "One well-orchestrated entrance per component") —
 * same container/item variant shape as src/components/site/hero.tsx.
 */
export function ExampleList({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion ? undefined : { staggerChildren: 0.06 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="mt-10 flex flex-col gap-12"
    >
      {children}
    </motion.div>
  );
}

export function ExampleListItem({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : spring.quick.enter,
    },
  };

  return <motion.section variants={item}>{children}</motion.section>;
}
