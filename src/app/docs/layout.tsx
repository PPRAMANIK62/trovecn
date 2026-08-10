import type { ReactNode } from "react";

import { DocsSidebar } from "@/components/site/docs-sidebar";
import { DocsMobileSidebar } from "@/components/site/docs-mobile-sidebar";
import { DocsInfoCard } from "@/components/site/docs-info-card";
import { ScrollFadeTop, ScrollFadeBottom } from "@/components/site/scroll-fade";
import { Brand } from "@/components/site/brand";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { GITHUB_OWNER, GITHUB_REPO_NAME } from "@/lib/site-config";

async function getStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data: { stargazers_count?: number } = await res.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/**
 * Fixed, edge-to-edge 3-pane shell at lg+/xl+ — sidebar | content | info
 * card — each pane scrolling independently. Flush panes, no rounded
 * corners, no canvas gutter (see docs/design-system.md "Shell
 * architecture"). Below lg, collapses to a single scrolling content pane
 * with its own compact top strip (Brand + mobile drawer trigger).
 */
export default async function DocsLayout({ children }: { children: ReactNode }) {
  const starCount = await getStarCount();

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row">
      <aside className="hidden shrink-0 flex-col border-r border-border lg:flex lg:w-64">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-6">
          <Brand />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto overscroll-contain p-6">
            <DocsSidebar />
          </div>
          <ScrollFadeTop />
          <ScrollFadeBottom />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col xl:border-r xl:border-border">
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <Brand />
            <DocsMobileSidebar />
          </div>
          <div className="hidden min-w-0 lg:block">
            <Breadcrumbs />
          </div>
          <ThemeToggle />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto overscroll-contain">
            <div className="mx-auto max-w-2xl px-6 py-10">{children}</div>
          </div>
          <ScrollFadeTop />
          <ScrollFadeBottom />
        </div>
      </main>

      <aside className="relative hidden shrink-0 overflow-hidden xl:block xl:w-72">
        <div className="absolute inset-0 overflow-y-auto p-6">
          <DocsInfoCard starCount={starCount} />
        </div>
        <ScrollFadeTop />
        <ScrollFadeBottom />
      </aside>
    </div>
  );
}
