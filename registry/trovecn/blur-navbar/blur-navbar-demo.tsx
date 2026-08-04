"use client";

import * as React from "react";
import { Gem } from "lucide-react";

import { BlurNavbar } from "./blur-navbar";

const LINKS = [
  { label: "Collection", href: "#collection", active: true },
  { label: "Provenance", href: "#provenance" },
  { label: "Acquire", href: "#acquire" },
];

const PARAGRAPHS = [
  "Every piece in the trove is cataloged, numbered, and lit like an object under glass — restraint reads as premium, not effects-per-second.",
  "Scroll this preview to watch the navbar shed its transparency: a blurred backdrop settles in, a hairline seam appears along the bottom edge, and the bar itself draws in a few pixels tighter.",
  "The same interaction pattern anchors apple.com and linear.app — a navbar that trusts the hero to breathe, then earns its structure once content starts moving underneath it.",
  "Nothing here is bouncy. The transition is deliberate — an expo-out ease over seven-tenths of a second, the same weight used across the rest of the collection.",
];

export default function BlurNavbarDemo() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    // Outer element owns the rounded-corner clipping and the elevation
    // (`shadow-panel`) so the demo reads as a raised panel sitting on the
    // preview stage, not a box that happens to share its border/fill with
    // the stage around it. The scrollable element is the inner div — kept
    // separate so the compound shadow isn't clipped by its own overflow.
    <div className="w-full overflow-hidden rounded-lg border border-border bg-background shadow-panel">
      <div ref={scrollRef} className="h-80 overflow-y-auto overscroll-contain">
        <BlurNavbar
          scrollContainerRef={scrollRef}
          logo={
            <span className="flex items-center gap-2">
              <Gem className="size-4 text-primary" strokeWidth={1.75} />
              Trovecn
            </span>
          }
          links={LINKS}
          cta={
            <a
              href="#acquire"
              className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-sans text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Request access
            </a>
          }
        />

        <div className="space-y-6 px-6 pb-10 pt-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              No. 014 — Navigation
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">The Blur Navbar</h3>
          </div>

          {PARAGRAPHS.map((copy, i) => (
            <p key={i} className="font-sans text-sm leading-relaxed text-muted-foreground">
              {copy}
            </p>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-md border border-border bg-secondary/40" />
            ))}
          </div>

          <p className="font-sans text-sm leading-relaxed text-muted-foreground">
            Keep scrolling within this frame — the state persists for the rest of the preview,
            exactly as it would on a full page.
          </p>
        </div>
      </div>
    </div>
  );
}
