import type { ComponentType } from "react";

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

export const registry: RegistryItem[] = [];

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
