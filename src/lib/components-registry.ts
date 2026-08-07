import type { RegistryItem } from "./registry-types";
import { categories } from "./registry-types";
import { registry } from "./registry.generated";

export type {
  ComponentExample,
  PropRow,
  ApiSection,
  RegistryItem,
  Category,
} from "./registry-types";
export { categories } from "./registry-types";
/** The item array itself is generated — see scripts/generate-registry-index.ts.
 * Adding a component means adding registry/trovecn/<slug>/meta.ts; nothing
 * in this file (or its import list) changes. */
export { registry } from "./registry.generated";

export function getComponent(slug: string): RegistryItem | undefined {
  return registry.find((item) => item.slug === slug);
}

/** Every component, grouped by category (empty categories included) and
 * sorted alphabetically by title within each group — the order the sidebar,
 * the components index, and catalog numbers all read from. */
export function getComponentsByCategory(): { category: string; items: RegistryItem[] }[] {
  return categories.map((category) => ({
    category,
    items: registry
      .filter((item) => item.category === category)
      .toSorted((a, b) => a.title.localeCompare(b.title)),
  }));
}

/** Flattened, alphabetically-ordered registry — category order first, then
 * alphabetical within each category, matching what getComponentsByCategory
 * renders. The single source both adjacency and catalog numbers walk. */
function getOrderedRegistry(): RegistryItem[] {
  return getComponentsByCategory().flatMap((group) => group.items);
}

export function getAdjacentComponents(slug: string): {
  previous?: RegistryItem;
  next?: RegistryItem;
} {
  const ordered = getOrderedRegistry();
  const index = ordered.findIndex((item) => item.slug === slug);
  if (index === -1) return {};
  return { previous: ordered[index - 1], next: ordered[index + 1] };
}

/** 1-based, zero-padded position within the item's own category (see
 * docs/design-system.md "Visual language", e.g. "Hero & Marketing · 03") —
 * alphabetical order, not insertion order. */
export function getCatalogNumber(slug: string): string {
  const item = registry.find((i) => i.slug === slug);
  if (!item) return "00";
  const withinCategory = registry
    .filter((i) => i.category === item.category)
    .toSorted((a, b) => a.title.localeCompare(b.title));
  const index = withinCategory.findIndex((i) => i.slug === slug);
  return String(index + 1).padStart(2, "0");
}

/** URL-safe anchor id for a category heading, e.g. "Hero & Marketing" → "hero-marketing". */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
