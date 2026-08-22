import type { Metadata } from "next";
import Link from "next/link";

import { getComponentsByCategory } from "@/lib/components-registry";
import { SidebarNewDot } from "@/components/site/sidebar-nav-link";
import { Button } from "@/components/ui/button";

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
            {total} components. Each description says what it does under your hand, because that is
            what it had to prove to get here.
          </p>
          <div className="mt-10 flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="text-label uppercase text-muted-foreground">{group.category}</h2>
                <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Button
                        variant="link"
                        render={<Link href={`/docs/components/${item.slug}`} />}
                        nativeButton={false}
                        className="h-auto justify-start rounded-none border-none p-0 text-control font-normal text-foreground no-underline hover:text-link"
                      >
                        {item.title}
                        {item.isNew && <SidebarNewDot />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
