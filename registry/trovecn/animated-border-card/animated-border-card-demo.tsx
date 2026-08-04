"use client";

import { Gem, ShieldCheck } from "lucide-react";

import { AnimatedBorderCard } from "./animated-border-card";

export default function AnimatedBorderCardDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
      <AnimatedBorderCard duration={7}>
        <div className="flex flex-col gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-primary">
            <Gem className="size-4" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Provenance Beam</h3>
          <p className="text-sm text-muted-foreground">
            A single thread of light traces the edge, slow enough to read as craftsmanship rather
            than decoration.
          </p>
        </div>
      </AnimatedBorderCard>

      <AnimatedBorderCard duration={9}>
        <div className="flex flex-col gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-primary">
            <ShieldCheck className="size-4" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Always Tended</h3>
          <p className="text-sm text-muted-foreground">
            The border never stops circling — a quiet signal that the piece is live, watched, and
            cared for.
          </p>
        </div>
      </AnimatedBorderCard>
    </div>
  );
}
