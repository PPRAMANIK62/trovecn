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

const viewportTransition =
  "transition-[top,left,right,bottom,width,height] delay-50 duration-200 ease-out data-ending-style:delay-0 data-ending-style:duration-150 data-instant:transition-none";
const popupTransition =
  "transition-[opacity,transform,width,height] delay-50 duration-200 ease-out data-ending-style:delay-0 data-ending-style:duration-150";
const contentTransition =
  "transition-[opacity,transform] duration-200 ease-out data-ending-style:duration-150";

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
