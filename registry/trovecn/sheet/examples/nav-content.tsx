"use client";

import { useRef } from "react";
import { HelpCircleIcon, HomeIcon, InboxIcon, SettingsIcon } from "lucide-react";

import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { ProximityHoverPill, ProximityRow } from "./proximity-row";

const links = [
  { icon: HomeIcon, label: "Home" },
  { icon: InboxIcon, label: "Inbox" },
  { icon: SettingsIcon, label: "Settings" },
  { icon: HelpCircleIcon, label: "Help" },
];

/**
 * Nav-style link list — the classic left drawer / app-shell sidebar pattern.
 * Shared by the standalone and side demos, so a left-anchored sheet always
 * shows the same content. Reuses the exact header/list/row/pill spacing and
 * color treatment `DocsMobileSidebar` already established at this same
 * `w-64` sheet width, rather than inventing a parallel set of values.
 */
export function SheetNavContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>
      <nav className="text-minor">
        <div
          ref={containerRef}
          className="relative flex flex-col gap-0.5 px-8 py-6"
          onMouseMove={handlers.onMouseMove}
          onMouseEnter={handlers.onMouseEnter}
          onMouseLeave={handlers.onMouseLeave}
        >
          <ProximityHoverPill
            activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
            sessionKey={sessionRef.current}
          />
          {links.map(({ icon: Icon, label }, index) => (
            <ProximityRow
              key={label}
              index={index}
              registerItem={registerItem}
              className="group flex items-center gap-3 rounded-lg px-3 py-1.5 text-left text-caption text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              {label}
            </ProximityRow>
          ))}
        </div>
      </nav>
    </>
  );
}
