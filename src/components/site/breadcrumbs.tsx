"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getComponent } from "@/lib/components-registry";

interface Crumb {
  label: string;
  /** Omitted on the current page — it renders as text, not a link. */
  href?: string;
}

function useCrumbs(): Crumb[] {
  const pathname = usePathname();

  if (pathname === "/docs/components") {
    return [{ label: "Docs", href: "/docs" }, { label: "Components" }];
  }

  const slug = pathname.match(/^\/docs\/components\/(.+)$/)?.[1];
  if (slug) {
    const item = getComponent(slug);
    return [
      { label: "Docs", href: "/docs" },
      { label: "Components", href: "/docs/components" },
      { label: item?.title ?? slug },
    ];
  }

  // /docs itself, and any other future top-level docs route.
  return [{ label: "Overview" }];
}

export function Breadcrumbs() {
  const crumbs = useCrumbs();

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-minor">
      {crumbs.map((crumb, i) => (
        <span key={crumb.label} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="truncate text-muted-foreground transition-colors hover:text-link"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
