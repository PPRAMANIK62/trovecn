"use client";

import { useRouter, usePathname } from "next/navigation";

import { getComponentsByCategory } from "@/lib/components-registry";

const groups = getComponentsByCategory();

/**
 * Below `md`, `DocsSidebar` is hidden entirely with no replacement — this
 * fills that gap with a native `<select>` so phone visitors can still jump
 * between docs pages. A `<select>` gets free accessibility and mobile
 * affordances (native picker UI) without shipping a custom dropdown.
 */
export function DocsMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Jump to a docs page"
      value={pathname}
      onChange={(event) => router.push(event.target.value)}
      className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-caption text-foreground md:hidden"
    >
      <option value="/docs">Overview</option>
      {groups.map((group) => (
        <optgroup key={group.category} label={group.category}>
          {group.items.map((item) => (
            <option key={item.slug} value={`/docs/components/${item.slug}`}>
              {item.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
