import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The whole app lives inside a fixed canvas frame: a padded row of
 * independently-scrolling rounded `Panel`s floating on the `--canvas` gutter
 * color. There is no app-wide header — each `Panel` that needs one carries
 * its own navbar internally. See docs/design-system.md "Visual language".
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 flex gap-3 bg-canvas p-3 sm:gap-4 sm:p-4">{children}</div>;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "h-full overflow-y-auto overscroll-contain rounded-3xl bg-background shadow-panel",
        className,
      )}
    >
      {children}
    </div>
  );
}
