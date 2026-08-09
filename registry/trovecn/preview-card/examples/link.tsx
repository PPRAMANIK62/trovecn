"use client";

import { Globe } from "lucide-react";

import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/ui/preview-card";

export default function PreviewCardLinkExample() {
  return (
    <p className="max-w-sm text-body text-muted-foreground">
      Read more about the house motion system in{" "}
      <PreviewCard>
        <PreviewCardTrigger href="/docs" className="text-foreground">
          the docs
        </PreviewCardTrigger>
        <PreviewCardContent>
          <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <Globe className="size-3.5" />
            trove/cn docs
          </div>
          <p className="mt-1.5 text-control font-medium text-foreground">Design system reference</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Spring tiers, elevation, proximity hover, and the rest of the motion vocabulary every
            component builds on.
          </p>
        </PreviewCardContent>
      </PreviewCard>{" "}
      before wiring up a new component.
    </p>
  );
}
