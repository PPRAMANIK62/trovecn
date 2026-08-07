"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import {
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

/**
 * A list/row item wired into a `useProximityHover` container (docs/design-system.md
 * "Proximity hover") — the same pattern the docs sidebar and Accordion use, applied
 * to plain action buttons instead of nav links.
 */
export function ProximityRow({
  index,
  registerItem,
  className,
  children,
  ...props
}: {
  index: number;
  registerItem: (index: number, element: HTMLElement | null) => void;
  children: ReactNode;
} & ComponentProps<"button">) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerItem(index, ref.current);
    return () => registerItem(index, null);
  }, [index, registerItem]);

  return (
    <button ref={ref} type="button" className={cn("relative z-10", className)} {...props}>
      {children}
    </button>
  );
}

/** The hover pill that tracks the item nearest the cursor — same faint wash every proximity-hover consumer uses (see use-proximity-hover.ts). */
export function ProximityHoverPill({
  activeRect,
  sessionKey,
}: {
  activeRect: ItemRect | null;
  sessionKey: number;
}) {
  return (
    <AnimatePresence>
      {activeRect && (
        <motion.div
          key={sessionKey}
          className={cn("pointer-events-none absolute rounded-lg", proximityHoverWashClassName)}
          initial={{
            opacity: 0,
            top: activeRect.top,
            left: activeRect.left,
            width: activeRect.width,
            height: activeRect.height,
          }}
          animate={{
            opacity: proximityHoverWashOpacity,
            top: activeRect.top,
            left: activeRect.left,
            width: activeRect.width,
            height: activeRect.height,
          }}
          exit={{ opacity: 0, transition: spring.fast.exit }}
          transition={spring.fast.enter}
        />
      )}
    </AnimatePresence>
  );
}
