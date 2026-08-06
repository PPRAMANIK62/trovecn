"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getComponentsByCategory } from "@/lib/components-registry";
import { cn } from "@/lib/utils";

const groups = getComponentsByCategory();

export function DocsSidebar() {
  const pathname = usePathname();
  const populatedGroups = groups.filter((group) => group.items.length > 0);

  if (populatedGroups.length === 0) {
    return <p className="text-minor text-muted-foreground">No components yet — check back soon.</p>;
  }

  return (
    <nav className="flex flex-col gap-6 text-minor">
      {populatedGroups.map((group) => (
        <div key={group.category}>
          <p className="text-label uppercase text-muted-foreground">{group.category}</p>
          <ul className="mt-2.5 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const href = `/docs/components/${item.slug}`;
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
