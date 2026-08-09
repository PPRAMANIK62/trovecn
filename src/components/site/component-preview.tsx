"use client";

import { Fragment, useState, type ReactNode } from "react";
import { RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ComponentPreviewProps {
  children: ReactNode;
  /** Shown in the footer's meta label, e.g. an example's file basename ("standalone"). */
  label: string;
  className?: string;
}

/**
 * Two-layer preview card (outer lifted frame, inner recessed stage) with a
 * footer strip carrying the demo's label and a "replay" control. Replay
 * remounts the demo via a `key` bump rather than trying to rewind whatever
 * animation state it's in, so it always replays cleanly from the top.
 */
export function ComponentPreview({ children, label, className }: ComponentPreviewProps) {
  const [take, setTake] = useState(0);

  return (
    <div className={cn("rounded-xl bg-card p-[5px] shadow-card", className)}>
      <div className="flex justify-center rounded-lg bg-background p-8 shadow-well sm:p-12">
        {/* A Fragment, not a div: any wrapping element here becomes a nested
            shrink-to-fit box between the flex container and the demo's own
            w-full/max-w-sm root, and that nesting doesn't reliably respect
            the inner max-width when computing its own intrinsic size — the
            card's width visibly changed with how much text happened to be
            laid out (collapsed vs. expanded). A Fragment carries the `key`
            for the remount-on-replay trick without adding a layout box, so
            the demo's own root is the direct (and only) flex child. */}
        <Fragment key={take}>{children}</Fragment>
      </div>
      <div className="flex h-9 items-center justify-between px-2.5">
        <span className="font-mono text-meta text-muted-foreground">{label}</span>
        {/* Same bordered/shadow-bevel family as the theme toggle and GitHub
            buttons (variant="elevated"), sized down to size="2xs" for a
            footer-scale control. Muted-by-default text is call-site styling,
            not baked into the shared variant — this sits next to already
            quiet metadata text; other elevated buttons don't need that. */}
        <Button
          type="button"
          variant="elevated"
          size="2xs"
          onClick={() => setTake((t) => t + 1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCw
            data-icon="inline-start"
            className="transition-transform duration-[160ms] ease-out"
            style={{ transform: `rotate(${take * 360}deg)` }}
          />
          replay
        </Button>
      </div>
    </div>
  );
}
