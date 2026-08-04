"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { ScrollTextReveal } from "./scroll-text-reveal";

export default function ScrollTextRevealDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    // Outer element owns the rounded-corner clipping and the elevation
    // (`shadow-panel`) so the demo reads as a raised panel sitting on the
    // preview stage, not a box that happens to share its border/fill with
    // the stage around it. The scrollable element is the inner div — kept
    // separate so the compound shadow isn't clipped by its own overflow.
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background shadow-panel">
      <div ref={containerRef} className="h-80 overflow-y-auto overscroll-contain">
        {/* Spacer so the reveal starts below the fold — scroll to trigger it.
            Taller than the scroll container itself (h-80/320px) plus the
            `whileInView` margin in scroll-text-reveal.tsx, so the heading
            genuinely starts out of view instead of triggering on mount. */}
        <div className="flex h-96 flex-col items-center justify-center gap-3 border-b border-border px-8 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Scroll to reveal
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-8 px-8 py-16">
          <ScrollTextReveal
            as="h3"
            containerRef={containerRef}
            text="Designed down to the last pixel, engineered to disappear."
            className="text-2xl font-medium text-foreground sm:text-3xl"
          />
          <ScrollTextReveal
            as="p"
            containerRef={containerRef}
            text="Every interaction is tuned by hand — weighted motion, quiet defaults, and just enough friction to feel considered rather than instant."
            className="max-w-md text-base leading-relaxed text-muted-foreground"
          />
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}
