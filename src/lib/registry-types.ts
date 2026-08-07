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
  dependencies: string[];
  /** Path (repo-relative) to the primitive that ships through `npx shadcn add`. */
  file: string;
  examples: ComponentExample[];
  api: ApiSection[];
}
