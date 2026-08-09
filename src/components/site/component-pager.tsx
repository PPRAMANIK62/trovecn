"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { setDocsNavDirection } from "@/lib/docs-nav-direction";

interface ComponentPagerProps {
  previous?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

/**
 * Client boundary for the Previous/Next controls on a component's page —
 * split out of `page.tsx` (a Server Component, for its `readFileSync` calls)
 * solely because setting the docs nav direction on click
 * (`@/lib/docs-nav-direction`, consumed by `DocsPageTransition`) needs an
 * event handler, and Server Components can't pass functions to `<Link>`.
 */
export function ComponentPager({ previous, next }: ComponentPagerProps) {
  if (!previous && !next) return null;

  return (
    <div className="mt-1 flex shrink-0 items-center gap-1">
      {previous ? (
        <Link
          href={`/docs/components/${previous.slug}`}
          aria-label={`Previous: ${previous.title}`}
          onClick={() => setDocsNavDirection("back")}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
      ) : (
        <span className="flex size-7 items-center justify-center text-muted-foreground/30">
          <ArrowLeft className="size-4" />
        </span>
      )}
      {next ? (
        <Link
          href={`/docs/components/${next.slug}`}
          aria-label={`Next: ${next.title}`}
          onClick={() => setDocsNavDirection("forward")}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <span className="flex size-7 items-center justify-center text-muted-foreground/30">
          <ArrowRight className="size-4" />
        </span>
      )}
    </div>
  );
}
