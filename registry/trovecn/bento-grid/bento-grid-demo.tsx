"use client";

import { Compass, Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { BentoCell, BentoGrid } from "./bento-grid";

export default function BentoGridDemo() {
  return (
    <BentoGrid className="mx-auto w-full max-w-3xl">
      <BentoCell colSpan={2} rowSpan={2}>
        <Sparkles className="size-8 text-primary" strokeWidth={1.5} />
        <div className="mt-auto space-y-1.5">
          <h3 className="text-xl">Adaptive Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Every workflow reshapes itself around how your team actually works, learning patterns
            without a single configuration screen.
          </p>
        </div>
      </BentoCell>

      <BentoCell>
        <ShieldCheck className="size-6 text-primary" strokeWidth={1.5} />
        <div className="mt-auto space-y-1.5">
          <h3 className="text-base">Bank-Grade Security</h3>
          <p className="text-sm text-muted-foreground">
            SOC 2 Type II and end-to-end encryption on every layer.
          </p>
        </div>
      </BentoCell>

      <BentoCell>
        <Zap className="size-6 text-primary" strokeWidth={1.5} />
        <div className="mt-auto space-y-1.5">
          <h3 className="text-base">Instant Sync</h3>
          <p className="text-sm text-muted-foreground">
            Changes propagate across every device in milliseconds.
          </p>
        </div>
      </BentoCell>

      <BentoCell>
        <Layers className="size-6 text-primary" strokeWidth={1.5} />
        <div className="mt-auto space-y-1.5">
          <h3 className="text-base">Unified Workspace</h3>
          <p className="text-sm text-muted-foreground">
            Docs, tasks, and conversations live in one canvas.
          </p>
        </div>
      </BentoCell>

      <BentoCell colSpan={2}>
        <Compass className="size-6 text-primary" strokeWidth={1.5} />
        <div className="mt-auto space-y-1.5">
          <h3 className="text-base">Built to Scale</h3>
          <p className="text-sm text-muted-foreground">
            From a two-person team to a thousand-person org, the same primitives hold.
          </p>
        </div>
      </BentoCell>
    </BentoGrid>
  );
}
