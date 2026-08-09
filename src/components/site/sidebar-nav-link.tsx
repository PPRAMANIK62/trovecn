"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import {
  proximityHoverWashClassName,
  proximityHoverWashOpacity,
  type ItemRect,
} from "@/hooks/use-proximity-hover";

/**
 * Shared by DocsSidebar and DocsMobileSidebar: a nav pill that registers
 * itself with the container's `useProximityHover` instance (docs/design-system.md
 * "Proximity hover").
 */
export function SidebarNavLink({
  href,
  index,
  active,
  registerItem,
  onClick,
  children,
}: {
  href: string;
  index: number;
  active: boolean;
  registerItem: (index: number, element: HTMLElement | null) => void;
  onClick?: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    registerItem(index, ref.current);
    return () => registerItem(index, null);
  }, [index, registerItem]);

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={cn(
        "relative z-10 block rounded-lg px-3 py-1.5 transition-colors",
        // No hover:bg-* here — the SidebarHoverPill underneath is the sole
        // hover indicator (docs/design-system.md "Proximity hover"). A
        // competing full-strength hover:bg-muted on the link itself would
        // fire at full opacity on real hover, making the pill's capped
        // 0.4 wash invisible under it and reading as indistinguishable
        // from the persistent bg-muted active state on the line below.
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

/** The hover pill that tracks the item nearest the cursor — same faint wash every proximity-hover consumer uses (see use-proximity-hover.ts). */
export function SidebarHoverPill({
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
