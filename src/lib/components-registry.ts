import type { ComponentType } from "react";

import AccordionStandaloneExample from "../../registry/trovecn/accordion/examples/standalone";
import AccordionSingleExpandExample from "../../registry/trovecn/accordion/examples/single-expand";
import AccordionMultiExpandExample from "../../registry/trovecn/accordion/examples/multi-expand";
import PopoverStandaloneExample from "../../registry/trovecn/popover/examples/standalone";
import PopoverPlacementExample from "../../registry/trovecn/popover/examples/placement";
import DialogSizesExample from "../../registry/trovecn/dialog/examples/sizes";
import DialogWithFooterExample from "../../registry/trovecn/dialog/examples/with-footer";
import TooltipStandaloneExample from "../../registry/trovecn/tooltip/examples/standalone";
import TooltipPlacementExample from "../../registry/trovecn/tooltip/examples/placement";

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
  {
    slug: "popover",
    title: "Popover",
    description:
      "Anchored floating panel that grows out of its trigger — non-modal, positioned on any side, scaling from the exact point Base UI anchors it to.",
    category: "Primitives",
    dependencies: ["framer-motion", "@base-ui/react"],
    file: "src/components/ui/popover.tsx",
    examples: [
      {
        title: "Standalone",
        description: "A trigger with a title and description inside the popup.",
        file: "registry/trovecn/popover/examples/standalone.tsx",
        Demo: PopoverStandaloneExample,
      },
      {
        title: "Placement",
        description: "The same popover anchored to each side of its trigger.",
        file: "registry/trovecn/popover/examples/placement.tsx",
        Demo: PopoverPlacementExample,
      },
    ],
    api: [
      {
        component: "Popover",
        props: [
          {
            prop: "defaultOpen",
            type: "boolean",
            default: "false",
            description: "Whether the popover is initially open, uncontrolled.",
          },
          {
            prop: "open",
            type: "boolean",
            default: "—",
            description: "Controlled open state.",
          },
          {
            prop: "onOpenChange",
            type: "(open: boolean) => void",
            default: "—",
            description: "Called when the open state changes.",
          },
          {
            prop: "modal",
            type: "boolean",
            default: "false",
            description: "Whether interaction with the rest of the page is blocked while open.",
          },
        ],
      },
      {
        component: "PopoverTrigger",
        props: [
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Trigger element — pass `render={<Button ... />}` to style it.",
          },
        ],
      },
      {
        component: "PopoverContent",
        props: [
          {
            prop: "side",
            type: '"top" | "right" | "bottom" | "left"',
            default: '"bottom"',
            description: "Which side of the trigger to render on.",
          },
          {
            prop: "sideOffset",
            type: "number",
            default: "8",
            description: "Gap between the trigger and the popup, in pixels.",
          },
          {
            prop: "align",
            type: '"start" | "center" | "end"',
            default: '"center"',
            description: "Alignment along the side.",
          },
          {
            prop: "alignOffset",
            type: "number",
            default: "0",
            description: "Offset along the alignment axis, in pixels.",
          },
        ],
      },
      {
        component: "PopoverTitle / PopoverDescription",
        props: [
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Title or description content.",
          },
        ],
      },
    ],
  },
  {
    slug: "dialog",
    title: "Dialog",
    description:
      "Centered modal with a spring-scaled popup and fading backdrop — a detached floating plane, not an edge-attached panel like Sheet.",
    category: "Primitives",
    dependencies: ["framer-motion", "@base-ui/react", "lucide-react"],
    file: "src/components/ui/dialog.tsx",
    examples: [
      {
        title: "Sizes",
        description: "The `sm` and `lg` width variants side by side.",
        file: "registry/trovecn/dialog/examples/sizes.tsx",
        Demo: DialogSizesExample,
      },
      {
        title: "With footer",
        description: "A destructive confirmation with header, description, and footer actions.",
        file: "registry/trovecn/dialog/examples/with-footer.tsx",
        Demo: DialogWithFooterExample,
      },
    ],
    api: [
      {
        component: "Dialog",
        props: [
          {
            prop: "defaultOpen",
            type: "boolean",
            default: "false",
            description: "Whether the dialog is initially open, uncontrolled.",
          },
          {
            prop: "open",
            type: "boolean",
            default: "—",
            description: "Controlled open state.",
          },
          {
            prop: "onOpenChange",
            type: "(open: boolean) => void",
            default: "—",
            description: "Called when the open state changes.",
          },
          {
            prop: "modal",
            type: 'boolean | "trap-focus"',
            default: "true",
            description: "Whether the rest of the page is inert while the dialog is open.",
          },
        ],
      },
      {
        component: "DialogContent",
        props: [
          {
            prop: "size",
            type: '"sm" | "lg"',
            default: '"sm"',
            description: "Width of the dialog.",
          },
          {
            prop: "showCloseButton",
            type: "boolean",
            default: "true",
            description: "Whether to render the top-right close button.",
          },
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Dialog content — typically DialogHeader and DialogFooter.",
          },
        ],
      },
      {
        component: "DialogTitle / DialogDescription",
        props: [
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Title or description content.",
          },
        ],
      },
    ],
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    description:
      "Fast, fading label for icon buttons and truncated text — slides a few pixels in from the trigger's side on top of the fade.",
    category: "Primitives",
    dependencies: ["framer-motion", "@base-ui/react"],
    file: "src/components/ui/tooltip.tsx",
    examples: [
      {
        title: "Standalone",
        description: "A row of icon buttons, each labeled by its own tooltip.",
        file: "registry/trovecn/tooltip/examples/standalone.tsx",
        Demo: TooltipStandaloneExample,
      },
      {
        title: "Placement",
        description: "The same tooltip anchored to each side of its trigger.",
        file: "registry/trovecn/tooltip/examples/placement.tsx",
        Demo: TooltipPlacementExample,
      },
    ],
    api: [
      {
        component: "TooltipProvider",
        props: [
          {
            prop: "delay",
            type: "number",
            default: "200",
            description: "Hover delay before tooltips open, in milliseconds.",
          },
        ],
      },
      {
        component: "TooltipContent",
        props: [
          {
            prop: "side",
            type: '"top" | "right" | "bottom" | "left"',
            default: '"top"',
            description: "Which side of the trigger to render on.",
          },
          {
            prop: "sideOffset",
            type: "number",
            default: "8",
            description: "Gap between the trigger and the tooltip, in pixels.",
          },
          {
            prop: "align",
            type: '"start" | "center" | "end"',
            default: '"center"',
            description: "Alignment along the side.",
          },
          {
            prop: "alignOffset",
            type: "number",
            default: "0",
            description: "Offset along the alignment axis, in pixels.",
          },
          {
            prop: "children",
            type: "ReactNode",
            default: "—",
            description: "Tooltip content.",
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
