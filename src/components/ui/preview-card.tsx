"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

/**
 * Distinct from Tooltip's 200ms (`src/components/ui/tooltip.tsx`) — a
 * preview card's content (avatar, bio, link metadata) takes longer to be
 * worth committing to than a one-word label, so opening on every incidental
 * pass-over would be noisy. 700/300 mirrors Radix UI's Hover Card defaults;
 * see docs/research/overlay-menu-motion-research.md for the comparison
 * against Base UI's own 600/300 default.
 */
const defaultDelay = 700;
const defaultCloseDelay = 300;

function PreviewCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="preview-card" {...props} />;
}

function PreviewCardTrigger({
  delay = defaultDelay,
  closeDelay = defaultCloseDelay,
  className,
  ...props
}: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "underline decoration-border underline-offset-2 hover:decoration-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Same slide-toward-trigger shape as Tooltip's popup (a few px of travel on
 * top of the fade), reused verbatim rather than re-derived — see
 * `slideOffset` in tooltip.tsx. */
function slideOffset(side: NonNullable<PreviewCardPrimitive.Positioner.Props["side"]>) {
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

/**
 * `spring.quick` — a one-shot popup, not continuously tracked motion, so it
 * belongs on the "brief feedback" tier rather than `fast` (reserved for
 * pointer-tracked/continuous motion — see `springs.ts`). Surface/elevation
 * match Popover (bg-popover, shadow-popover) since this is a floating
 * secondary surface, not an inline label.
 */
function PreviewCardContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const offset = slideOffset(side);

  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        data-slot="preview-card-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="preview-card-content"
          render={(popupProps, state) => {
            const exiting = state.transitionStatus === "ending";
            return (
              <motion.div
                {...(popupProps as Record<string, unknown>)}
                {...(props as Record<string, unknown>)}
                className={cn(
                  "w-72 rounded-lg bg-popover p-3 text-body text-popover-foreground shadow-popover outline-none",
                  className,
                )}
                initial={{ opacity: 0, ...offset }}
                animate={exiting ? { opacity: 0, ...offset } : { opacity: 1, x: 0, y: 0 }}
                transition={exiting ? spring.quick.exit : spring.quick.enter}
              >
                {children}
              </motion.div>
            );
          }}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { PreviewCard, PreviewCardTrigger, PreviewCardContent };
