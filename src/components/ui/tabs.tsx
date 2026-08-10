"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import {
  useProximityHover,
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

// ─── Contexts ────────────────────────────────────────────────────────────────
// Base UI doesn't expose a public hook for "which value is active" to
// arbitrary descendants (only its own Root/List/Tab/Panel/Indicator
// components can see that internally) — TabsList needs it to resolve the
// selected tab's index into `itemRects`, so Tabs tracks it itself instead.

interface TabsValueOrderContextValue {
  valueOrder: string[];
  setValueOrder: (order: string[]) => void;
  selectedValue: string | undefined;
}

const TabsValueOrderContext = createContext<TabsValueOrderContextValue | null>(null);

interface TabsListContextValue {
  registerTab: (index: number, element: HTMLElement | null) => void;
  hoveredIndex: number | null;
  selectedValue: string | undefined;
  /** Optimistically set on click so the indicator jumps immediately, without waiting for the controlled value to round-trip back. */
  setOptimisticIndex: (index: number) => void;
}

const TabsListContext = createContext<TabsListContextValue | null>(null);

function useTabsListContext() {
  const ctx = useContext(TabsListContext);
  if (!ctx) throw new Error("TabsTrigger must be used within a TabsList");
  return ctx;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  ...props
}: TabsPrimitive.Root.Props) {
  const [valueOrder, setValueOrder] = useState<string[]>([]);
  const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(defaultValue);

  const updateValueOrder = useCallback((order: string[]) => {
    setValueOrder((current) =>
      current.length === order.length && current.every((v, i) => v === order[i]) ? current : order,
    );
  }, []);

  const resolvedValue = value ?? uncontrolledValue ?? valueOrder[0];

  // Base UI passes (value, eventDetails) — only the value matters here.
  const handleValueChange = useCallback(
    (newValue: unknown, eventDetails: unknown) => {
      if (value === undefined) setUncontrolledValue(newValue);
      (onValueChange as ((v: unknown, e: unknown) => void) | undefined)?.(newValue, eventDetails);
    },
    [onValueChange, value],
  );

  return (
    <TabsValueOrderContext.Provider
      value={{
        valueOrder,
        setValueOrder: updateValueOrder,
        selectedValue: resolvedValue as string | undefined,
      }}
    >
      {/*
        Always controlled: Base UI's useControlled warns in dev when value
        flips undefined → defined. valueOrder is empty on the first commit,
        so fall back to an empty-string sentinel — TabsList's layout effect
        populates valueOrder pre-paint, so the corrected value lands before
        anything is visible.
      */}
      {/* grid, not flex-col: Base UI mounts the incoming panel before
          unmounting the outgoing one, so for one paint frame both panels are
          in the DOM at once. In a flex column that briefly doubles the
          block's height (both panels stacked) — invisible on its own, but
          enough to visibly nudge anything that vertically centers this
          block against a fixed-height box (see docs/design-system.md
          "Preview-grid tile pattern"), which then bleeds into an in-flight
          layout animation like the selected-tab pill's slide. Explicitly
          placing every TabsContent in the same grid cell (below) means an
          overlapping pair shares space instead of stacking, so that
          transient frame never changes the block's height at all — same
          fix TabsTrigger's own ghost-span already uses for width. */}
      <TabsPrimitive.Root
        data-slot="tabs"
        value={resolvedValue ?? ""}
        onValueChange={handleValueChange}
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsValueOrderContext.Provider>
  );
}

// ─── TabsList ────────────────────────────────────────────────────────────────
// Owns the sliding "selected" pill and the proximity hover pill — the same
// measured-rect pattern Accordion's item-highlight uses, applied along the x
// axis since tabs lay out horizontally.

