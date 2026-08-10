import type { RegistryItem } from "@/lib/registry-types";

import TooltipStandaloneExample from "./examples/standalone";
import TooltipPlacementExample from "./examples/placement";

export const tooltip: RegistryItem = {
  slug: "tooltip",
  title: "Tooltip",
  description: "A fast contextual label for icons and truncated text.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs", "font-weight"],
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
};
