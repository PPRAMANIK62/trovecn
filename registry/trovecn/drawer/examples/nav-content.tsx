"use client";

import { useRef } from "react";
import {
  HashIcon,
  HelpCircleIcon,
  HomeIcon,
  InboxIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { ProximityRow } from "./proximity-row";

const sections = [
  {
    label: "Workspace",
    items: [
      { icon: HomeIcon, label: "Home" },
      { icon: InboxIcon, label: "Inbox" },
      { icon: SettingsIcon, label: "Settings" },
      { icon: HelpCircleIcon, label: "Help" },
    ],
  },
  {
    label: "Favorites",
    items: [
      { icon: HashIcon, label: "Design system" },
      { icon: HashIcon, label: "Roadmap" },
      { icon: HashIcon, label: "Q3 planning" },
    ],
  },
];

/**
 * Nav-style link list — the classic left drawer / app-shell sidebar pattern
 * (grouped sections + a pinned account footer, the same shape
 * `ui.shadcn.com/blocks/sidebar`'s "sidebar with user footer" block and most
 * real app shells settle on — Linear, Vercel, Notion). Shared by the
 * standalone and side demos, so a left-anchored drawer always shows the
 * same content. Reuses the exact header/list/row/pill spacing and color
 * treatment `DocsMobileSidebar` already establishes at this same `w-64`
 * drawer width, rather than inventing a parallel set of values. One
 * `useProximityHover` container spans both sections — the running `index`
 * counter continues across the section boundary rather than resetting, so
 * the hover pill can travel between them.
 */
export function DrawerNavContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

  let index = -1;

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Menu</DrawerTitle>
      </DrawerHeader>
      <nav className="flex-1 overflow-y-auto text-minor">
        <div
          ref={containerRef}
          className="relative flex flex-col gap-6 px-8 py-6"
          onMouseMove={handlers.onMouseMove}
          onMouseEnter={handlers.onMouseEnter}
          onMouseLeave={handlers.onMouseLeave}
        >
          <ProximityHoverPill
            activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
            sessionKey={sessionRef.current}
          />
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1.5 text-label text-muted-foreground uppercase">
                {section.label}
              </p>
              {section.items.map(({ icon: Icon, label }) => {
                index += 1;
                return (
                  <ProximityRow
                    key={label}
                    index={index}
                    registerItem={registerItem}
                    className="group flex items-center gap-3 rounded-lg px-3 py-1.5 text-left text-caption text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    {label}
                  </ProximityRow>
                );
              })}
            </div>
          ))}
        </div>
      </nav>
      <div className="flex shrink-0 items-center gap-2.5 border-t border-border px-6 py-4">
        <div
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-foreground"
        >
          M
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-medium text-foreground">Mariko Sato</p>
          <p className="truncate text-meta text-muted-foreground">mariko@trove.cn</p>
        </div>
        <Button variant="ghost" size="icon-sm" className="shrink-0">
          <LogOutIcon />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </>
  );
}