function TabsList({ children, className, ...props }: TabsPrimitive.List.Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseInsideRef = useRef(false);
  const valueOrderCtx = useContext(TabsValueOrderContext);
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);

  const values = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child.props as { value?: string }).value)
    .filter((v): v is string => typeof v === "string");
  const valueOrderKey = values.join(",");
  const setValueOrder = valueOrderCtx?.setValueOrder;

  useLayoutEffect(() => {
    setValueOrder?.(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValueOrder, valueOrderKey]);

  const {
    activeIndex: hoveredIndex,
    setActiveIndex: setHoveredIndex,
    itemRects,
    handlers,
    registerItem,
    measureItems,
  } = useProximityHover(containerRef, { axis: "x" });

  useEffect(() => {
    measureItems();
  }, [measureItems, children]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      isMouseInsideRef.current = true;
      handlers.onMouseMove(e);
    },
    [handlers],
  );

  const handleMouseLeave = useCallback(() => {
    isMouseInsideRef.current = false;
    handlers.onMouseLeave();
  }, [handlers]);

  const selectedValue = valueOrderCtx?.selectedValue;
  const selectedIndex = selectedValue !== undefined ? values.indexOf(selectedValue) : -1;

  useEffect(() => {
    setOptimisticIndex(selectedIndex >= 0 ? selectedIndex : null);
  }, [selectedIndex]);

  const selectedRect: ItemRect | null =
    optimisticIndex !== null ? (itemRects[optimisticIndex] ?? null) : null;
  const hoverRect: ItemRect | null =
    hoveredIndex !== null ? (itemRects[hoveredIndex] ?? null) : null;
  const isHoveringSelected = hoveredIndex === optimisticIndex;
  const isHovering = hoveredIndex !== null && !isHoveringSelected;

  // Auto-index children so callers never hand-thread an index just for
  // proximity hover/rect tracking — mirrors Accordion's indexedChildren.
  const indexedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ _index?: number }>, { _index: index });
  });

  return (
    <TabsListContext.Provider
      value={{
        registerTab: registerItem,
        hoveredIndex,
        selectedValue,
        setOptimisticIndex,
      }}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        ref={(node: HTMLDivElement | null) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={(e: React.FocusEvent) => {
          const trigger = (e.target as HTMLElement).closest("[data-proximity-index]");
          const indexAttr = trigger?.getAttribute("data-proximity-index");
          if (indexAttr != null) setHoveredIndex(Number(indexAttr));
        }}
        onBlur={(e: React.FocusEvent) => {
          if (containerRef.current?.contains(e.relatedTarget as Node)) return;
          if (!isMouseInsideRef.current) setHoveredIndex(null);
        }}
        className={cn(
          "relative col-start-1 row-start-1 inline-flex w-fit items-center gap-0.5 rounded-lg bg-background p-1 text-muted-foreground shadow-well",
          className,
        )}
        {...props}
      >
        {selectedRect && (
          <motion.div
            layout
            className="pointer-events-none absolute rounded-md bg-card shadow-bevel"
            style={{
              left: selectedRect.left,
              top: selectedRect.top,
              width: selectedRect.width,
              height: selectedRect.height,
            }}
            initial={false}
            animate={{ opacity: isHovering ? 0.85 : 1 }}
            transition={{ ...spring.moderate.enter, opacity: { duration: 0.08 } }}
          />
        )}

        <AnimatePresence>
          {hoverRect && !isHoveringSelected && selectedRect && (
            <motion.div
              layout
              className={cn("pointer-events-none absolute rounded-md", proximityHoverWashClassName)}
              style={{
                left: hoverRect.left,
                top: hoverRect.top,
                width: hoverRect.width,
                height: hoverRect.height,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: proximityHoverWashOpacity }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={spring.fast.enter}
            />
          )}
        </AnimatePresence>

        {indexedChildren}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}

// ─── TabsTrigger ─────────────────────────────────────────────────────────────

function TabsTrigger({
  className,
  children,
  onClick,
  _index = 0,
  ...props
}: TabsPrimitive.Tab.Props & { _index?: number }) {
  const { registerTab, hoveredIndex, selectedValue, setOptimisticIndex } = useTabsListContext();
  const ref = useRef<HTMLElement>(null);

  // useLayoutEffect, not useEffect: pairs with useProximityHover's
  // registration-tick effect so the selected pill is measured and painted in
  // the same pre-paint commit as mount, instead of popping in a frame later.
  useLayoutEffect(() => {
    registerTab(_index, ref.current);
    return () => registerTab(_index, null);
  }, [_index, registerTab]);

  const isSelected = selectedValue === props.value;
  const isActive = hoveredIndex === _index || isSelected;

  return (
    <TabsPrimitive.Tab
      ref={ref}
      data-slot="tabs-trigger"
      data-proximity-index={_index}
      // Composed, not spread-overridable: a consumer onClick must not
      // replace the optimistic indicator jump.
      onClick={(e) => {
        setOptimisticIndex(_index);
        onClick?.(e);
      }}
      className={cn(
        "relative z-10 inline-flex h-8 items-center justify-center rounded-md px-3 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/* Ghost-span: an invisible copy at the heaviest weight reserves the
          width so the visible copy's weight can animate without reflowing
          the tab. Each stacked copy is its own flex row (not the outer Tab)
          so an icon + label child pair still lays out side by side within
          each copy. */}
      <span className="col-start-1 row-start-1 grid text-control">
        <span
          className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5"
          style={{ fontVariationSettings: fontWeights.medium }}
          aria-hidden="true"
        >
          {children}
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center gap-1.5 transition-colors duration-fast",
            isActive ? "text-foreground" : "text-muted-foreground",
          )}
          style={{ fontVariationSettings: isSelected ? fontWeights.medium : fontWeights.normal }}
        >
          {children}
        </span>
      </span>
    </TabsPrimitive.Tab>
  );
}

// ─── TabsContent ─────────────────────────────────────────────────────────────

function TabsContent({ className, render: _render, ...props }: TabsPrimitive.Panel.Props) {
  const reduceMotion = useReducedMotion();

  return (
    <TabsPrimitive.Panel
      {...props}
      render={(panelProps, state) => {
        const exiting = state.transitionStatus === "ending";
        const offset = reduceMotion
          ? { x: 0, y: 0 }
          : {
              x:
                state.tabActivationDirection === "right"
                  ? 4
                  : state.tabActivationDirection === "left"
                    ? -4
                    : 0,
              y:
                state.tabActivationDirection === "down"
                  ? 4
                  : state.tabActivationDirection === "up"
                    ? -4
                    : 0,
            };

        return (
          <motion.div
            {...(panelProps as Record<string, unknown>)}
            data-slot="tabs-content"
            // min-w-0: grid items default to min-width:auto, so an unbreakable
            // child (the code block's <pre>, which never wraps) pushes the
            // implicit grid column — and with it this whole tab card — wider than
            // its container instead of triggering the pre's own overflow-x.
            className={cn("col-start-1 row-start-2 min-w-0 outline-none", className)}
            initial={{ opacity: 0, ...offset }}
            animate={{
              opacity: exiting ? 0 : 1,
              x: exiting ? -offset.x : 0,
              y: exiting ? -offset.y : 0,
            }}
            transition={exiting ? spring.quick.exit : spring.moderate.enter}
          />
        );
      }}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
