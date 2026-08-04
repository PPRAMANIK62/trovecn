import type { ReactNode } from "react";

import { AppFrame, Panel } from "@/components/site/app-frame";
import { DocsSidebar } from "@/components/site/docs-sidebar";
import { DocsMobileNav } from "@/components/site/docs-mobile-nav";
import { Brand } from "@/components/site/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <AppFrame>
      <Panel className="hidden w-60 shrink-0 md:block">
        <nav className="sticky top-0 z-10 flex h-14 items-center rounded-t-3xl border-b border-border bg-background px-6">
          <Brand />
        </nav>
        <div className="p-6">
          <DocsSidebar />
        </div>
      </Panel>
      <Panel className="min-w-0 flex-1">
        <nav className="sticky top-0 z-10 flex h-14 items-center rounded-t-3xl justify-end border-b border-border bg-background px-6">
          <ThemeToggle />
        </nav>
        <div className="mx-auto max-w-3xl px-6 py-10 pb-24">
          <DocsMobileNav />
          <div className="mt-6 md:mt-0">{children}</div>
        </div>
      </Panel>
    </AppFrame>
  );
}
