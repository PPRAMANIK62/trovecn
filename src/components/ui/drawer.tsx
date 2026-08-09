"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dialog as DrawerPrimitive } from "@base-ui/react/dialog";
import { motion, useDragControls, type PanInfo } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

type Side = "top" | "right" | "bottom" | "left";

/**
 * Edge-anchored panel, built on Base UI's `Dialog` rather than Base UI's own
 * dedicated Drawer primitive — fluidfunctionalism's `mobile-drawer.tsx` made
 * this exact call deliberately (see its header comment): Drawer's
 * swipe-to-dismiss writes inline `transform`/CSS-var choreography onto its
 * Popup that fights framer-motion's own transform ownership on the same
 * element (docs/research/overlay-menu-motion-research.md — "Drawer"). This
 * supersedes the repo's earlier hand-rolled Sheet primitive (same
 * edge-anchored shape and CSS classes, now framer-motion-driven end to end
 * on `spring.slow` — this repo's tier table lists "side panels" under it,
 * and a full-width edge slide reads as the larger surface next to Dialog,
 * not the small-expansion company `moderate` otherwise keeps) and, for the
 * top/bottom sides, drag-to-dismiss physics
 * ported from vaul (Emil Kowalski): velocity-first/distance-second release
 * logic (a flick past 400px/s closes regardless of distance dragged;
 * otherwise it takes ≥25% of the panel's own height) and rubber-band
 * resistance dragging past the open position, via Framer's native per-edge
 * `dragElastic` rather than vaul's hand-rolled log-damping formula — same
 * rubber-band feel, no new physics code. Dragging is confined to an
 * explicit handle (`dragControls` + `dragListener={false}`) rather than the
 * whole panel, so it doesn't hijack clicks/scroll on content inside —
 * left/right sides skip dragging entirely and stay scripted-only, the less
 * common case for a flick gesture.
 */

const VELOCITY_THRESHOLD = 400; // px/s — vaul's 0.4 px/ms
const CLOSE_THRESHOLD_RATIO = 0.25; // vaul's CLOSE_THRESHOLD
const FALLBACK_SIZE = 400;

interface DrawerContextValue {
  actionsRef: React.RefObject<DrawerPrimitive.Root.Actions | null>;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function Drawer({ children, ...props }: DrawerPrimitive.Root.Props) {
  const actionsRef = useRef<DrawerPrimitive.Root.Actions>(null);
  return (
    <DrawerContext.Provider value={{ actionsRef }}>
      <DrawerPrimitive.Root data-slot="drawer" actionsRef={actionsRef} {...props}>
        {children}
      </DrawerPrimitive.Root>
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      render={(backdropProps, state) => {
        const exiting = state.transitionStatus === "ending";
        return (
          <motion.div
            {...(backdropProps as Record<string, unknown>)}
            className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={exiting ? spring.slow.exit : spring.slow.enter}
          />
        );
      }}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  side = "right",
  showHandle = side === "top" || side === "bottom",
  ...props
}: DrawerPrimitive.Popup.Props & {
  side?: Side;
  /** Draggable grab bar. Only meaningful (and only rendered) for top/bottom — see this file's docstring for why left/right stay scripted-only. */
  showHandle?: boolean;
}) {
  const ctx = useContext(DrawerContext);
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number | null>(null);

  const axis: "x" | "y" = side === "left" || side === "right" ? "x" : "y";
  const sign = side === "bottom" || side === "right" ? 1 : -1;
  const draggable = axis === "y"; // top/bottom only, see docstring
  const dimension = size ?? FALLBACK_SIZE;
  const closedOffset = sign * dimension;

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () =>
      setSize(axis === "y" ? el.getBoundingClientRect().height : el.getBoundingClientRect().width);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [axis]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offset = axis === "y" ? info.offset.y : info.offset.x;
      const velocity = axis === "y" ? info.velocity.y : info.velocity.x;
      const closingOffset = sign * offset;
      const closingVelocity = sign * velocity;
      if (
        closingVelocity > VELOCITY_THRESHOLD ||
        closingOffset > dimension * CLOSE_THRESHOLD_RATIO
      ) {
        ctx?.actionsRef.current?.close();
      }
    },
    [axis, sign, dimension, ctx],
  );

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Popup
        ref={panelRef}
        data-slot="drawer-content"
        data-side={side}
        render={(popupProps, state) => {
          const exiting = state.transitionStatus === "ending";
          return (
            <motion.div
              {...(popupProps as Record<string, unknown>)}
              {...(props as Record<string, unknown>)}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden bg-background shadow-panel outline-none",
                side === "left" && "inset-y-0 left-0 w-64 max-w-[85vw] rounded-r-3xl",
                side === "right" && "inset-y-0 right-0 w-64 max-w-[85vw] rounded-l-3xl",
                side === "top" && "inset-x-0 top-0 h-auto max-h-[85vh] rounded-b-3xl",
                side === "bottom" && "inset-x-0 bottom-0 h-auto max-h-[85vh] rounded-t-3xl",
                className,
              )}
              drag={draggable ? axis : false}
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={false}
              dragConstraints={
                axis === "y"
                  ? {
                      top: side === "top" ? closedOffset : 0,
                      bottom: side === "bottom" ? closedOffset : 0,
                    }
                  : {
                      left: side === "left" ? closedOffset : 0,
                      right: side === "right" ? closedOffset : 0,
                    }
              }
              dragElastic={
                side === "bottom"
                  ? { top: 0.15, bottom: 1 }
                  : side === "top"
                    ? { top: 1, bottom: 0.15 }
                    : side === "right"
                      ? { left: 0.15, right: 1 }
                      : { left: 1, right: 0.15 }
              }
              onDragEnd={draggable ? handleDragEnd : undefined}
              initial={{ [axis]: closedOffset }}
              animate={{ [axis]: exiting ? closedOffset : 0 }}
              transition={exiting ? spring.slow.exit : spring.slow.enter}
            >
              {showHandle && (
                <div
                  data-slot="drawer-handle"
                  onPointerDown={(event) => dragControls.start(event)}
                  className={cn(
                    "mx-auto h-1 w-9 shrink-0 touch-none rounded-full bg-border",
                    side === "top" ? "order-last mt-1 mb-2" : "mt-2 mb-1",
                  )}
                />
              )}
              {axis === "y" ? (
                <div className="mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden">
                  {children}
                </div>
              ) : (
                children
              )}
            </motion.div>
          );
        }}
      />
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: { className?: string; children?: ReactNode }) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex h-14 shrink-0 items-center border-b border-border px-6", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-control font-medium text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
};
