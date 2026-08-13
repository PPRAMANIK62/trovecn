"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Pause, Play, RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DemoPlaybackProvider } from "@/components/site/demo-playback";

interface ComponentPreviewProps {
  children: ReactNode;
  /** Shown in the footer's meta label, e.g. an example's file basename ("standalone"). */
  label: string;
  className?: string;
}

/**
 * Two-layer preview card (outer lifted frame, inner recessed stage) with a
 * footer strip carrying the demo's label and transport controls: play/pause
 * and replay. Replay remounts the demo via a `key` bump rather than trying
 * to rewind whatever animation state it's in, so it always replays cleanly
 * from the top — and hands playback back to "playing" so a demo paused
 * before a replay doesn't restart frozen. Pause instead flows through
 * DemoPlaybackProvider to whichever scripted demo is mounted; demos that
 * don't animate simply never read it.
 *
 * The remount itself is a hard cut — the old take's DOM is destroyed the
 * same frame the new one appears, with no interim state. That's invisible
 * once; clicked repeatedly it flickers. `isReplaying` wraps the swap in a
 * brief crossfade (stage fades out, remount happens, stage fades back in)
 * and disables the button for that window so rapid clicks queue instead of
 * landing mid-fade.
 */
export function ComponentPreview({ children, label, className }: ComponentPreviewProps) {
  const [take, setTake] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);

  function handleReplay() {
    if (isReplaying) return;
    setIsReplaying(true);
    window.setTimeout(() => {
      setTake((t) => t + 1);
      setIsPlaying(true);
      setIsReplaying(false);
    }, 140);
  }

  return (
    <div className={cn("rounded-xl bg-card p-[5px] shadow-card", className)}>
      <div
        className={cn(
          "flex justify-center rounded-lg bg-background p-8 shadow-well transition-opacity duration-quick sm:p-12",
          isReplaying ? "opacity-0" : "opacity-100",
        )}
      >
        {/* A Fragment, not a div: any wrapping element here becomes a nested
            shrink-to-fit box between the flex container and the demo's own
            w-full/max-w-sm root, and that nesting doesn't reliably respect
            the inner max-width when computing its own intrinsic size — the
            card's width visibly changed with how much text happened to be
            laid out (collapsed vs. expanded). A Fragment carries the `key`
            for the remount-on-replay trick without adding a layout box, so
            the demo's own root is the direct (and only) flex child.
            DemoPlaybackProvider is a context provider, not a DOM element,
            so it inserts nothing between the Fragment and that root either. */}
        <Fragment key={take}>
          <DemoPlaybackProvider isPlaying={isPlaying}>{children}</DemoPlaybackProvider>
        </Fragment>
      </div>
      <div className="flex h-9 items-center justify-between px-2.5">
        <span className="font-mono text-meta text-muted-foreground">{label}</span>
        {/* Same bordered/shadow-bevel family as the theme toggle and GitHub
            buttons (variant="elevated"), sized down to size="2xs" for a
            footer-scale control. Muted-by-default text is call-site styling,
            not baked into the shared variant — this sits next to already
            quiet metadata text; other elevated buttons don't need that. */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="elevated"
            size="2xs"
            onClick={() => setIsPlaying((playing) => !playing)}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
            title={isPlaying ? "Pause animation" : "Play animation"}
            className="text-muted-foreground hover:text-foreground"
          >
            {isPlaying ? (
              <Pause data-icon="inline-start" className="fill-current" />
            ) : (
              <Play data-icon="inline-start" className="fill-current" />
            )}
            {isPlaying ? "pause" : "play"}
          </Button>
          <Button
            type="button"
            variant="elevated"
            size="2xs"
            disabled={isReplaying}
            onClick={handleReplay}
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
    </div>
  );
}
