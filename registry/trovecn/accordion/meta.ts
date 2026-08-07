import type { RegistryItem } from "@/lib/registry-types";

import AccordionStandaloneExample from "./examples/standalone";
import AccordionSingleExpandExample from "./examples/single-expand";
import AccordionMultiExpandExample from "./examples/multi-expand";

export const accordion: RegistryItem = {
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
};
