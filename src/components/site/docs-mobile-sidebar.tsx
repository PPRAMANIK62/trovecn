"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { getComponentsByCategory } from "@/lib/components-registry";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Brand } from "@/components/site/brand";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { SidebarNavLink, SidebarNewDot } from "@/components/site/sidebar-nav-link";

const groups = getComponentsByCategory();

const pinned = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

  let index = -1;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button variant="elevated" size="sm" className="text-2xs">
            <Menu className="size-2.5" />
            Components
          </Button>
        }
      />
      <DrawerContent side="left" aria-describedby={undefined}>
        <DrawerHeader>
          <Brand />
          <DrawerTitle className="sr-only">Components navigation</DrawerTitle>
        </DrawerHeader>
        <nav className="text-minor">
          <div
            ref={containerRef}
            className="relative flex flex-col gap-6 overflow-y-auto overscroll-contain px-8 py-6"
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
          >
            <ProximityHoverPill
              activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
              sessionKey={sessionRef.current}
            />
            <ul className="flex flex-col gap-0.5 text-caption">
              {pinned.map((item) => {
                index += 1;
                const itemIndex = index;
                return (
                  <li key={item.href}>
                    <SidebarNavLink
                      href={item.href}
                      index={itemIndex}
                      active={pathname === item.href}
                      registerItem={registerItem}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </SidebarNavLink>
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
                      index += 1;
                      const itemIndex = index;
                      const href = `/docs/components/${item.slug}`;
                      return (
                        <li key={item.slug}>
                          <SidebarNavLink
                            href={href}
                            index={itemIndex}
                            active={pathname === href}
                            registerItem={registerItem}
                            onClick={() => setOpen(false)}
                          >
                            {item.title}
                            {item.isNew && <SidebarNewDot />}
                          </SidebarNavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
