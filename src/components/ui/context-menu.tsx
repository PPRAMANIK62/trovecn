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
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { useProximityHover, proximityHoverWashClassName } from "@/hooks/use-proximity-hover";

interface ContextMenuProximityContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const ContextMenuProximityContext = createContext<ContextMenuProximityContextValue | null>(null);

type ContextMenuIndexProp = { _index?: number };

function useContextMenuItemRegistration(ref: React.RefObject<HTMLElement | null>, index?: number) {
  const ctx = useContext(ContextMenuProximityContext);
  useEffect(() => {
    if (index === undefined || !ctx) return;
    ctx.registerItem(index, ref.current);
    return () => ctx.registerItem(index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ctx]);
}

function indexContextMenuChildren(children: ReactNode, counter: { current: number }): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (child.type === ContextMenuGroup || child.type === ContextMenuRadioGroup) {
      const groupProps = child.props as { children?: ReactNode };
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        children: indexContextMenuChildren(groupProps.children, counter),
      });
    }
    // ContextMenuSub's trigger is indexed as a row in *this* popup, but Base
    // UI requires it nested one level inside ContextMenuSub (alongside the
    // portaled SubContent), so that level is unwrapped here rather than
    // recursed into — SubContent is a separate popup with its own
    // independent index space and must be left alone.
    if (child.type === ContextMenuSub) {
      const subProps = child.props as { children?: ReactNode };
      return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
        children: Children.map(subProps.children, (subChild) => {
          if (isValidElement(subChild) && subChild.type === ContextMenuSubTrigger) {
            return cloneElement(subChild as ReactElement<ContextMenuIndexProp>, {
              _index: counter.current++,
            });
          }
          return subChild;
        }),
      });
    }
    if (
      child.type === ContextMenuItem ||
      child.type === ContextMenuCheckboxItem ||
      child.type === ContextMenuRadioItem ||
      child.type === ContextMenuSubTrigger
    ) {
      return cloneElement(child as ReactElement<ContextMenuIndexProp>, {
        _index: counter.current++,
      });
    }
    return child;
  });
}

// ─── Context Menu ────────────────────────────────────────────────────────────

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({ className, ...props }: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  );
}

