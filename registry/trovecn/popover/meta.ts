import type { RegistryItem } from "@/lib/registry-types";

import PopoverStandaloneExample from "./examples/standalone";
import PopoverPlacementExample from "./examples/placement";

export const popover: RegistryItem = {
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
};
