"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring, easeOutStrong } from "@/lib/springs";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { useProximityHover } from "@/hooks/use-proximity-hover";

/**
 * How long the popup stays open after the user clicks an item to select it,
 * before actually closing — long enough for the checkmark draw-in and the
 * selected-row background to land in view (fluidfunctionalism's
 * `selectionAckMs`, ported). Every other close reason (Escape, outside
 * press, re-clicking the trigger) closes immediately — only gated on
 * `eventDetails.reason === "item-press"` in `handleOpenChange` below.
 */
const SELECTION_ACK_MS = 300;

// ─── Value-order context ────────────────────────────────────────────────────
// Mirrors tabs.tsx's TabsValueOrderContext: Base UI doesn't expose "which
// value is currently selected" to arbitrary descendants, only to its own
// parts, but SelectList needs it to resolve the selected item into an index
// it can look up in `itemRects` for the sliding selected-row background.

interface SelectValueOrderContextValue {
  resolvedValue: unknown;
  isItemEqualToValue: (itemValue: unknown, value: unknown) => boolean;
  open: boolean;
}

const SelectValueOrderContext = createContext<SelectValueOrderContextValue | null>(null);

// ─── Proximity hover ─────────────────────────────────────────────────────────
// SelectList owns one useProximityHover instance, same shape as
// ComboboxList/MenuContent — items register themselves by index, SelectList
// looks their rects up to position the hover pill and (additionally, unlike
// Combobox/Menu) the persistent selected-row background.

interface SelectProximityContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const SelectProximityContext = createContext<SelectProximityContextValue | null>(null);

/** Position for proximity hover / selected-index lookup — auto-assigned by SelectList's child walk. */
type SelectIndexProp = { _index?: number };

/**
 * Auto-indexes SelectList's children so callers never hand-thread an index
 * just for proximity hover — mirrors Menu's indexMenuChildren. Also collects
 * each item's `value` in traversal order into `values`, so SelectList can
 * resolve "which index is the current value" without duplicating Base UI's
 * own selection logic.
 */
function indexSelectChildren(
  children: ReactNode,
  counter: { current: number },
  values: unknown[],
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type === SelectGroup) {
      const groupProps = child.props as { children?: ReactNode };
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        children: indexSelectChildren(groupProps.children, counter, values),
      });
    }
    if (child.type === SelectItem) {
      const itemProps = child.props as { value?: unknown };
      values[counter.current] = itemProps.value;
      return cloneElement(child as ReactElement<SelectIndexProp>, { _index: counter.current++ });
    }
    return child;
  });
}

function useSelectItemRegistration(ref: React.RefObject<HTMLElement | null>, index?: number) {
  const ctx = useContext(SelectProximityContext);
  useEffect(() => {
    if (index === undefined || !ctx) return;
    ctx.registerItem(index, ref.current);
    return () => ctx.registerItem(index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ctx]);
}

// ─── Select ──────────────────────────────────────────────────────────────────

function Select<Value, Multiple extends boolean | undefined = false>({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  isItemEqualToValue = Object.is,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  // Always controlled from this wrapper's side (mirrors switch.tsx) so the
  // selection-ack delay below can hold `open` true past the moment Base UI
  // itself would have closed, without racing its own internal state.
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  // Shadow copy of the resolved value, kept only so SelectList (nested many
  // layers down, through a portal) can read it via context — Base UI's own
  // value tracking is untouched, this just mirrors it.
  const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(defaultValue ?? null);
  const resolvedValue = valueProp !== undefined ? valueProp : uncontrolledValue;

  const pendingCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (pendingCloseRef.current) clearTimeout(pendingCloseRef.current);
    };
  }, []);

  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails: SelectPrimitive.Root.ChangeEventDetails,
  ) => {
    if (pendingCloseRef.current) {
      clearTimeout(pendingCloseRef.current);
      pendingCloseRef.current = null;
    }
    if (!nextOpen && eventDetails.reason === "item-press") {
      pendingCloseRef.current = setTimeout(() => {
        pendingCloseRef.current = null;
        if (openProp === undefined) setUncontrolledOpen(false);
        onOpenChange?.(false, eventDetails);
      }, SELECTION_ACK_MS);
      return;
    }
    if (openProp === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen, eventDetails);
  };

  const handleValueChange = (nextValue: unknown, eventDetails: unknown) => {
    setUncontrolledValue(nextValue);
    (onValueChange as ((v: unknown, e: unknown) => void) | undefined)?.(nextValue, eventDetails);
  };

  const proximityValueOrderContext = useMemo(
    () => ({
      resolvedValue,
      isItemEqualToValue: isItemEqualToValue as (itemValue: unknown, value: unknown) => boolean,
      open,
    }),
    [resolvedValue, isItemEqualToValue, open],
  );

  return (
    <SelectValueOrderContext.Provider value={proximityValueOrderContext}>
      <SelectPrimitive.Root
        data-slot="select"
        open={open}
        onOpenChange={handleOpenChange}
        value={valueProp}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        isItemEqualToValue={isItemEqualToValue}
        {...props}
      />
    </SelectValueOrderContext.Provider>
  );
}

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-8 w-fit min-w-32 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-body text-foreground outline-none transition-colors data-placeholder:text-muted-foreground hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50 dark:bg-input/30",
        className,
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("truncate text-left", className)}
      {...props}
    />
  );
}

