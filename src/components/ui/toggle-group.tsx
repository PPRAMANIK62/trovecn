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
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import {
  useProximityHover,
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToggleGroupContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  hoveredIndex: number | null;
  multiple: boolean;
  /** Optimistically set on click so the single-select indicator jumps immediately, without waiting for the controlled value to round-trip back (mirrors tabs.tsx). */
  setOptimisticIndex: (index: number) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext() {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  return ctx;
}

// ─── ToggleGroup ─────────────────────────────────────────────────────────────
// Translates a `type: "single" | "multiple"` public API onto Base UI's
// ToggleGroup, which always represents pressed state as `value: string[]`
// plus a `multiple` boolean — same baseValue/baseOnValueChange translation
// accordion.tsx already uses for its own single/multiple split.
//
// Single-select mode ports tabs.tsx's active-segment-indicator recipe
// directly: exactly one moving "selected" rect (spring.moderate, `layout`
// prop so it FLIP-animates between items) plus a separate spring.fast
// proximity-hover pill underneath. Multi-select mode is an intentional scope
// reduction (see docs/research/selection-inputs-motion-research.md) — no
// merge/split geometry (that's CheckboxGroup's job); each pressed item just
// gets a persistent `bg-accent/20` tint, the same idea as Accordion's
// expanded-item tint layer, applied per item rather than as a shared moving
// rect, with the same spring.fast hover pill layered on top.

type ToggleGroupSingleProps = {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupProps = Omit<
  React.ComponentProps<"div">,
  "value" | "defaultValue" | "onChange" | "onFocus" | "onBlur"
> & {
  children: ReactNode;
  disabled?: boolean;
  /** @default "horizontal" — the sliding single-select indicator assumes a horizontal strip, same scope as tabs.tsx. */
  orientation?: "horizontal" | "vertical";
} & (ToggleGroupSingleProps | ToggleGroupMultipleProps);

function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    type = "single",
    disabled,
    orientation = "horizontal",
    className,
    // Pulled out so they don't leak into `...htmlProps` below and override
    // the translated `value`/`onValueChange` passed to ToggleGroupPrimitive
    // (mirrors accordion.tsx's identical guard).
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = props;
  const multiple = type === "multiple";

  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseInsideRef = useRef(false);
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);

  const [internalSingleValue, setInternalSingleValue] = useState<string>(() =>
    type === "single" ? ((props as ToggleGroupSingleProps).defaultValue ?? "") : "",
  );
  const [internalMultipleValue, setInternalMultipleValue] = useState<string[]>(() =>
    type === "multiple" ? ((props as ToggleGroupMultipleProps).defaultValue ?? []) : [],
  );

  const singleValue =
    type === "single" ? ((props as ToggleGroupSingleProps).value ?? internalSingleValue) : "";

  // Translate the single/multiple public API → Base UI's always-array API.
  const baseValue: string[] = multiple
    ? ((props as ToggleGroupMultipleProps).value ?? internalMultipleValue)
    : singleValue
      ? [singleValue]
      : [];

  const baseOnValueChange = (next: string[]) => {
    if (multiple) {
      const mp = props as ToggleGroupMultipleProps;
      if (mp.onValueChange) mp.onValueChange(next);
      else setInternalMultipleValue(next);
    } else {
      const sp = props as ToggleGroupSingleProps;
      if (sp.onValueChange) sp.onValueChange(next[0] ?? "");
      else setInternalSingleValue(next[0] ?? "");
    }
  };

  // Item order, read directly from children (mirrors tabs.tsx's TabsList) —
  // ToggleGroup already has direct access to its children, no separate
  // registration channel needed just to resolve a value into an index.
  const values = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child.props as { value?: string }).value)
    .filter((v): v is string => typeof v === "string");

  const selectedIndex = !multiple && singleValue ? values.indexOf(singleValue) : -1;

  useEffect(() => {
    if (multiple) return;
    setOptimisticIndex(selectedIndex >= 0 ? selectedIndex : null);
  }, [selectedIndex, multiple]);

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

  const selectedRect: ItemRect | null =
    !multiple && optimisticIndex !== null ? (itemRects[optimisticIndex] ?? null) : null;
  const hoverRect: ItemRect | null =
    hoveredIndex !== null ? (itemRects[hoveredIndex] ?? null) : null;
  const isHoveringSelected =
    !multiple && optimisticIndex !== null && hoveredIndex === optimisticIndex;
  const showHoverPill = hoveredIndex !== null && !isHoveringSelected;

  // Auto-index children so callers never hand-thread an index just for
  // proximity hover/rect tracking (mirrors Accordion/Tabs).
  const indexedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ _index?: number }>, { _index: index });
  });

  // Memoized: the group re-renders on every proximity-hover mousemove; a
  // fresh context object each time would re-render every item with it.
  const contextValue = useMemo<ToggleGroupContextValue>(
    () => ({ registerItem, hoveredIndex, multiple, setOptimisticIndex }),
    [registerItem, hoveredIndex, multiple],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        value={baseValue}
        onValueChange={baseOnValueChange}
        multiple={multiple}
        disabled={disabled}
        orientation={orientation}
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
          "relative inline-flex w-fit items-center gap-0.5 rounded-lg bg-background p-1 text-muted-foreground shadow-well",
          orientation === "vertical" && "flex-col",
          className,
        )}
        {...rest}
      >
        {!multiple && selectedRect && (
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
            animate={{ opacity: isHoveringSelected ? 0.85 : 1 }}
            transition={{ ...spring.moderate.enter, opacity: { duration: 0.08 } }}
          />
        )}

        <AnimatePresence>
          {hoverRect && showHoverPill && (
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
      </ToggleGroupPrimitive>
    </ToggleGroupContext.Provider>
  );
}

// ─── ToggleGroupItem ─────────────────────────────────────────────────────────

interface ToggleGroupItemProps extends Omit<TogglePrimitive.Props, "render" | "value"> {
  value: string;
  /** Position for proximity hover — auto-assigned from child order; pass explicitly only to override it. */
  _index?: number;
}

function ToggleGroupItem({ className, onClick, _index = 0, ...props }: ToggleGroupItemProps) {
  const { registerItem, hoveredIndex, multiple, setOptimisticIndex } = useToggleGroupContext();
  const ref = useRef<HTMLButtonElement>(null);

  // useLayoutEffect, not useEffect: pairs with useProximityHover's
  // registration-tick effect so the selected/hover rects are measured and
  // painted in the same pre-paint commit as mount (mirrors tabs.tsx).
  useLayoutEffect(() => {
    registerItem(_index, ref.current);
    return () => registerItem(_index, null);
  }, [_index, registerItem]);

  const isHovered = hoveredIndex === _index;

  return (
    <TogglePrimitive
      ref={ref}
      data-slot="toggle-group-item"
      data-proximity-index={_index}
      // Composed, not spread-overridable: a consumer onClick must not
      // replace the optimistic indicator jump.
      onClick={(e) => {
        if (!multiple) setOptimisticIndex(_index);
        onClick?.(e);
      }}
      className={cn(
        "relative z-10 inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-control whitespace-nowrap outline-none transition-colors duration-fast select-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[pressed]:text-foreground",
        isHovered ? "text-foreground" : "text-muted-foreground",
        // Multi-select's persistent per-item tint — not a moving/merging
        // block, just this item's own background when pressed (see the
        // scope-reduction note on ToggleGroup above).
        multiple && "data-[pressed]:bg-accent/20 dark:data-[pressed]:bg-accent/12",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
