import type { ComponentType } from "react";

import AccordionStandaloneExample from "../../registry/trovecn/accordion/examples/standalone";
import AccordionSingleExpandExample from "../../registry/trovecn/accordion/examples/single-expand";
import AccordionMultiExpandExample from "../../registry/trovecn/accordion/examples/multi-expand";

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

export interface RegistryItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  dependencies: string[];
  /** Path (repo-relative) to the primitive that ships through `npx shadcn add`. */
  file: string;
  examples: ComponentExample[];
  api: ApiSection[];
}

export const categories = [
  "Primitives",
  "Navigation",
  "Hero & Marketing",
  "Scroll & Reveal",
] as const;

export const registry: RegistryItem[] = [
  {
    slug: "accordion",
    title: "Accordion",
    description:
      "Collapsible sections with a spring-animated chevron, height transition, and proximity hover across every row.",
    category: "Primitives",
    dependencies: ["framer-motion", "@base-ui/react", "lucide-react"],
    file: "src/components/ui/accordion.tsx",
    examples: [
      {
        title: "Standalone",
        description: "A two-item accordion — proximity hover still tracks the cursor between rows.",
        file: "registry/trovecn/accordion/examples/standalone.tsx",
        Demo: AccordionStandaloneExample,
      },
      {
        title: "Single expand",
        description: "Multiple items with proximity hover — only one can be expanded at a time.",
        file: "registry/trovecn/accordion/examples/single-expand.tsx",
        Demo: AccordionSingleExpandExample,
      },
      {
        title: "Multi expand",
        description: "Multiple items with proximity hover — several can be expanded at once.",
        file: "registry/trovecn/accordion/examples/multi-expand.tsx",
        Demo: AccordionMultiExpandExample,
      },
    ],
    api: [
      {
        component: "Accordion",
        props: [
          {
            prop: "type",
            type: '"single" | "multiple"',
            default: '"single"',
            description: "Whether one or multiple items can be expanded.",
          },
          {
            prop: "defaultValue",
            type: "string | string[]",
            default: "—",
            description: "Initially expanded item value(s), uncontrolled.",
          },
          {
            prop: "value",
            type: "string | string[]",
            default: "—",
            description: "Controlled expanded value(s).",
          },
          {
            prop: "onValueChange",
            type: "(value) => void",
            default: "—",
            description: "Called when the expanded value(s) change.",
          },
        ],
      },
      {
        component: "AccordionItem",
        props: [
          {
            prop: "value",
            type: "string",
            default: "—",
            description: "Unique identifier for this item.",
          },
          {
            prop: "index",
            type: "number",
            default: "—",
            description:
              "Position for proximity hover — auto-assigned from child order; override only if needed.",
          },
          {
            prop: "disabled",
            type: "boolean",
            default: "false",
            description: "Whether this item is disabled.",
          },
        ],
      },
      {
        component: "AccordionTrigger",
        props: [
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Trigger label content.",
          },
        ],
      },
      {
        component: "AccordionContent",
        props: [
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Collapsible content.",
          },
        ],
      },
    ],
  },
];

export function getComponent(slug: string): RegistryItem | undefined {
  return registry.find((item) => item.slug === slug);
}

export function getAdjacentComponents(slug: string): {
  previous?: RegistryItem;
  next?: RegistryItem;
} {
  const index = registry.findIndex((item) => item.slug === slug);
  if (index === -1) return {};
  return { previous: registry[index - 1], next: registry[index + 1] };
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