function SelectIcon({ className, ...props }: SelectPrimitive.Icon.Props) {
  return (
    <SelectPrimitive.Icon
      data-slot="select-icon"
      className={cn("shrink-0 text-muted-foreground", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.Icon>
  );
}

/**
 * Select's popup — unlike Menu/Combobox's, which fully unmount/remount on
 * every open/close — stays mounted in the DOM after its first interaction
 * (Base UI's own animation guide calls this out as Select-specific: "a mix
 * of the two previous approaches is needed"). `mounted` tracks whether
 * that's happened yet: before it has, this plays the plain fresh-mount
 * tween (`initial`/`animate`/`exit`, matching Menu/Combobox); after, the
 * popup is kept in the tree and re-opens are driven purely off `open` via
 * `animate` (no `initial`, since remounting never happens again to trigger
 * it) — the two recipes the guide documents, picked per-render.
 */
function SelectPopup({
  className,
  children,
  open,
  mounted,
  ...props
}: SelectPrimitive.Popup.Props & { open: boolean; mounted: boolean }) {
  const variant = mounted
    ? {
        initial: false as const,
        animate: { opacity: open ? 1 : 0, scale: open ? 1 : 0.96 },
      }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      };

  return (
    <SelectPrimitive.Popup
      data-slot="select-content"
      render={
        <motion.div
          {...(props as Record<string, unknown>)}
          className={cn(
            "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none",
            className,
          )}
          {...variant}
          transition={open ? spring.moderate.enter : spring.moderate.exit}
        >
          {children}
        </motion.div>
      }
    />
  );
}

/**
 * Sized to its content (`min-w-32`), like MenuContent — not matched to the
 * trigger's width the way ComboboxContent's `w-(--anchor-width)` is. A
 * select popup is an independent option list, not "results for this exact
 * field," so there's no reason to line its edges up with the trigger.
 * `alignItemWithTrigger` is disabled by default so it opens below the
 * trigger with a plain `sideOffset` gap, the same anchored-dropdown shape
 * Menu/Combobox use, rather than Base UI's native-`<select>`-style overlap.
 */
function SelectContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  alignItemWithTrigger = false,
  className,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  const ctx = useContext(SelectValueOrderContext);
  const open = ctx?.open ?? false;

  // Flips once the Positioner first mounts (i.e. once the Select has been
  // opened for the first time) and never resets — Base UI keeps this
  // subtree mounted from that point on, so this is a one-way latch, not a
  // mirror of `open`.
  const [mounted, setMounted] = useState(false);
  const positionerRef = useCallback(() => setMounted(true), []);

  // Before first interaction, the Positioner subtree doesn't exist at all
  // (Base UI's own unmounted-by-default behavior) — AnimatePresence needs
  // to see that same true/false as a child to play the fresh-mount exit.
  // After first interaction it stays permanently mounted, so this is
  // always true from then on regardless of `open`.
  const portalMounted = open || mounted;

  return (
    <AnimatePresence>
      {portalMounted && (
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            ref={positionerRef}
            data-slot="select-positioner"
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            alignItemWithTrigger={alignItemWithTrigger}
            className="z-50 outline-none"
          >
            <SelectPopup className={className} open={open} mounted={mounted} {...props} />
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

/**
 * Owns the persistent selected-row background and the transient hover pill —
 * two different measured-rect techniques stacked in the same list:
 *   - Selected background: TabsList's technique (`layout` + plain `style`,
 *     `spring.moderate`), tracking whichever index the resolved value
 *     currently resolves to.
 *   - Hover pill: ComboboxList/MenuContent's technique (animated
 *     top/left/width/height, `spring.fast`), tracking the nearest item to
 *     the pointer.
 */
function SelectList({ className, children, ...props }: SelectPrimitive.List.Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: "y" },
  );

  const valueOrderCtx = useContext(SelectValueOrderContext);
  const open = valueOrderCtx?.open ?? false;
  const values: unknown[] = [];
  const indexedChildren = indexSelectChildren(children, { current: 0 }, values);

  // Also keyed on `open`: since SelectContent now keeps the popup mounted
  // across closes (see its comment), this list's own DOM only stays in the
  // tree too — but its rects are worthless while genuinely closed (zero
  // width/height, or stale from before the anchor repositioned). Re-measure
  // the instant it opens, not just when `children` happens to change.
  useEffect(() => {
    if (open) measureItems();
  }, [measureItems, children, open]);

  const isItemEqualToValue = valueOrderCtx?.isItemEqualToValue ?? Object.is;
  const resolvedValue = valueOrderCtx?.resolvedValue;
  const selectedIndex = values.findIndex((v) => isItemEqualToValue(v, resolvedValue));
  const selectedRect = selectedIndex >= 0 ? (itemRects[selectedIndex] ?? null) : null;

  const hoverRect = activeIndex !== null ? itemRects[activeIndex] : null;
  const isHoveringSelected = activeIndex !== null && activeIndex === selectedIndex;

  // Without this, `{ registerItem }` is a fresh object every render, so
  // every item's registration effect (keyed on this context value) re-fires
  // every render, bumps useProximityHover's registerTick, and re-renders
  // this list — an infinite loop caught as "Maximum update depth
  // exceeded." `registerItem` itself is already a stable useCallback.
  const proximityContextValue = useMemo(() => ({ registerItem }), [registerItem]);

  return (
    <SelectPrimitive.List
      ref={containerRef}
      data-slot="select-list"
      render={(listProps) => (
        <div
          {...(listProps as Record<string, unknown>)}
          {...(props as Record<string, unknown>)}
          onMouseMove={handlers.onMouseMove}
          onMouseEnter={handlers.onMouseEnter}
          onMouseLeave={handlers.onMouseLeave}
          className={cn("relative flex flex-col gap-0.5", className)}
        >
          {selectedRect && (
            <motion.div
              layout
              className="pointer-events-none absolute rounded-md bg-active"
              style={{
                top: selectedRect.top,
                left: selectedRect.left,
                width: selectedRect.width,
                height: selectedRect.height,
              }}
              initial={false}
              animate={{ opacity: 1 }}
              transition={spring.moderate.enter}
            />
          )}
          <ProximityHoverPill
            activeRect={isHoveringSelected ? null : hoverRect}
            sessionKey={0}
            className="rounded-md"
          />
          <SelectProximityContext.Provider value={proximityContextValue}>
            {(listProps as { children?: ReactNode }).children}
          </SelectProximityContext.Provider>
        </div>
      )}
    >
      {indexedChildren}
    </SelectPrimitive.List>
  );
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectGroupLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn("px-2 py-1.5 text-label text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}

/**
 * Checkmark is a bespoke `pathLength` draw-on, deliberately different from
 * Combobox/Menu's spring-scale indicator: a `motion.path`'s `pathLength`
 * tweens 0 → 1 on select (`easeOutStrong`, not a spring — see
 * `docs/design-system.md`'s rule against bare easing keywords, and
 * `@/lib/springs`' own note that this is exactly what `easeOutStrong` is
 * exported for). `hasMountedRef` (same pattern as switch.tsx) forces the
 * first commit's transition to `duration: 0` so an item that's already
 * selected when the popup first opens appears already-checked instead of
 * drawing itself in.
 */
function SelectItem({
  className,
  children,
  _index,
  ...props
}: SelectPrimitive.Item.Props & SelectIndexProp) {
  const ref = useRef<HTMLDivElement>(null);
  useSelectItemRegistration(ref, _index);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        // No selected-state background here — that's SelectList's job (the
        // sliding bg-active pill above). This only owns text color.
        "relative z-10 flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:text-foreground data-[selected]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="select-item-indicator"
      >
        <SelectPrimitive.ItemIndicator
          keepMounted
          render={(indicatorProps, state) => {
            const visible = state.selected && state.transitionStatus !== "ending";
            const mounted = hasMountedRef.current;
            return (
              // opacity, not just pathLength: a round-linecap path at
              // pathLength 0 still rasterizes as a small dot (the cap
              // extends a stroke-width radius past the zero-length path),
              // so an unselected item's permanently-mounted (keepMounted)
              // indicator needs its own fade to actually disappear.
              <motion.span
                {...(indicatorProps as Record<string, unknown>)}
                initial={{ opacity: visible ? 1 : 0 }}
                animate={{ opacity: visible ? 1 : 0 }}
                transition={!mounted ? { duration: 0 } : { duration: visible ? 0.08 : 0.04 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                  aria-hidden
                >
                  <motion.path
                    d="M4 12L9 17L20 6"
                    initial={{ pathLength: visible ? 1 : 0 }}
                    animate={{ pathLength: visible ? 1 : 0 }}
                    transition={
                      !mounted
                        ? { duration: 0 }
                        : visible
                          ? { duration: 0.08, ease: easeOutStrong }
                          : { duration: 0.04, ease: easeOutStrong }
                    }
                  />
                </svg>
              </motion.span>
            );
          }}
        />
      </span>
    </SelectPrimitive.Item>
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectContent,
  SelectList,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
};
