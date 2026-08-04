import type { ComponentType } from "react";

import BlurNavbarDemo from "../../registry/trovecn/blur-navbar/blur-navbar-demo";
import BentoGridDemo from "../../registry/trovecn/bento-grid/bento-grid-demo";
import CommandPaletteDemo from "../../registry/trovecn/command-palette/command-palette-demo";
import AnimatedBorderCardDemo from "../../registry/trovecn/animated-border-card/animated-border-card-demo";
import ScrollTextRevealDemo from "../../registry/trovecn/scroll-text-reveal/scroll-text-reveal-demo";

export interface RegistryItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  source: string;
  dependencies: string[];
  /** Path (repo-relative) to the primitive that ships through `npx shadcn add`. */
  file: string;
  Demo: ComponentType;
}

export const categories = ["Navigation", "Hero & Marketing", "Scroll & Reveal"] as const;

export const registry: RegistryItem[] = [
  {
    slug: "blur-navbar",
    title: "Blur Navbar",
    description: "A navbar that gains a blurred background and shrinks as the page scrolls.",
    category: "Navigation",
    source: "apple.com, linear.app",
    dependencies: ["framer-motion"],
    file: "registry/trovecn/blur-navbar/blur-navbar.tsx",
    Demo: BlurNavbarDemo,
  },
  {
    slug: "command-palette",
    title: "Command Palette",
    description: "A keyboard-driven cmd+k search and action menu.",
    category: "Navigation",
    source: "linear.app, raycast.com",
    dependencies: ["framer-motion", "lucide-react"],
    file: "registry/trovecn/command-palette/command-palette.tsx",
    Demo: CommandPaletteDemo,
  },
  {
    slug: "bento-grid",
    title: "Bento Grid",
    description: "An asymmetric feature grid for showcasing product highlights.",
    category: "Hero & Marketing",
    source: "linear.app, vercel.com",
    dependencies: ["framer-motion"],
    file: "registry/trovecn/bento-grid/bento-grid.tsx",
    Demo: BentoGridDemo,
  },
  {
    slug: "animated-border-card",
    title: "Animated Border Card",
    description: "A card with a light beam that travels continuously along its border.",
    category: "Hero & Marketing",
    source: "vercel.com",
    dependencies: ["framer-motion"],
    file: "registry/trovecn/animated-border-card/animated-border-card.tsx",
    Demo: AnimatedBorderCardDemo,
  },
  {
    slug: "scroll-text-reveal",
    title: "Scroll Text Reveal",
    description: "Text that fades and rises into place word by word as it enters the viewport.",
    category: "Scroll & Reveal",
    source: "apple.com",
    dependencies: ["framer-motion"],
    file: "registry/trovecn/scroll-text-reveal/scroll-text-reveal.tsx",
    Demo: ScrollTextRevealDemo,
  },
];

export function getComponent(slug: string): RegistryItem | undefined {
  return registry.find((item) => item.slug === slug);
}

/** 1-based, zero-padded position in the registry — the catalog number shown
 * next to a component's category (see docs/design-system.md "Visual
 * language"). Reflects registry order, not category order. */
export function getCatalogNumber(slug: string): string {
  const index = registry.findIndex((item) => item.slug === slug);
  return String(index + 1).padStart(2, "0");
}

export function getComponentsByCategory(): { category: string; items: RegistryItem[] }[] {
  return categories.map((category) => ({
    category,
    items: registry.filter((item) => item.category === category),
  }));
}

/** URL-safe anchor id for a category heading, e.g. "Hero & Marketing" → "hero-marketing". */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
