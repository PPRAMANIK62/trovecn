"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { getComponentsByCategory } from "@/lib/components-registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Brand } from "@/components/site/brand";

const groups = getComponentsByCategory();

const pinned = [
  { label: "Introduction", href: "/docs" },
  { label: "Components", href: "/docs/components" },
];

/**
 * Below `lg`, `DocsSidebar` isn't rendered inline — the fixed-width column
 * reads as cramped rather than navigable once the content panel next to it
 * has already given up most of its own width. This is that same category
 * list, reachable instead from a trigger in the content panel's nav and
 * presented as an overlay so it can take a comfortable width without
 * competing with the page for space.
 */
const populatedGroups = groups.filter((group) => group.items.length > 0);

export function DocsMobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="elevated" size="sm" className="text-2xs">
            <Menu className="size-2.5" />
            Components
          </Button>
        }
      />
      <SheetContent side="left" showCloseButton={false} aria-describedby={undefined}>
        <SheetHeader>
          <Brand />
          <SheetTitle className="sr-only">Components navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-8 py-6 text-minor">
          <ul className="flex flex-col gap-0.5 text-caption">
            {pinned.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {populatedGroups.length === 0 ? (
            <p className="text-muted-foreground">No components yet — check back soon.</p>
          ) : (
            populatedGroups.map((group) => (
              <div key={group.category}>
                <p className="flex items-baseline gap-1.5 text-label uppercase text-muted-foreground">
                  {group.category}
                  <span className="text-muted-foreground/60">{group.items.length}</span>
                </p>
                <ul className="mt-2.5 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const href = `/docs/components/${item.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
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
            ))
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
