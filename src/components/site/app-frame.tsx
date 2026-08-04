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

/**
 * `scroll` defaults to true (the panel's own box scrolls, e.g. the landing
 * page where a static nav sits inline with content that never overflows).
 * Pass `scroll={false}` when a child needs a `position: sticky` header
 * pinned above independently-scrolling content instead — sticking a nav to
 * the top of the panel's own scrollport makes it wobble with the scrollport
 * during macOS's rubber-band overscroll bounce, since `position: sticky`
 * recalculates its offset from a scroll position that briefly overshoots
 * during the bounce. A plain non-scrolling nav above a separately-scrolling
 * inner container never needs `sticky` to stay pinned, so it can't wobble.
 * See docs/layout.tsx.
 */
export function Panel({
  children,
  className,
  scroll = true,
}: {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-3xl bg-background shadow-panel",
        scroll && "overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}
