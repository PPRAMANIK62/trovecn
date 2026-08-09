"use client";

import { Button } from "@/components/ui/button";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/ui/preview-card";

export default function PreviewCardProfileExample() {
  return (
    <p className="max-w-sm text-body text-muted-foreground">
      Reviewed by{" "}
      <PreviewCard>
        <PreviewCardTrigger href="#" className="text-foreground">
          @mariko
        </PreviewCardTrigger>
        <PreviewCardContent>
          <div className="flex items-start gap-2.5">
            <div
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-foreground"
            >
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-control font-medium text-foreground">Mariko Sato</p>
              <p className="text-caption text-muted-foreground">@mariko</p>
            </div>
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
          <p className="mt-2.5 text-caption text-muted-foreground">
            Design engineer working on interaction design and motion systems.
          </p>
        </PreviewCardContent>
      </PreviewCard>{" "}
      two days ago.
    </p>
  );
}
