"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-8 w-fit items-center gap-0.5 rounded-md bg-background p-[3px] text-muted-foreground shadow-well",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The sliding chip: Base UI measures the active tab and exposes its rect as
 * CSS vars (--active-tab-left/width/…) on this span, so it works for any
 * number/width of tabs without us hand-measuring anything. Positioned with
 * left/width rather than a transform because those vars are the only handle
 * Base UI gives us — same tradeoff the accordion's item-highlight pill
 * already makes (src/components/ui/accordion.tsx), so this isn't a new
 * exception to "transform/opacity only," just the same one.
 */
function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute rounded-sm bg-card shadow-bevel transition-[left,width] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)]",
        className,
      )}
      style={{
        left: "var(--active-tab-left)",
        top: "var(--active-tab-top)",
        width: "var(--active-tab-width)",
        height: "var(--active-tab-height)",
      }}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-1 inline-flex h-[26px] items-center justify-center rounded-sm px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors data-active:text-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsIndicator, TabsTrigger, TabsContent };
