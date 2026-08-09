"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";

/** max-h-80 — roughly a preview card's stage height, so switching to Code
 *  doesn't visually lurch the page taller than Preview did. */
const COLLAPSED_HEIGHT = 320;
/** The scrollable ceiling once expanded — generous enough that a normal
 *  example (a few dozen lines) fully fits without scrolling; only unusually
 *  long files actually hit this and need a scrollbar. */
const EXPANDED_MAX_HEIGHT = 640;
/** Always kept blank below the last line when expanded, so the pinned
 *  Collapse control has real empty space to float over instead of
 *  overlapping whatever code line happens to land at the bottom edge. */
const BUTTON_RESERVE = 56;
const EXPANDED_TEXT_BUDGET = EXPANDED_MAX_HEIGHT - BUTTON_RESERVE;
/** [&_pre]:leading-6 + [&_pre]:p-4 — used to decide, from the server-known
 *  line count alone, whether collapsing is even necessary (no client
 *  measurement needed for that decision, so it can't mismatch on hydration). */
const LINE_HEIGHT = 24;
const PRE_PADDING = 32;

interface CodeScrollProps {
  html: string;
  lineCount: number;
  className?: string;
}

export function CodeScroll({ html, lineCount, className }: CodeScrollProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);

  // Measured once, right after mount — at this point `expanded` is still
  // false so BUTTON_RESERVE hasn't been added to the DOM yet, giving the
  // real (unpadded) content height to base the collapse math on.
  useLayoutEffect(() => {
    if (contentRef.current) setNaturalHeight(contentRef.current.scrollHeight);
  }, []);

  const needsCollapse = lineCount * LINE_HEIGHT + PRE_PADDING > COLLAPSED_HEIGHT;
  const isScrollable = needsCollapse && (naturalHeight ?? Infinity) > EXPANDED_TEXT_BUDGET;
  const height = !needsCollapse
    ? "auto"
    : expanded
      ? Math.min(naturalHeight ?? EXPANDED_TEXT_BUDGET, EXPANDED_TEXT_BUDGET) + BUTTON_RESERVE
      : COLLAPSED_HEIGHT;

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ height }}
        transition={expanded ? spring.slow.enter : spring.slow.exit}
        className={cn(
          "text-caption [&_pre]:p-4 [&_pre]:leading-6",
          needsCollapse && (expanded ? "overflow-auto" : "overflow-hidden"),
          // The pinned expand/collapse control floats over the last visible
          // lines rather than pushing the panel taller — pad the content so
          // it always has guaranteed blank space to sit on top of.
          needsCollapse && expanded && "[&_pre]:pb-14",
          // Long lines (Tailwind class strings especially) routinely need
          // horizontal scroll, but the OS's thin auto-hiding overlay
          // scrollbar gives no visible cue that more content exists off to
          // either side — a reader can land mid-scroll and see truncated
          // text on both edges with nothing indicating why. Always-visible,
          // themed scrollbars make the affordance obvious.
          // `--border` is a near-white hairline token — invisible as a
          // scrollbar thumb in light mode. `--muted-foreground` at partial
          // opacity has real contrast in both themes.
          "[scrollbar-color:color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_transparent] [scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60",
          className,
        )}
      >
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }} />
      </motion.div>
      {needsCollapse && (
        <>
          {(!expanded || isScrollable) && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-background to-transparent" />
          )}
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <Button
              type="button"
              variant="elevated"
              size="xs"
              onClick={() => setExpanded((e) => !e)}
              // elevated's dark:bg-input/30 (and dark:hover:bg-input/50) is
              // meant for chrome sitting on plain background — translucent
              // enough here to let the code text underneath show through,
              // including on hover. Force it fully opaque in both states.
              className="rounded-full bg-card hover:bg-card dark:bg-card dark:hover:bg-card"
            >
              {expanded ? (
                <>
                  Collapse
                  <ChevronUp data-icon="inline-end" />
                </>
              ) : (
                <>
                  Show all {lineCount} lines
                  <ChevronDown data-icon="inline-end" />
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
