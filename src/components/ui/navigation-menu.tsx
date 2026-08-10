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
  type ReactElement,
  type ReactNode,
} from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { useProximityHover, type ItemRect } from "@/hooks/use-proximity-hover";

/**
 * The mega-menu case: one shared `Viewport` resizes/crossfades in place to
 * become whichever top-level item's content is active, rather than each
 * item owning its own popup — the one component in this backlog where Base
 * UI's own architecture (not a Radix or fluidfunctionalism precedent) is
 * the thing worth adopting, since neither ships this shape
 * (docs/research/overlay-menu-motion-research.md — "Navigation Menu").
 * Base UI computes the resize itself via CSS custom properties
 * (`--positioner-width/height`, `--popup-width/height`) written onto the
 * Positioner/Popup as the active item changes — the same category of
 * internal choreography Toast's stacking math uses
 * (`src/components/ui/toast.tsx`), so this file transitions those
 * properties with CSS rather than fighting them with framer-motion, and
 * only retunes the stock scaffold's timing (350ms) down to this repo's
 * `spring.moderate` velocity and its slide distance (a Radix-scale 208px)
 * down to a few-px "settles in from where it came from" travel. Base UI's
 * `data-activation-direction` drives that directional entry, so content
 * always arrives from the side matching the user's traversal.
 */
const viewportTransition =
  "transition-[top,left,right,bottom,width,height] delay-50 duration-200 ease-out data-ending-style:delay-0 data-ending-style:duration-150 data-instant:transition-none";
const popupTransition =
  "transition-[opacity,transform,width,height] delay-50 duration-200 ease-out data-ending-style:delay-0 data-ending-style:duration-150";
const contentTransition =
  "transition-[opacity,transform] duration-200 ease-out data-ending-style:duration-150";

// ─── Proximity hover (top-level trigger row) ─────────────────────────────────
// Same transient "nearest item" wash Tabs/Accordion/DocsSidebar use, scoped
// to the row of top-level triggers — this is exactly the "interactive
// list/grid of items" case docs/design-system.md's proximity-hover rule
// names.

interface NavigationMenuProximityContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const NavigationMenuProximityContext = createContext<NavigationMenuProximityContextValue | null>(
  null,
);

type NavigationMenuIndexProp = { _index?: number };

function indexNavigationMenuItems(children: ReactNode): ReactNode {
  let index = -1;
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== NavigationMenuItem) return child;
    index += 1;
    return cloneElement(child as ReactElement<NavigationMenuIndexProp>, { _index: index });
  });
}

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props & Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, children, ...props }: NavigationMenuPrimitive.List.Props) {
  const containerRef = useRef<HTMLUListElement>(null);
  const { activeIndex, itemRects, handlers, registerItem, measureItems } = useProximityHover(
    containerRef,
    { axis: "x" },
  );

  useEffect(() => {
    measureItems();
  }, [measureItems, children]);

  const activeRect: ItemRect | null = activeIndex !== null ? itemRects[activeIndex] : null;
  // Without this, `{ registerItem }` is a fresh object every render, so
  // every NavigationMenuItem's registration effect (keyed on this context
  // value) re-fires every render, bumps useProximityHover's registerTick,
  // and re-renders this list — an infinite loop caught as "Maximum update
  // depth exceeded." `registerItem` itself is already a stable useCallback.
  const proximityContextValue = useMemo(() => ({ registerItem }), [registerItem]);

  return (
    <NavigationMenuPrimitive.List
      ref={containerRef}
      data-slot="navigation-menu-list"
      className={cn(
        "group relative flex flex-1 list-none items-center justify-center gap-0.5",
        className,
      )}
      onMouseMove={handlers.onMouseMove}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      {...props}
    >
      <ProximityHoverPill activeRect={activeRect} sessionKey={0} />
      <NavigationMenuProximityContext.Provider value={proximityContextValue}>
        {indexNavigationMenuItems(children)}
      </NavigationMenuProximityContext.Provider>
    </NavigationMenuPrimitive.List>
  );
}

function NavigationMenuItem({
  className,
  _index,
  ...props
}: NavigationMenuPrimitive.Item.Props & NavigationMenuIndexProp) {
  const ref = useRef<HTMLLIElement>(null);
  const ctx = useContext(NavigationMenuProximityContext);

  useEffect(() => {
    if (_index === undefined || !ctx) return;
    ctx.registerItem(_index, ref.current);
    return () => ctx.registerItem(_index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_index, ctx]);

  return (
    <NavigationMenuPrimitive.Item
      ref={ref}
      data-slot="navigation-menu-item"
      className={cn("relative z-10", className)}
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        "group inline-flex h-8 w-max cursor-default items-center justify-center gap-1 rounded-lg px-2.5 text-control text-muted-foreground outline-none transition-colors select-none hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="size-3 transition-transform duration-fast group-data-popup-open:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/** A 4px directional entry + a cross-fade. Base UI supplies the activation
 * direction from the relative positions of the old and new triggers. */
function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-auto p-1 outline-none",
        contentTransition,
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-1 data-starting-style:data-[activation-direction=right]:translate-x-1",
        "data-starting-style:data-[activation-direction=up]:-translate-y-1 data-starting-style:data-[activation-direction=down]:translate-y-1",
        "group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-popover",
        "**:data-[slot=navigation-menu-link]:outline-none",
        className,
      )}
      {...props}
    />
  );
}

/** Shared, resizing popup — see this file's top docstring. `before:` bridges
 * the gap between the trigger row and the popup so moving the pointer down
 * into the content doesn't read as "left the menu." */
function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) before:absolute before:inset-x-0 before:content-[''] data-[side=bottom]:before:-top-2 data-[side=bottom]:before:h-2",
          viewportTransition,
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          className={cn(
            "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-popover outline-none",
            popupTransition,
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        >
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-2 rounded-md p-2 text-control text-muted-foreground outline-none transition-colors select-none hover:bg-hover hover:text-foreground data-active:bg-active data-active:text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
};
