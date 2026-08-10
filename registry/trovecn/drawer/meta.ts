import type { RegistryItem } from "@/lib/registry-types";

import DrawerStandaloneExample from "./examples/standalone";
import DrawerSideExample from "./examples/side";

export const drawer: RegistryItem = {
  slug: "drawer",
  title: "Drawer",
  description: "An edge-attached panel with draggable vertical dismissal.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/ui/drawer.tsx",
  examples: [
    {
      title: "Standalone",
      description: "A left-anchored drawer showing a proximity-hover nav list.",
      file: "registry/trovecn/drawer/examples/standalone.tsx",
      Demo: DrawerStandaloneExample,
    },
    {
      title: "Side",
      description:
        "The same drawer anchored to each edge, with content shaped for its position — a banner up top, settings on the right, a draggable icon-row action sheet on the bottom, and the same nav list as Standalone on the left.",
      file: "registry/trovecn/drawer/examples/side.tsx",
      Demo: DrawerSideExample,
    },
  ],
  api: [
    {
      component: "Drawer",
      props: [
        {
          prop: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Whether the drawer is initially open, uncontrolled.",
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
          description: "Called when the open state changes — including from a drag dismissal.",
        },
      ],
    },
    {
      component: "DrawerContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"right"',
          description: "Which viewport edge the drawer slides in from.",
        },
        {
          prop: "showHandle",
          type: "boolean",
          default: "true for top/bottom, false for left/right",
          description: "Whether to render the draggable grab bar.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Drawer content — typically DrawerHeader and body content.",
        },
      ],
    },
    {
      component: "DrawerTitle / DrawerDescription",
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
