import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getComponentsByCategory } from "@/lib/components-registry";

export const metadata: Metadata = {
  title: "Components — trove/cn",
};

export default function ComponentsIndexPage() {
  const groups = getComponentsByCategory().filter((group) => group.items.length > 0);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="max-w-3xl">
      <p className="text-label uppercase text-link">Components</p>
      <h1 className="mt-3 text-title text-foreground">All components</h1>

      {total === 0 ? (
        <p className="mt-3.5 text-body text-muted-foreground">
          No components yet — check back soon.
        </p>
      ) : (
        <>
          <p className="mt-3.5 max-w-xl text-lede leading-relaxed text-muted-foreground">
            {total} patterns, grouped by where you would reach for them.
          </p>
          <div className="mt-10 flex flex-col gap-10">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="text-label uppercase text-muted-foreground">{group.category}</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/docs/components/${item.slug}`}
                      className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-control text-foreground">{item.title}</h3>
                          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                        </div>
                        <p className="mt-1.5 text-caption leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
