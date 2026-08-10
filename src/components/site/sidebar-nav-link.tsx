"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

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
      onClick={() => {
        onClick?.();
      }}
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

/** Small interaction-accent dot flagging a just-shipped component in the
 * sidebar — hand-set via `RegistryItem.isNew` (`registry-types.ts`), not
 * date-derived, so it stays a deliberate, temporary callout rather than
 * permanently accreting. `bg-link` reuses the app's one blue interaction
 * hue rather than inventing a second accent color for this. */
export function SidebarNewDot() {
  return (
    <>
      <span aria-hidden className="ml-1.5 inline-block size-1.5 shrink-0 rounded-full bg-link" />
      <span className="sr-only"> (New)</span>
    </>
  );
}
