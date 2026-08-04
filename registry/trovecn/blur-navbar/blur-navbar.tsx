"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

import { cn } from "@/lib/utils";

export interface BlurNavbarLink {
  label: string;
  href: string;
  /** Marks this link as the current page — rendered in `--primary`. */
  active?: boolean;
}

export interface BlurNavbarProps {
  /** Wordmark or logo mark rendered on the left. */
  logo: React.ReactNode;
  /** Primary nav links. */
  links: BlurNavbarLink[];
  /** Optional call-to-action rendered on the right (e.g. a Button). */
  cta?: React.ReactNode;
  className?: string;
  /**
   * Scope scroll detection to a specific scrollable ancestor instead of
   * `window`. Defaults to `window` — pass this when the navbar lives inside
   * a nested scroll container (e.g. a demo preview box).
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Scroll distance (px) before the navbar switches to its "scrolled" look. */
  threshold?: number;
}

/**
 * A navbar that starts transparent over hero content and, once the page (or
 * a given scroll container) has scrolled past `threshold`, gains a blurred
 * translucent background, a hairline bottom border, and a slightly reduced
 * height — the pattern used on apple.com and linear.app.
 */
export function BlurNavbar({
  logo,
  links,
  cta,
  className,
  scrollContainerRef,
  threshold = 16,
}: BlurNavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  const { scrollY } = useScroll({ container: scrollContainerRef });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > threshold);
  });

  return (
    <header
      data-slot="blur-navbar"
      data-scrolled={scrolled}
      className={cn(
        "@container sticky top-0 z-40 w-full border-b border-transparent bg-transparent",
        "transition-[background-color,backdrop-filter,border-color,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled && "border-border bg-background/70 shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      <nav
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "py-3" : "py-5",
        )}
      >
        <div className="shrink-0 text-lg font-semibold tracking-tight text-foreground">{logo}</div>

        {/* Gated on the navbar's own width (container query), not the
            viewport — a viewport-based `md:` breakpoint would show these
            links even when this navbar is embedded in a column too narrow
            to fit them, crowding the logo and CTA together. */}
        <ul className="hidden items-center gap-8 font-sans text-sm text-muted-foreground @lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "transition-colors duration-300 hover:text-foreground",
                  link.active && "text-primary hover:text-primary",
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {cta ? <div className="flex shrink-0 items-center">{cta}</div> : null}
      </nav>
    </header>
  );
}
