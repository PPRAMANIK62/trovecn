"use client";

import {
  Children,
  isValidElement,
  cloneElement,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import {
  useProximityHover,
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

// SSR-safe layout effect (client components still server-render in Next).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Contexts ────────────────────────────────────────────────────────────────

interface AccordionContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  registerFullItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  remeasure: () => void;
  openValues: Set<string>;
  openItemRects: Map<number, ItemRect>;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within an Accordion");
  return ctx;
}

interface AccordionItemContextValue {
  index?: number;
  value: string;
  isOpen: boolean;
  triggerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx)
    throw new Error("AccordionTrigger/AccordionContent must be used within an AccordionItem");
  return ctx;
}

// ─── Accordion ───────────────────────────────────────────────────────────────
// Every item shares one container: a background pill morphs between the item
// nearest the cursor and the currently open item(s) — the "proximity hover"
// principle (docs/design-system.md) applied to an accordion stack. Applies
// uniformly whether the accordion holds one item or many — a primitive looks
// and moves identically no matter which pattern embeds it.

type AccordionSingleProps = {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type AccordionMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "onFocus" | "onBlur"> & {
  children: ReactNode;
} & (AccordionSingleProps | AccordionMultipleProps);

const Accordion = forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  const { children, type = "single", className, ...rest } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const fullItemElementsRef = useRef<Map<number, HTMLElement>>(new Map());
  const [openItemRects, setOpenItemRects] = useState<Map<number, ItemRect>>(new Map());
  const openItemRectsRef = useRef(openItemRects);

  const {
    activeIndex,
    setActiveIndex,
    itemRects,
    sessionRef,
    handlers,
    registerItem,
    measureItems,
  } = useProximityHover(containerRef);

  const registerFullItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) fullItemElementsRef.current.set(index, element);
    else fullItemElementsRef.current.delete(index);
  }, []);

  const measureFullItems = useCallback(() => {
    if (!containerRef.current) return;
    const next = new Map<number, ItemRect>();
    fullItemElementsRef.current.forEach((el, idx) => {
      next.set(idx, {
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    });
    // Skip the state update when nothing moved (mirrors the proximity hook's
    // measureItems guard) — this runs per animation frame via onUpdate, and
    // an unconditional set would invalidate the group context and re-render
    // every item even on no-op remeasures.
    const prev = openItemRectsRef.current;
    let changed = prev.size !== next.size;
    if (!changed) {
      for (const [idx, r] of next) {
        const p = prev.get(idx);
        if (
          !p ||
          p.top !== r.top ||
          p.left !== r.left ||
          p.width !== r.width ||
          p.height !== r.height
        ) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;
    openItemRectsRef.current = next;
    setOpenItemRects(next);
  }, []);

  const [internalSingleValue, setInternalSingleValue] = useState<string>(() =>
    type === "single" ? ((props as AccordionSingleProps).defaultValue ?? "") : "",
  );
  const [internalMultipleValue, setInternalMultipleValue] = useState<string[]>(() =>
    type === "multiple" ? ((props as AccordionMultipleProps).defaultValue ?? []) : [],
  );

  const openValuesList: string[] =
    type === "multiple"
      ? ((props as AccordionMultipleProps).value ?? internalMultipleValue)
      : (() => {
          const v = (props as AccordionSingleProps).value ?? internalSingleValue;
          return v ? [v] : [];
        })();

  // Keyed on the joined values so the Set (and the group context value below)
  // keeps a stable identity across re-renders where the open values haven't
  // actually changed.
  const openValuesKey = openValuesList.join(",");
  const openValues = useMemo(() => new Set(openValuesList), [openValuesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    measureItems();
    measureFullItems();
  }, [measureItems, measureFullItems, children]);

  useEffect(() => {
    measureItems();
    measureFullItems();
  }, [measureItems, measureFullItems, openValuesKey]);

  const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
  const isHoveringNonOpen = activeIndex !== null && !openItemRects.has(activeIndex);

  const remeasure = useCallback(() => {
    measureItems();
    measureFullItems();
  }, [measureItems, measureFullItems]);

  // Translate the single/multiple public API → Base UI's Accordion API,
  // which always uses `value: string[]` plus a `multiple: boolean`. In
  // single mode the active value is wrapped in a single-element array.
  const baseValue: string[] =
    type === "multiple"
      ? ((props as AccordionMultipleProps).value ?? internalMultipleValue)
      : (() => {
          const v = (props as AccordionSingleProps).value ?? internalSingleValue;
          return v ? [v] : [];
        })();

  const baseOnValueChange = (next: string[]) => {
    if (type === "multiple") {
      const mp = props as AccordionMultipleProps;
      if (mp.onValueChange) mp.onValueChange(next);
      else setInternalMultipleValue(next);
    } else {
      const sp = props as AccordionSingleProps;
      if (sp.onValueChange) sp.onValueChange(next[0] ?? "");
      else setInternalSingleValue(next[0] ?? "");
    }
  };

  // Memoized: the group re-renders on every proximity-hover mousemove; a
  // fresh context object each time would re-render every item with it.
  const contextValue = useMemo<AccordionContextValue>(
    () => ({ registerItem, registerFullItem, activeIndex, remeasure, openValues, openItemRects }),
    [registerItem, registerFullItem, activeIndex, remeasure, openValues, openItemRects],
  );

  const {
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...htmlProps
  } = rest as Record<string, unknown>;

  // Auto-index items by position so callers never have to hand-thread an
  // `index` prop just to get proximity hover — pass one explicitly only to
  // override the child order (e.g. a fragment-wrapped item).
  const indexedChildren = Children.map(children, (child, position) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ index?: number }>;
    return el.props.index !== undefined ? el : cloneElement(el, { index: position });
  });

  return (
    <AccordionContext.Provider value={contextValue}>
      <AccordionPrimitive.Root
        value={baseValue}
        onValueChange={baseOnValueChange}
        multiple={type === "multiple"}
        ref={(node: HTMLDivElement | null) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-slot="accordion"
        onMouseEnter={handlers.onMouseEnter}
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          // While the cursor is over an *open* item's content (below its
          // trigger), suspend proximity hover — the hover pill shouldn't
          // compete with the persistent open-item tint underneath it.
          const container = containerRef.current;
          if (container) {
            const cRect = container.getBoundingClientRect();
            const localY = e.clientY - cRect.top + container.scrollTop;
            for (const [idx, full] of openItemRects) {
              const trigger = itemRects[idx];
              if (!trigger) continue;
              const contentTop = trigger.top + trigger.height;
              const contentBottom = full.top + full.height;
              if (localY >= contentTop && localY <= contentBottom) {
                setActiveIndex(null);
                return;
              }
            }
          }
          handlers.onMouseMove(e);
        }}
        onMouseLeave={handlers.onMouseLeave}
        className={cn("relative flex w-full flex-col gap-0.5", className)}
        {...(htmlProps as Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">)}
      >
        {/* Expanded item backgrounds — persistent, low-opacity tint under
            whichever item(s) are open. Geometry snaps (duration 0) so it
            hugs the item through its own height-spring animation; only
            opacity fades. */}
        <AnimatePresence>
          {[...openItemRects.entries()].map(([idx, rect]) => (
            <motion.div
              key={`expanded-${idx}`}
              className="pointer-events-none absolute rounded-lg bg-accent/20 dark:bg-accent/12"
              initial={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                opacity: 0,
              }}
              animate={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                opacity: isHoveringNonOpen ? 0.7 : 1,
              }}
              exit={{ opacity: 0, transition: spring.moderate.exit }}
              transition={{
                top: { duration: 0 },
                left: { duration: 0 },
                width: { duration: 0 },
                height: { duration: 0 },
                opacity: { duration: 0.12 },
              }}
            />
          ))}
        </AnimatePresence>

        {/* Hover pill — tracks the item nearest the cursor. A faint
            foreground-tinted wash (not --accent), capped below full
            layer-opacity (see use-proximity-hover.ts) so it stays clearly
            subordinate to the persistent bg-accent/20 expanded-item
            background above, not a second "expanded" look. */}
        <AnimatePresence>
          {activeRect && (
            <motion.div
              key={sessionRef.current}
              className={cn("pointer-events-none absolute rounded-lg", proximityHoverWashClassName)}
              initial={{
                opacity: 0,
                top: activeRect.top,
                left: activeRect.left,
                width: activeRect.width,
                height: activeRect.height,
              }}
              animate={{
                opacity: proximityHoverWashOpacity,
                top: activeRect.top,
                left: activeRect.left,
                width: activeRect.width,
                height: activeRect.height,
              }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={spring.fast.enter}
            />
          )}
        </AnimatePresence>

        {indexedChildren}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

// ─── AccordionItem ───────────────────────────────────────────────────────────

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Position for proximity hover — auto-assigned from child order; pass explicitly only to override it. */
  index?: number;
  disabled?: boolean;
  children: ReactNode;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, index, disabled, children, className, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const ctx = useAccordionContext();

    const isOpen = ctx.openValues.has(value);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (index === undefined) return;
      ctx.registerItem(index, triggerRef.current);
      return () => ctx.registerItem(index, null);
    }, [index, ctx]);

    useEffect(() => {
      if (index === undefined) return;
      ctx.registerFullItem(index, isOpen ? internalRef.current : null);
      return () => ctx.registerFullItem(index, null);
    }, [index, ctx, isOpen]);

    return (
      <AccordionItemContext.Provider value={{ index, value, isOpen, triggerRef }}>
        <AccordionPrimitive.Item
          value={value}
          disabled={disabled}
          ref={(node: HTMLDivElement | null) => {
            (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          data-slot="accordion-item"
          data-proximity-index={index}
          className={className}
          {...props}
        >
          {children}
        </AccordionPrimitive.Item>
      </AccordionItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

// ─── AccordionTrigger ────────────────────────────────────────────────────────

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const ctx = useAccordionContext();
    const { index, isOpen, triggerRef } = useAccordionItemContext();

    const isActive = ctx.activeIndex === index;

    const triggerContent = (
      // Header renders as a <div>: Base UI's default <h3> would be more
      // semantic but the styles above key off it being a plain flex child.
      <AccordionPrimitive.Header render={<div />} data-slot="accordion-header">
        <AccordionPrimitive.Trigger
          ref={ref}
          data-slot="accordion-trigger"
          className={cn(
            "relative z-10 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
            className,
          )}
          {...props}
        >
          {/* Ghost-span: an invisible copy at the heaviest weight reserves
              the width so the visible copy's weight can animate without
              reflowing the row (docs/design-system.md "Ghost-span"). */}
          <span className="col-start-1 row-start-1 grid flex-1 text-left text-body">
            <span
              className="invisible col-start-1 row-start-1"
              style={{ fontVariationSettings: fontWeights.medium }}
              aria-hidden="true"
            >
              {children}
            </span>
            <span
              className={cn(
                "col-start-1 row-start-1 transition-colors duration-80",
                isOpen || isActive ? "text-foreground" : "text-muted-foreground",
              )}
              style={{ fontVariationSettings: isOpen ? fontWeights.medium : fontWeights.normal }}
            >
              {children}
            </span>
          </span>

          <motion.span
            className="inline-flex shrink-0 items-center justify-center"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={spring.fast.enter}
          >
            <ChevronRight
              size={16}
              strokeWidth={isOpen || isActive ? 2 : 1.5}
              className={cn(
                "transition-colors duration-80",
                isOpen || isActive ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </motion.span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );

    return <div ref={triggerRef}>{triggerContent}</div>;
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

// ─── AccordionContent ────────────────────────────────────────────────────────

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    const ctx = useAccordionContext();
    const { isOpen } = useAccordionItemContext();

    // The open height animates to a self-measured LAYOUT pixel value, not
    // `height: "auto"`: framer resolves an "auto" target by measuring the
    // element's *visual* (transformed) size, so under a scaled ancestor the
    // animation would overshoot and snap back at the end of every open.
    // offsetHeight and ResizeObserver are transform-immune.
    const innerRef = useRef<HTMLDivElement | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    // Items open at mount must SNAP (duration 0) on their first pixel target,
    // not spring — framer would measure the spring's numeric start visually
    // and play a shrink. Items that open later spring normally.
    const needsSnap = useRef(isOpen);

    const measureRef = useCallback((el: HTMLDivElement | null) => {
      roRef.current?.disconnect();
      roRef.current = null;
      innerRef.current = el;
      if (!el) return;
      if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
      const ro = new ResizeObserver(() => {
        if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
      });
      ro.observe(el);
      roRef.current = ro;
    }, []);

    // Re-measure synchronously (pre-paint) when opening, so the spring's
    // target is the fresh layout height from its first frame.
    useIsoLayoutEffect(() => {
      if (isOpen && innerRef.current && innerRef.current.offsetHeight > 0) {
        setContentHeight(innerRef.current.offsetHeight);
      }
    }, [isOpen]);

    useEffect(() => {
      if (contentHeight !== null) needsSnap.current = false;
    }, [contentHeight]);

    // Whether the framer-motion height exit animation has fully finished.
    // Base UI's Panel would apply `hidden` the moment a controlled item
    // closes, which is `display: none` and would freeze the exit animation
    // mid-flight — so `hidden` is taken over below and only applied once the
    // exit has actually completed.
    const [exitComplete, setExitComplete] = useState(!isOpen);
    if (isOpen && exitComplete) {
      // Reset during render so the panel is un-hidden before the opening
      // animation's first paint.
      setExitComplete(false);
    }

    // Rendered through `<Panel keepMounted>` so the panel element persists
    // through the exit animation and the trigger ↔ panel ARIA contract stays
    // intact (role="region", aria-labelledby, the id Trigger's
    // aria-controls points to). The framer-motion height animation lives one
    // level down inside the persistent panel element.
    return (
      <AccordionPrimitive.Panel
        keepMounted
        hidden={!isOpen && exitComplete}
        data-slot="accordion-content"
      >
        <motion.div
          ref={ref}
          className={cn("overflow-hidden", className)}
          initial={{ height: isOpen ? "auto" : 0 }}
          animate={{ height: isOpen ? (contentHeight ?? 0) : 0 }}
          // bounce: 0 — pure height looks better without overshoot (moderate is already bounce 0).
          transition={needsSnap.current ? { duration: 0 } : spring.moderate.enter}
          onUpdate={() => ctx.remeasure()}
          onAnimationComplete={() => {
            ctx.remeasure();
            if (!isOpen) setExitComplete(true);
          }}
          // AccordionContentProps is HTMLAttributes<HTMLDivElement>, but framer
          // motion's HTMLMotionProps types a few overlapping event handlers
          // (onDrag, onAnimationStart, ...) differently — cast to sidestep the
          // structural mismatch rather than hand-filter every conflicting key.
          {...(props as Record<string, unknown>)}
        >
          <div ref={measureRef} className="px-3 pt-1 pb-3 text-caption text-muted-foreground">
            {children}
          </div>
        </motion.div>
      </AccordionPrimitive.Panel>
    );
  },
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export default Accordion;
