"use client";

/**
 * Hand-built on `@base-ui/react/combobox` rather than a generic input +
 * popover composition — Base UI ships every part this needs directly
 * (Input, InputGroup, Icon, Clear, Item, ItemIndicator, Empty, Group), so
 * the wrapper below follows the same data-slot/cva/cn conventions as the
 * other primitives in this file.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { motion, AnimatePresence } from "motion/react";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import {
  useProximityHover,
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
} from "@/hooks/use-proximity-hover";

/**
 * ComboboxList owns one useProximityHover instance — the same measured-rect
 * hover wash Accordion/Tabs/Menu use: a background pill that morphs to
 * track whichever item is nearest the cursor. Unlike Menu's items
 * (auto-indexed from a static children tree), ComboboxItem sits under a
 * `children: (item, index) => ReactNode` render prop Base UI itself calls
 * per filtered item — that index is exactly what proximity hover needs, so
 * ComboboxItem takes it as an explicit `index` prop instead of re-deriving it.
 */
interface ComboboxProximityContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const ComboboxProximityContext = createContext<ComboboxProximityContextValue | null>(null);

function Combobox<Value, Multiple extends boolean | undefined = false>({
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />;
}

/** The bordered shell around the input — same `border-input` field treatment as a plain text input, so a combobox reads as "a text field," not a button. */
function ComboboxInputGroup({ className, ...props }: ComboboxPrimitive.InputGroup.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn(
        "flex h-8 w-full min-w-0 items-center gap-1.5 rounded-lg border border-input bg-transparent pr-1.5 pl-2.5 transition-colors outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-data-disabled:pointer-events-none has-data-disabled:opacity-50 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Static "type to filter" affordance, muted, always at rest — not a Base UI
 * `Combobox.Icon` (that part is the trigger-style chevron/state indicator,
 * already used by ComboboxIcon below; stacking a second instance next to it
 * would double up on that part's own aria/state wiring for no reason). Plain
 * decorative markup instead, same convention cmdk/shadcn's Command uses: a
 * fixed, muted search glyph in the input row so the field reads as "type to
 * filter" before a user ever focuses it, not as a plain select trigger.
 */
function ComboboxSearchIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="combobox-search-icon"
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <SearchIcon className="size-4" />
    </span>
  );
}

function ComboboxIcon({ className, ...props }: ComboboxPrimitive.Icon.Props) {
  return (
    <ComboboxPrimitive.Icon
      data-slot="combobox-icon"
      className={cn("shrink-0 text-muted-foreground", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </ComboboxPrimitive.Icon>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md p-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <XIcon className="size-3.5" />
    </ComboboxPrimitive.Clear>
  );
}

/**
 * Matches the trigger's width (`w-(--anchor-width)`) rather than sizing to
 * content the way MenuContent does — a combobox popup is "results for what's
 * typed in this exact field," so lining its edges up with the input is the
 * legible choice, unlike a dropdown menu's independent action list. Same
 * `--popover` elevation step and `spring.moderate` scale-in as Popover/Menu
 * otherwise.
 */
function ComboboxPopup({ className, children, ...props }: ComboboxPrimitive.Popup.Props) {
  // Height of the filtered result set animates to a self-measured layout
  // pixel value on every keystroke, same ResizeObserver-driven technique
  // AccordionContent uses for its open height — otherwise typing a filter
  // down from 6 results to 1 just snaps the popup shorter mid-frame. `overflow-y-auto` +
  // `max-h-(--available-height)` stay on the *outer* motion.div below and
  // still cap/scroll a long result set once the animation lands; this only
  // measures and animates the natural content height, uncapped.
  const roRef = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
    });
    ro.observe(el);
    roRef.current = ro;
  }, []);

  return (
    <ComboboxPrimitive.Popup
      data-slot="combobox-content"
      render={(popupProps, state) => {
        const exiting = state.transitionStatus === "ending";
        return (
          <motion.div
            {...(popupProps as Record<string, unknown>)}
            {...(props as Record<string, unknown>)}
            className={cn(
              "z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none",
              className,
            )}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 0.96 : 1 }}
            transition={exiting ? spring.moderate.exit : spring.moderate.enter}
          >
            <motion.div
              animate={{ height: contentHeight ?? "auto" }}
              transition={spring.moderate.enter}
              className="overflow-hidden"
            >
              <div ref={measureRef}>{children}</div>
            </motion.div>
          </motion.div>
        );
      }}
    />
  );
}

function ComboboxContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        data-slot="combobox-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <ComboboxPopup className={className} {...props} />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, children, ...props }: ComboboxPrimitive.List.Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: "y" },
  );

  useEffect(() => {
    measureItems();
  }, [measureItems, children]);

  const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
  // Without this, `{ registerItem }` is a fresh object every render, so
  // every item's registration effect (keyed on this context value) re-fires
  // every render, bumps useProximityHover's registerTick, and re-renders
  // this list — an infinite loop caught as "Maximum update depth
  // exceeded." `registerItem` itself is already a stable useCallback.
  const proximityContextValue = useMemo(() => ({ registerItem }), [registerItem]);

  return (
    <ComboboxPrimitive.List
      ref={containerRef}
      data-slot="combobox-list"
      render={(listProps) => (
        <div
          {...(listProps as Record<string, unknown>)}
          {...(props as Record<string, unknown>)}
          onMouseMove={handlers.onMouseMove}
          onMouseEnter={handlers.onMouseEnter}
          onMouseLeave={handlers.onMouseLeave}
          className={cn("relative flex flex-col gap-0.5", className)}
        >
          <AnimatePresence>
            {activeRect && (
              <motion.div
                className={cn(
                  "pointer-events-none absolute rounded-md",
                  proximityHoverWashClassName,
                )}
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
          <ComboboxProximityContext.Provider value={proximityContextValue}>
            {(listProps as { children?: ReactNode }).children}
          </ComboboxProximityContext.Provider>
        </div>
      )}
    >
      {children}
    </ComboboxPrimitive.List>
  );
}

function ComboboxGroup({ ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" {...props} />;
}

function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn("px-2 py-1.5 text-label text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}

/**
 * Position for proximity hover. ComboboxList's `children` is a Base UI
 * render-prop (`(item, index) => ReactNode`) it calls once per filtered
 * item, so the index proximity hover needs is already sitting right there
 * at each call site — pass it straight through rather than re-deriving it.
 */
function useComboboxItemRegistration(ref: React.RefObject<HTMLElement | null>, index?: number) {
  const ctx = useContext(ComboboxProximityContext);
  useEffect(() => {
    if (index === undefined || !ctx) return;
    ctx.registerItem(index, ref.current);
    return () => ctx.registerItem(index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ctx]);
}

function ComboboxItem({ className, children, index, ...props }: ComboboxPrimitive.Item.Props) {
  const ref = useRef<HTMLDivElement>(null);
  useComboboxItemRegistration(ref, index);

  return (
    <ComboboxPrimitive.Item
      ref={ref}
      index={index}
      data-slot="combobox-item"
      className={cn(
        // Persistent selected-item tint, not the transient proximity-hover
        // wash below (--hover). bg-accent would read almost identically to
        // --popover here (--accent is neutral gray, only ~0.03 L off
        // --popover in dark mode) — --active is the same foreground-tint
        // mechanism as the hover wash, at a constant, clearly stronger
        // opacity instead of the wash's capped/animated peak, so "selected"
        // reads heavier than a passing hover rather than a coincidentally
        // similar shade. See --active's definition in globals.css.
        "relative z-10 flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:text-foreground data-[selected]:bg-active data-[selected]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="combobox-item-indicator"
      >
        {/* Selection indicators are `spring.fast` — same tier and pattern as
            MenuCheckboxItem's check mark. `keepMounted` lets framer play the
            pop-out when a different item is selected instead of Base UI
            unmounting it first. */}
        <ComboboxPrimitive.ItemIndicator
          keepMounted
          render={(indicatorProps, state) => {
            const visible = state.selected && state.transitionStatus !== "ending";
            return (
              <motion.span
                {...(indicatorProps as Record<string, unknown>)}
                initial={false}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.5 }}
                transition={visible ? spring.fast.enter : spring.fast.exit}
              >
                <CheckIcon className="size-3.5" />
              </motion.span>
            );
          }}
        />
      </span>
    </ComboboxPrimitive.Item>
  );
}

/**
 * Base UI keeps this element mounted at all times, even with a non-empty
 * list, so screen readers reliably pick up its `aria-live` announcements —
 * it only conditionally renders its *children* (see ComboboxEmpty.js). With
 * results present it's a childless div, so the padding below must collapse
 * via `empty:` (`:empty` matches — no children were rendered) instead of
 * applying unconditionally, or a dead gap sits above the list.
 */
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "empty:p-0 px-2 py-6 text-center text-caption text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxTrigger({ className, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("flex shrink-0 items-center justify-center", className)}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxIcon,
  ComboboxSearchIcon,
  ComboboxClear,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxEmpty,
};
