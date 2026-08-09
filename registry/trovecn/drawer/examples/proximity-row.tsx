"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

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
