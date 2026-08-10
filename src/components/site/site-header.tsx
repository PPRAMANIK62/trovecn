import type { ReactNode } from "react";

/**
 * Full-bleed sticky header for the landing page (normal document scroll).
 * The docs shell doesn't use this — it's a fixed, independently-scrolling
 * pane layout with its own per-pane header strips instead. See
 * docs/design-system.md "Shell architecture."
 *
 * Translucent + blurred, so page content keeps scrolling underneath it —
 * the `top-full` mask below is the same fog-over-content technique as
 * ScrollFadeTop/Bottom (see scroll-fade.tsx), just anchored to this sticky
 * bar instead of a fixed-height pane, since it needs to stay pinned for the
 * full page scroll rather than just the top few pixels of one pane.
 */
export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background via-background/70 to-transparent" />
    </header>
  );
}
