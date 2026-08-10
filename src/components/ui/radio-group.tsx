"use client";

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { useProximityHover, type ItemRect } from "@/hooks/use-proximity-hover";

/**
 * Same shape as `TabsList`'s selected-pill tracking (`src/components/ui/tabs.tsx`),
 * applied to a mutually-exclusive radio list instead of a tab strip: a
 * single continuously-tracked "selected index → its measured rect"
 * background, no merge/split geometry needed since a radio group can only
 * ever have 0 or 1 selected item. A separate `useProximityHover` pill
 * previews whichever row the cursor is nearest, same as every other
 * proximity-hover list in this repo.
 */

// ─── Context ─────────────────────────────────────────────────────────────────

interface RadioGroupContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  hoveredIndex: number | null;
  selectedValue: string | undefined;
  /** Optimistically set on click so the selected pill jumps immediately, without waiting for the controlled value to round-trip back. */
  setOptimisticIndex: (index: number) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within a RadioGroup");
  return ctx;
}

// ─── RadioGroup ──────────────────────────────────────────────────────────────
// Owns the sliding "selected" background and the proximity hover pill — the
// same measured-rect pattern as TabsList, applied along the y axis since
// radio groups in this repo lay out as a vertical list of rows.

function RadioGroup({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  name,
  ...props
}: RadioGroupPrimitive.Props<string>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseInsideRef = useRef(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);

  const resolvedValue = value ?? uncontrolledValue;

  const handleValueChange = useCallback(
    (newValue: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => {
      if (value === undefined) setUncontrolledValue(newValue);
      onValueChange?.(newValue, eventDetails);
    },
    [onValueChange, value],
  );

  const values = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => (child.props as { value?: string }).value)
    .filter((v): v is string => typeof v === "string");

  const selectedIndex = resolvedValue !== undefined ? values.indexOf(resolvedValue) : -1;

  useEffect(() => {
    setOptimisticIndex(selectedIndex >= 0 ? selectedIndex : null);
  }, [selectedIndex]);

  const {
    activeIndex: hoveredIndex,
    setActiveIndex: setHoveredIndex,
    itemRects,
    sessionRef,
    handlers,
    registerItem,
    measureItems,
  } = useProximityHover(containerRef, { axis: "y" });

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
    optimisticIndex !== null ? (itemRects[optimisticIndex] ?? null) : null;
  const hoverRect: ItemRect | null =
    hoveredIndex !== null ? (itemRects[hoveredIndex] ?? null) : null;
  const isHoveringSelected = hoveredIndex === optimisticIndex;
  const isHovering = hoveredIndex !== null && !isHoveringSelected;

  // Auto-index children so callers never hand-thread an index just for
  // proximity hover/rect tracking — mirrors Accordion's/Tabs' indexedChildren.
  const indexedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ _index?: number }>, { _index: index });
  });

  // Memoized: RadioGroupItem's registration effect depends on this whole
  // context value (not just `registerItem`), so an unmemoized object literal
  // here would change identity every render — including every render this
  // very effect's own registerItem call triggers via useProximityHover's
  // registerTick — which reruns the effect, re-registers, and loops forever
  // ("Maximum update depth exceeded"). Mirrors Accordion/CheckboxGroup/
  // ToggleGroup's identical memoization guard.
  const contextValue = useMemo(
    () => ({
      registerItem,
      hoveredIndex,
      selectedValue: resolvedValue,
      setOptimisticIndex,
    }),
    [registerItem, hoveredIndex, resolvedValue, setOptimisticIndex],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <RadioGroupPrimitive
        data-slot="radio-group"
        value={resolvedValue}
        onValueChange={handleValueChange}
        name={name}
        ref={(node: HTMLDivElement | null) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={(e: React.FocusEvent) => {
          const item = (e.target as HTMLElement).closest("[data-proximity-index]");
          const indexAttr = item?.getAttribute("data-proximity-index");
          if (indexAttr != null) setHoveredIndex(Number(indexAttr));
        }}
        onBlur={(e: React.FocusEvent) => {
          if (containerRef.current?.contains(e.relatedTarget as Node)) return;
          if (!isMouseInsideRef.current) setHoveredIndex(null);
        }}
        className={cn("relative flex w-full flex-col gap-0.5", className)}
        {...props}
      >
        {selectedRect && (
          <motion.div
            layout
            className="pointer-events-none absolute rounded-lg bg-active"
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

        <ProximityHoverPill
          activeRect={isHoveringSelected ? null : hoverRect}
          sessionKey={sessionRef.current}
        />

        {indexedChildren}
      </RadioGroupPrimitive>
    </RadioGroupContext.Provider>
  );
}

// ─── RadioGroupItem ──────────────────────────────────────────────────────────
// The whole clickable row — Radio.Root itself, not just the visual dot — so
// the measured rect registered for proximity hover/the selected background
// covers the full row, same as AccordionTrigger/TabsTrigger register their
// own full element rather than an inner icon.

interface RadioGroupItemProps extends Omit<Radio.Root.Props<string>, "ref"> {
  /** Position for proximity hover/selected-rect tracking — auto-assigned from child order via RadioGroup's indexedChildren. */
  _index?: number;
}

const RadioGroupItem = forwardRef<HTMLSpanElement, RadioGroupItemProps>(
  ({ value, className, children, disabled, onClick, _index = 0, ...props }, forwardedRef) => {
    const ctx = useRadioGroupContext();
    const internalRef = useRef<HTMLSpanElement>(null);
    // Gates the dot's initial pop-in: an already-selected radio must not
    // visibly pop on first paint, only when selection changes afterward —
    // same hasMountedRef gate switch.tsx uses for its thumb spring.
    const hasMountedRef = useRef(false);

    useLayoutEffect(() => {
      ctx.registerItem(_index, internalRef.current);
      return () => ctx.registerItem(_index, null);
    }, [_index, ctx]);

    useEffect(() => {
      hasMountedRef.current = true;
    }, []);

    const isSelected = ctx.selectedValue === value;
    const isActive = ctx.hoveredIndex === _index || isSelected;

    return (
      <Radio.Root
        value={value}
        disabled={disabled}
        ref={(node: HTMLSpanElement | null) => {
          (internalRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef)
            (forwardedRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        }}
        data-slot="radio-group-item"
        data-proximity-index={_index}
        // Composed, not spread-overridable: a consumer onClick must not
        // replace the optimistic selected-pill jump.
        onClick={(e) => {
          ctx.setOptimisticIndex(_index);
          onClick?.(e);
        }}
        className={cn(
          "relative z-10 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <Radio.Indicator
          keepMounted
          data-slot="radio-group-item-indicator"
          className={cn(
            "relative flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-fast",
            isSelected ? "border-foreground" : isActive ? "border-foreground/50" : "border-input",
          )}
        >
          <AnimatePresence initial={false}>
            {isSelected && (
              <motion.span
                key="dot"
                className="block size-2 rounded-full bg-foreground"
                initial={{
                  opacity: hasMountedRef.current ? 0 : 1,
                  scale: hasMountedRef.current ? 0.3 : 1,
                }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.04 } }}
                transition={spring.fast.enter}
              />
            )}
          </AnimatePresence>
        </Radio.Indicator>

        {children && <span className="flex-1 text-control text-foreground">{children}</span>}
      </Radio.Root>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
