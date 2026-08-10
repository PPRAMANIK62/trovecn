"use client";

import type { ComponentProps } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * Anchored, non-modal — no backdrop, unlike Dialog. It enters from a small
 * trigger-facing offset on its resolved side, so collision handling never
 * breaks the connection between the trigger and its floating surface.
 */
function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const reduceMotion = useReducedMotion();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          render={(popupProps, state) => {
            const exiting = state.transitionStatus === "ending";
            const triggerOffset = reduceMotion
              ? { x: 0, y: 0 }
              : {
                  x: state.side === "right" ? -4 : state.side === "left" ? 4 : 0,
                  y: state.side === "bottom" ? -4 : state.side === "top" ? 4 : 0,
                };
            return (
              <motion.div
                {...(popupProps as Record<string, unknown>)}
                {...(props as Record<string, unknown>)}
                className={cn(
                  "w-72 rounded-lg bg-popover p-3 text-body text-popover-foreground shadow-popover outline-none",
                  className,
                )}
                initial={{ opacity: 0, ...triggerOffset }}
                animate={{
                  opacity: exiting ? 0 : 1,
                  x: exiting ? triggerOffset.x : 0,
                  y: exiting ? triggerOffset.y : 0,
                }}
                transition={exiting ? spring.moderate.exit : spring.moderate.enter}
              />
            );
          }}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-control font-medium text-foreground", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription };
