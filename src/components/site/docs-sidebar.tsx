"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";

import { getComponentsByCategory } from "@/lib/components-registry";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { SidebarNavLink, SidebarHoverPill } from "@/components/site/sidebar-nav-link";

const groups = getComponentsByCategory();

export function DocsSidebar() {
  const pathname = usePathname();
  const populatedGroups = groups.filter((group) => group.items.length > 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

  if (populatedGroups.length === 0) {
    return <p className="text-minor text-muted-foreground">No components yet — check back soon.</p>;
  }

  let index = -1;

  return (
    <nav className="text-minor">
      <div
        ref={containerRef}
        className="relative flex flex-col gap-6"
        onMouseMove={handlers.onMouseMove}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
      >
        <SidebarHoverPill
          activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
          sessionKey={sessionRef.current}
        />
        {populatedGroups.map((group) => (
          <div key={group.category}>
            <p className="text-label uppercase text-muted-foreground">{group.category}</p>
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
                    >
                      {item.title}
                    </SidebarNavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
