import type { ReactNode } from "react";

import { AppFrame, Panel } from "@/components/site/app-frame";
import { DocsSidebar } from "@/components/site/docs-sidebar";
import { DocsMobileSidebar } from "@/components/site/docs-mobile-sidebar";
import { Brand } from "@/components/site/brand";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ThemeToggle } from "@/components/site/theme-toggle";

/**
 * Nav bars float over their scroll container instead of sitting above it in
 * flow — `position: absolute` on the nav, `position: absolute inset-0` on
 * the scroll box beneath it, `overflow-hidden` on the Panel to clip both to
 * its rounded corners. This is deliberately *not* `position: sticky`
 * (see the `scroll` prop doc comment on `Panel` in app-frame.tsx): sticky
 * pinned inside a scrolling box was tried before and wobbled during
 * macOS's rubber-band overscroll bounce, because sticky recalculates its
 * offset against a scroll position that briefly overshoots. An absolutely
 * positioned nav outside the scrolling box never recalculates anything on
 * scroll, so it can't wobble — it just sits there while content passes
 * underneath and blurs through it.
 *
 * The top and bottom edges each get a thin `pointer-events-none` overlay —
 * a div painted with the panel's own solid background color fading to
 * transparent, layered above the scrolling content via z-index — instead of
 * a `mask-image` on the content itself. A mask multiplies a card's own
 * box-shadow and rounded corners into the fade curve and the two alpha
 * gradients compound into a muddy dissolve; painting matching-color fog over
 * the content leaves its shape untouched and works the same whether what's
 * underneath is plain text or a stack of bordered cards.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <Panel scroll={false} className="relative hidden w-60 shrink-0 overflow-hidden lg:block">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain p-6 pt-20">
          <DocsSidebar />
        </div>
        <nav className="absolute inset-x-0 top-0 z-10 flex h-14 items-center border-b border-border bg-background/85 px-6 backdrop-blur-md">
          <Brand />
        </nav>
        <div className="pointer-events-none absolute inset-x-0 top-14 z-10 h-8 bg-gradient-to-b from-background via-background/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </Panel>
      <Panel scroll={false} className="relative min-w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain pt-14">
          <div className="mx-auto max-w-3xl px-20 pt-14 pb-24 lg:pt-10">{children}</div>
        </div>
        <nav className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-6 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 lg:hidden">
              <Brand />
            </div>
            <div className="lg:hidden">
              <DocsMobileSidebar />
            </div>
            <div className="hidden min-w-0 lg:block">
              <Breadcrumbs />
            </div>
          </div>
          <ThemeToggle />
        </nav>
        <div className="pointer-events-none absolute inset-x-0 top-14 z-10 h-8 bg-gradient-to-b from-background via-background/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </Panel>
    </AppFrame>
  );
}