function ContextMenuPortal({ ...props }: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuMotionSurface({
  popupProps,
  contentProps,
  transitionStatus,
  pointerTravel,
  reduceMotion,
  handlers,
  className,
  children,
}: {
  popupProps: Record<string, unknown>;
  contentProps: Record<string, unknown>;
  transitionStatus: string | undefined;
  pointerTravel: { x: number; y: number };
  reduceMotion: boolean | null;
  handlers: Pick<
    React.DOMAttributes<HTMLDivElement>,
    "onMouseMove" | "onMouseEnter" | "onMouseLeave"
  >;
  className?: string;
  children: ReactNode;
}) {
  // Base UI clears its initial "starting" state in the same frame that this
  // popup mounts. Hold the first visual frame ourselves so Motion has a
  // painted origin before it begins the pointer-side travel.
  const [entered, setEntered] = useState(Boolean(reduceMotion));
  useEffect(() => {
    if (!reduceMotion) setEntered(true);
  }, [reduceMotion]);

  const exiting = transitionStatus === "ending";
  const hidden = exiting || !entered;

  return (
    <motion.div
      {...popupProps}
      {...contentProps}
      {...handlers}
      className={cn(
        "relative z-50 max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-popover outline-none",
        className,
      )}
      initial={false}
      animate={hidden ? { opacity: 0, ...pointerTravel } : { opacity: 1, x: 0, y: 0 }}
      transition={exiting ? spring.moderate.exit : spring.moderate.enter}
    >
      {children}
    </motion.div>
  );
}

/** Same popup styling/motion/proximity hover as MenuContent — see that
 * component's docstring in menu.tsx. `side="right"` default rather than
 * `"bottom"`: a context menu opens from the click point outward, not below
 * an anchor element. */
function ContextMenuContent({
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 2,
  className,
  children,
  ...props
}: ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: "y" },
  );
  const reduceMotion = useReducedMotion();
  const pointerTravel = reduceMotion
    ? { x: 0, y: 0 }
    : {
        x: side === "right" ? -6 : side === "left" ? 6 : 0,
        y: side === "bottom" ? -6 : side === "top" ? 6 : 0,
      };

  useEffect(() => {
    measureItems();
  }, [measureItems, children]);

  const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
  const indexedChildren = indexContextMenuChildren(children, { current: 0 });
  // Without this, `{ registerItem }` is a fresh object every render, so
  // every item's registration effect (keyed on this context value) re-fires
  // every render, bumps useProximityHover's registerTick, and re-renders
  // this popup — an infinite loop caught as "Maximum update depth
  // exceeded." `registerItem` itself is already a stable useCallback.
  const proximityContextValue = useMemo(() => ({ registerItem }), [registerItem]);

  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Positioner
        data-slot="context-menu-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <ContextMenuPrimitive.Popup
          ref={containerRef}
          data-slot="context-menu-content"
          render={(popupProps, state) => {
            return (
              <ContextMenuMotionSurface
                popupProps={popupProps as Record<string, unknown>}
                contentProps={props as Record<string, unknown>}
                transitionStatus={state.transitionStatus}
                pointerTravel={pointerTravel}
                reduceMotion={reduceMotion}
                handlers={handlers}
                className={typeof className === "function" ? className(state) : className}
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
                <ContextMenuProximityContext.Provider value={proximityContextValue}>
                  {indexedChildren}
                </ContextMenuProximityContext.Provider>
              </ContextMenuMotionSurface>
            );
          }}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPortal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-label text-muted-foreground uppercase data-inset:pl-7",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  _index,
  ...props
}: ContextMenuPrimitive.Item.Props &
  ContextMenuIndexProp & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuItemRegistration(ref, _index);

  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/context-menu-item relative z-10 flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground data-highlighted:[&_svg]:text-foreground data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  _index,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props &
  ContextMenuIndexProp & {
    inset?: boolean;
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuItemRegistration(ref, _index);

  return (
    <ContextMenuPrimitive.SubmenuTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        // Persistent "submenu open" tint, not the transient hover wash (that's
        // data-highlighted, painted separately by the proximity pill below).
        // bg-accent would sit ~0.03 L off this popup's bg-popover in dark
        // mode — see --active's definition in globals.css.
        "relative z-10 flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-control text-muted-foreground outline-none transition-colors select-none data-inset:pl-7 data-highlighted:text-foreground data-popup-open:bg-active data-popup-open:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

/** Nests one popup inside another, both already at the `--popover`
 * elevation step — same call menu.tsx's MenuSubContent makes, see its
 * docstring. */
function ContextMenuSubContent({
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 2,
  className,
  ...props
}: ComponentProps<typeof ContextMenuContent>) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={cn("min-w-32", className)}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  _index,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props &
  ContextMenuIndexProp & {
    inset?: boolean;
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuItemRegistration(ref, _index);

  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "group/context-menu-item relative z-10 flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="context-menu-checkbox-item-indicator"
      >
        <ContextMenuPrimitive.CheckboxItemIndicator
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
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup({ ...props }: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  _index,
  ...props
}: ContextMenuPrimitive.RadioItem.Props &
  ContextMenuIndexProp & {
    inset?: boolean;
  }) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuItemRegistration(ref, _index);

  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "group/context-menu-item relative z-10 flex cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-control text-muted-foreground outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:text-foreground data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="context-menu-radio-item-indicator"
      >
        <ContextMenuPrimitive.RadioItemIndicator
          keepMounted
          render={(indicatorProps, state) => {
            const visible = state.checked && state.transitionStatus !== "ending";
            return (
              <motion.span
                {...(indicatorProps as Record<string, unknown>)}
                initial={false}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.5 }}
                transition={visible ? spring.fast.enter : spring.fast.exit}
                className="flex size-1.5 rounded-full bg-foreground"
              />
            );
          }}
        />
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-meta text-muted-foreground group-data-highlighted/context-menu-item:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuPortal,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
