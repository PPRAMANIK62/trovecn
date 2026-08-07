"use client";

import { useRef, type ComponentProps } from "react";
import {
  BellIcon,
  ChevronRightIcon,
  CopyIcon,
  LockIcon,
  PaletteIcon,
  PencilIcon,
  RefreshCwIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { ProximityHoverPill, ProximityRow } from "./proximity-row";
import { SheetNavContent } from "./nav-content";

/**
 * Compact banner content — top sheets are shallow, so a single row is all
 * that fits. `p-6` matches Dialog/Popover's own content padding scale.
 */
function TopDemo() {
  return (
    <div className="flex items-center justify-between gap-4 p-6">
      <p className="text-caption text-foreground">A new version of trove/cn is available.</p>
      <Button size="sm" variant="outline" className="shrink-0">
        <RefreshCwIcon />
        Refresh
      </Button>
    </div>
  );
}

/** Settings-style row list — the natural fit for a right-anchored panel. */
function RightDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);

  const rows = [
    { icon: BellIcon, label: "Notifications" },
    { icon: PaletteIcon, label: "Appearance" },
    { icon: LockIcon, label: "Privacy" },
  ];

  return (
    <>
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
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
          {rows.map(({ icon: Icon, label }, index) => (
            <ProximityRow
              key={label}
              index={index}
              registerItem={registerItem}
              className="group flex items-center gap-3 rounded-lg px-3 py-1.5 text-left text-caption text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span className="flex-1">{label}</span>
              <ChevronRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </ProximityRow>
          ))}
        </div>
      </nav>
    </>
  );
}

/**
 * Icon-row action sheet — a vertical list reads as too sparse across a bottom
 * sheet's full viewport width, so this mirrors the iOS/Android share-sheet
 * layout instead: actions arranged in a row, proximity hover resolved along
 * the x-axis.
 */
function BottomDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } = useProximityHover(
    containerRef,
    { axis: "x" },
  );

  const actions = [
    { icon: Share2Icon, label: "Share" },
    { icon: CopyIcon, label: "Duplicate" },
    { icon: PencilIcon, label: "Rename" },
    { icon: Trash2Icon, label: "Delete", destructive: true },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex items-start justify-around gap-2 p-6"
      onMouseMove={handlers.onMouseMove}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
    >
      <ProximityHoverPill
        activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
        sessionKey={sessionRef.current}
      />
      {actions.map(({ icon: Icon, label, destructive }, index) => (
        <ProximityRow
          key={label}
          index={index}
          registerItem={registerItem}
          className="flex flex-col items-center gap-2 rounded-lg px-3 py-2"
        >
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full bg-muted",
              destructive ? "text-destructive" : "text-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
          <span
            className={cn(
              "text-caption",
              destructive ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </ProximityRow>
      ))}
    </div>
  );
}

const sides = [
  { side: "top", content: TopDemo },
  { side: "right", content: RightDemo },
  { side: "bottom", content: BottomDemo },
  { side: "left", content: SheetNavContent },
] as const satisfies {
  side: ComponentProps<typeof SheetContent>["side"];
  content: () => React.JSX.Element;
}[];

export default function SheetSideExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map(({ side, content: Content }) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" className="capitalize" />}>
            {side}
          </SheetTrigger>
          <SheetContent side={side}>
            <Content />
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
