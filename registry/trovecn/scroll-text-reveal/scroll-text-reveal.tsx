"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ScrollTextRevealProps {
  /** The sentence or paragraph to reveal, split and animated word by word. */
  text: string;
  className?: string;
  /**
   * Element the text renders as. Defaults to `"p"`.
   */
  as?: "h1" | "h2" | "h3" | "p";
  /**
   * Scope the scroll trigger to a specific scrollable ancestor instead of
   * the window (Framer Motion's `viewport.root`). Pass this when the
   * component lives inside a nested scroll container — e.g. a demo preview
   * box — rather than the page itself. Defaults to the window.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
}

/** Stagger between each word's reveal, in seconds. */
const STAGGER = 0.03;

/**
 * Text that fades and rises into place word-by-word as it scrolls into
 * view — the reveal used on apple.com product pages. Each word is an
 * independently animated `motion.span`; the surrounding element (h1–h3 or
 * p) keeps normal text flow so the sentence still wraps naturally.
 */
export function ScrollTextReveal({
  text,
  className,
  as = "p",
  containerRef,
}: ScrollTextRevealProps) {
  const Tag = as;
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const reduceMotion = useReducedMotion();

  return (
    <Tag className={cn(className)}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <motion.span
            className="inline-block will-change-transform"
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, root: containerRef, margin: "-10% 0px" }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              delay: reduceMotion ? 0 : index * STAGGER,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </Tag>
  );
}
