import type { ComponentType } from "react";

export interface ComponentExample {
  title: string;
  description: string;
  /** Path (repo-relative) to the example's demo file — read verbatim onto its Code tab, same as the primitive's own source is. */
  file: string;
  Demo: ComponentType;
}

export interface PropRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
}

export interface ApiSection {
  /** Heading suffix, e.g. "Accordion / AccordionGroup" — rendered as "API Reference — {component}". */
  component: string;
  props: PropRow[];
}

export const categories = [
  "Primitives",
  "Navigation",
  "Hero & Marketing",
  "Scroll & Reveal",
] as const;

export type Category = (typeof categories)[number];

export interface RegistryItem {
  slug: string;
  title: string;
  description: string;
  category: Category;
  /** npm packages this component's source imports — rendered as the page's install command. */
  dependencies: string[];
  /** Other registry items (shared lib/hook files, or other components) this one's source imports — mirrors registry.ts's field of the same name so the docs page can point at what else needs copying. */
  registryDependencies?: string[];
  /** Path (repo-relative) to the primitive shown in the page's Source section. */
  file: string;
  examples: ComponentExample[];
  api: ApiSection[];
  /** Flags the sidebar row with a "new" dot. Hand-set and hand-cleared — not date-derived — so it stays a deliberate, temporary callout rather than permanently accreting across every past release. */
  isNew?: boolean;
}

export type RegistryItemType = "registry:ui" | "registry:hook" | "registry:lib";

export interface RegistryManifestFile {
  path: string;
  type: RegistryItemType;
}

/** Shape of one `registry.json` entry — the shadcn CLI's distribution
 * manifest, not the docs site's `RegistryItem`. Kept separate because the
 * two have different concerns (install-time deps/files vs. docs copy) and
 * different lifecycles: e.g. `springs`/`utils` are manifest-only, they
 * never get a docs page. */
export interface RegistryManifestItem {
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryManifestFile[];
}
