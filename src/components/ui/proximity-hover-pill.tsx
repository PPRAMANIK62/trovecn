"use client";

import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import {
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

/**
 * Shared "nearest item" hover pill for every `useProximityHover` consumer.
 * Position/size come from plain `style` (not animated props) — the `layout`
 * prop makes Framer Motion FLIP-animate the visual difference via
 * `transform` instead, which is what keeps this on the GPU compositor and
 * inside `MotionConfig`'s automatic reduced-motion handling
 * (docs/design-system.md "Transform/opacity only" / "Reduced motion").
 */
export function ProximityHoverPill({
  activeRect,
  sessionKey,
  className,
}: {
  activeRect: ItemRect | null;
  sessionKey: number;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {activeRect && (
        <motion.div
          key={sessionKey}
          layout
          className={cn(
            "pointer-events-none absolute rounded-lg",
            proximityHoverWashClassName,
            className,
          )}
          style={{
            top: activeRect.top,
            left: activeRect.left,
            width: activeRect.width,
            height: activeRect.height,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: proximityHoverWashOpacity }}
          exit={{ opacity: 0, transition: spring.fast.exit }}
          transition={spring.fast.enter}
        />
      )}
    </AnimatePresence>
  );
}
