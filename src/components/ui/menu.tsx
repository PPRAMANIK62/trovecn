"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { useProximityHover, proximityHoverWashClassName } from "@/hooks/use-proximity-hover";

// ─── Proximity hover ─────────────────────────────────────────────────────────
// Every MenuContent/MenuSubContent popup owns one useProximityHover instance
// — the same measured-rect hover wash Accordion/Tabs use, scoped to that
// popup's own items so a submenu's pill never reaches into its parent's.
// Base UI's own `data-highlighted` (keyboard nav and pointer hover both set
// it) still drives each row's text color, same split Accordion uses between
// its pill-owns-background and item-owns-text-color.

interface MenuProximityContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const MenuProximityContext = createContext<MenuProximityContextValue | null>(null);

/** Position for proximity hover — auto-assigned by MenuContent's child walk; only present on items it recognized as interactive rows. */
type MenuIndexProp = { _index?: number };

function useMenuItemRegistration(ref: React.RefObject<HTMLElement | null>, index?: number) {
  const ctx = useContext(MenuProximityContext);
  useEffect(() => {
    if (index === undefined || !ctx) return;
    ctx.registerItem(index, ref.current);
    return () => ctx.registerItem(index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ctx]);
}

/**
 * Auto-indexes MenuContent's children so callers never hand-thread an index
 * just for proximity hover — mirrors Accordion's indexedChildren, but as a
 * recursive walk (not a flat Children.map) since indexable rows can sit one
 * level down inside a MenuGroup/MenuRadioGroup. MenuSub's trigger is indexed
 * as a row in *this* popup, but Base UI requires it nested one level inside
 * MenuSub (alongside the portaled SubContent), so that level is unwrapped
 * here rather than recursed into — SubContent is a separate popup with its
 * own independent index space and must be left alone.
 */
function indexMenuChildren(children: ReactNode, counter: { current: number }): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type === MenuGroup || child.type === MenuRadioGroup) {
      const groupProps = child.props as { children?: ReactNode };
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        children: indexMenuChildren(groupProps.children, counter),
      });
    }
    if (child.type === MenuSub) {
      const subProps = child.props as { children?: ReactNode };
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        children: Children.map(subProps.children, (subChild) => {
          if (isValidElement(subChild) && subChild.type === MenuSubTrigger) {
            return cloneElement(subChild as ReactElement<MenuIndexProp>, {
              _index: counter.current++,
            });
          }
          return subChild;
        }),
      });
    }
    if (
      child.type === MenuItem ||
      child.type === MenuCheckboxItem ||
      child.type === MenuRadioItem ||
      child.type === MenuSubTrigger
    ) {
      return cloneElement(child as ReactElement<MenuIndexProp>, { _index: counter.current++ });
    }
    return child;
  });
}

// ─── Menu ────────────────────────────────────────────────────────────────────

function Menu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />;
}

function MenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />;
}

function MenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="menu-portal" {...props} />;
}

/**
 * Anchored floating list — same elevation step as Popover, entering from a
 * small trigger-facing offset on `spring.moderate`. Sized to its content
 * (`min-w-40`).
 */
function MenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  children,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { activeIndex, itemRects, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: "y" },
  );

  useEffect(() => {
    measureItems();
  }, [measureItems, children]);

  const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
  const indexedChildren = indexMenuChildren(children, { current: 0 });
  const triggerOffset = reduceMotion
    ? { x: 0, y: 0 }
    : {
        x: side === "right" ? -4 : side === "left" ? 4 : 0,
        y: side === "bottom" ? -4 : side === "top" ? 4 : 0,
      };
  // Without this, `{ registerItem }` is a fresh object every render, so
  // every item's registration effect (keyed on this context value) re-fires
  // every render, bumps useProximityHover's registerTick, and re-renders
  // this popup — an infinite loop caught as "Maximum update depth
  // exceeded." `registerItem` itself is already a stable useCallback.
  const proximityContextValue = useMemo(() => ({ registerItem }), [registerItem]);

  return (
    <MenuPortal>
      <MenuPrimitive.Positioner
        data-slot="menu-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <MenuPrimitive.Popup
          ref={containerRef}
          data-slot="menu-content"
          render={(popupProps, state) => {
            const exiting = state.transitionStatus === "ending";
            return (
              <motion.div
                {...(popupProps as Record<string, unknown>)}
                {...(props as Record<string, unknown>)}
                onMouseMove={handlers.onMouseMove}
                onMouseEnter={handlers.onMouseEnter}
                onMouseLeave={handlers.onMouseLeave}
                className={cn(
                  "relative z-50 max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none",
                  className,
                )}
                initial={{ opacity: 0, ...triggerOffset }}
                animate={{
                  opacity: exiting ? 0 : 1,
                  x: exiting ? triggerOffset.x : 0,
                  y: exiting ? triggerOffset.y : 0,
                }}
                transition={exiting ? spring.moderate.exit : spring.moderate.enter}
              >
                <AnimatePresence>
                  {activeRect && (
                    <motion.div
                      className={cn(
                        "pointer-events-none absolute rounded-md",
                        proximityHoverWashClassName,
                      )}
                      initial={{
                        top: activeRect.top,
                        left: activeRect.left,
                        width: activeRect.width,
                        height: activeRect.height,
                      }}
                      animate={{
                        top: activeRect.top,
                        left: activeRect.left,
                        width: activeRect.width,
                        height: activeRect.height,
                      }}
                      transition={spring.fast.enter}
                    />
                  )}
                </AnimatePresence>
                <MenuProximityContext.Provider value={proximityContextValue}>
                  {indexedChildren}
                </MenuProximityContext.Provider>
              </motion.div>
            );
          }}
        />
      </MenuPrimitive.Positioner>
    </MenuPortal>
  );
}

function MenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />;
}

function MenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-label text-muted-foreground uppercase data-inset:pl-7",
        className,
      )}
      {...props}
    />
  );
}

function MenuItem({
  className,
  inset,
  variant = "default",
  _index,
  ...props
}: MenuPrimitive.Item.Props &
  MenuIndexProp & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuItemRegistration(ref, _index);

  return (
    <MenuPrimitive.Item
      ref={ref}
      data-slot="menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menu-item relative z-10 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground data-highlighted:[&_svg]:text-foreground data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function MenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} />;
}

function MenuSubTrigger({
  className,
  inset,
  children,
  _index,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props &
  MenuIndexProp & {
    inset?: boolean;
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuItemRegistration(ref, _index);

  return (
    <MenuPrimitive.SubmenuTrigger
      ref={ref}
      data-slot="menu-sub-trigger"
      data-inset={inset}
      className={cn(
        // Persistent "submenu open" tint, not the transient hover wash (that's
        // data-highlighted, painted separately by the proximity pill below).
        // bg-accent would sit ~0.03 L off this popup's bg-popover in dark
        // mode — see --active's definition in globals.css.
        "relative z-10 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-control text-muted-foreground outline-none transition-colors select-none data-inset:pl-7 data-highlighted:text-foreground data-popup-open:bg-active data-popup-open:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

/**
 * Reuses MenuContent (same popup styling/motion/proximity hover) with
 * defaults suited to a submenu's anchor: it opens off its trigger's right
 * edge rather than below it. Nests one popup inside another, both already
 * at the `--popover` step — there's no elevation level past that on the
 * documented ladder yet, so this stays at the same step rather than
 * skipping ahead of it.
 */
function MenuSubContent({
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 2,
  className,
  ...props
}: ComponentProps<typeof MenuContent>) {
  return (
    <MenuContent
      data-slot="menu-sub-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn("min-w-32", className)}
      {...props}
    />
  );
}

function MenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  _index,
  ...props
}: MenuPrimitive.CheckboxItem.Props &
  MenuIndexProp & {
    inset?: boolean;
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuItemRegistration(ref, _index);

  return (
    <MenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "group/menu-item relative z-10 flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="menu-checkbox-item-indicator"
      >
        {/* Selection indicators are `spring.fast` — the same tier the motion
            table names for that exact role. `keepMounted` lets framer play
            the pop-out on uncheck instead of Base UI unmounting it first. */}
        <MenuPrimitive.CheckboxItemIndicator
          keepMounted
          render={(indicatorProps, state) => {
            const visible = state.checked && state.transitionStatus !== "ending";
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
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function MenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />;
}

function MenuRadioItem({
  className,
  children,
  inset,
  indicator = "dot",
  _index,
  ...props
}: MenuPrimitive.RadioItem.Props &
  MenuIndexProp & {
    inset?: boolean;
    /** Defaults to the compact dot used by generic radio menus. */
    indicator?: "dot" | "check";
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuItemRegistration(ref, _index);

  return (
    <MenuPrimitive.RadioItem
      ref={ref}
      data-slot="menu-radio-item"
      data-inset={inset}
      className={cn(
        "group/menu-item relative z-10 flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator
          keepMounted
          render={(indicatorProps, state) => {
            const visible = state.checked && state.transitionStatus !== "ending";
            return (
              <motion.span
                {...(indicatorProps as Record<string, unknown>)}
                initial={false}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.5 }}
                transition={visible ? spring.fast.enter : spring.fast.exit}
                className={
                  indicator === "dot" ? "flex size-1.5 rounded-full bg-foreground" : "flex"
                }
              >
                {indicator === "check" ? <CheckIcon className="size-3.5" /> : null}
              </motion.span>
            );
          }}
        />
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function MenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="menu-shortcut"
      className={cn(
        "ml-auto text-meta text-muted-foreground group-data-highlighted/menu-item:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menu,
  MenuPortal,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
};
