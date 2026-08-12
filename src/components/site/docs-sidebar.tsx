"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";

import { getComponentsByCategory } from "@/lib/components-registry";
import { examples } from "@/lib/examples-registry";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { SidebarNavLink, SidebarNewDot } from "@/components/site/sidebar-nav-link";

const groups = getComponentsByCategory();

const pinned = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Components", href: "/docs/components" },
  { label: "Examples", href: "/docs/examples" },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const populatedGroups = groups.filter((group) => group.items.length > 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

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
        <ProximityHoverPill
          activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
          sessionKey={sessionRef.current}
        />
        <ul className="flex flex-col gap-0.5">
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
                >
                  {item.label}
                </SidebarNavLink>
              </li>
            );
          })}
        </ul>
        {examples.length > 0 ? (
          <div>
            <p className="text-label uppercase text-muted-foreground">Examples</p>
            <ul className="mt-2.5 flex flex-col gap-0.5">
              {examples.map((example) => {
                index += 1;
                const itemIndex = index;
                const href = `/docs/examples/${example.slug}`;
                return (
                  <li key={example.slug}>
                    <SidebarNavLink
                      href={href}
                      index={itemIndex}
                      active={pathname === href}
                      registerItem={registerItem}
                    >
                      {example.title}
                    </SidebarNavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {populatedGroups.length === 0 ? (
          <p className="text-muted-foreground">No components yet — check back soon.</p>
        ) : (
          populatedGroups.map((group) => (
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
  );
}
