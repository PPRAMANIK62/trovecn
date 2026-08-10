"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";

/** Fast, deliberate — a tooltip that opened as slowly as a dialog would feel
 * laggy for something this small; 200ms strikes the balance between
 * "confirms intent" and "instant." */
const defaultDelay = 200;

function TooltipProvider({ delay = defaultDelay, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/** A few pixels of slide toward the trigger, on top of the fade. Base UI's
 * resolved side keeps that cue correct when collision handling flips the
 * placement. */
function slideOffset(side: NonNullable<TooltipPrimitive.Positioner.Props["side"]>) {
  switch (side) {
    case "top":
      return { y: 4 };
    case "bottom":
      return { y: -4 };
    case "left":
      return { x: 4 };
    case "right":
      return { x: -4 };
    default:
      return {};
  }
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const reduceMotion = useReducedMotion();

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        data-slot="tooltip-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          render={(popupProps, state) => {
            const exiting = state.transitionStatus === "ending";
            const offset = reduceMotion ? {} : slideOffset(state.side);
            return (
              <motion.div
                {...(popupProps as Record<string, unknown>)}
                {...(props as Record<string, unknown>)}
                className={cn(
                  "w-fit max-w-xs rounded-md bg-foreground px-2 py-1 text-caption text-background",
                  className,
                )}
                style={{ fontVariationSettings: fontWeights.medium }}
                initial={{ opacity: 0, ...offset }}
                animate={exiting ? { opacity: 0, ...offset } : { opacity: 1, x: 0, y: 0 }}
                transition={exiting ? spring.quick.exit : spring.quick.enter}
              >
                {children}
                <TooltipPrimitive.Arrow
                  data-slot="tooltip-arrow"
                  className={cn(
                    "size-2 rotate-45 rounded-[1px] bg-foreground",
                    "data-[side=bottom]:top-0.5 data-[side=top]:-bottom-0.5",
                    "data-[side=left]:-right-0.5 data-[side=right]:-left-0.5",
                  )}
                />
              </motion.div>
            );
          }}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
