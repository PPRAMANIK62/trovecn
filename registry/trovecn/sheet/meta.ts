import type { RegistryItem } from "@/lib/registry-types";

import SheetStandaloneExample from "./examples/standalone";
import SheetSideExample from "./examples/side";

export const sheet: RegistryItem = {
  slug: "sheet",
  title: "Sheet",
  description:
    "Edge-anchored panel built on the Dialog primitive — slides in flush against a viewport edge with a fading backdrop, unlike Dialog's detached floating plane.",
  category: "Primitives",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
  file: "src/components/ui/sheet.tsx",
  examples: [
    {
      title: "Standalone",
      description: "A left-anchored sheet showing a proximity-hover nav list.",
      file: "registry/trovecn/sheet/examples/standalone.tsx",
      Demo: SheetStandaloneExample,
    },
    {
      title: "Side",
      description:
        "The same sheet anchored to each edge, with content shaped for its position — a banner up top, settings on the right, an icon-row action sheet on the bottom, and the same nav list as Standalone on the left.",
      file: "registry/trovecn/sheet/examples/side.tsx",
      Demo: SheetSideExample,
    },
  ],
  api: [
    {
      component: "Sheet",
      props: [
        {
          prop: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Whether the sheet is initially open, uncontrolled.",
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
          description: "Whether the rest of the page is inert while the sheet is open.",
        },
      ],
    },
    {
      component: "SheetContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"left"',
          description: "Which viewport edge the sheet slides in from.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Sheet content — typically SheetHeader and body content.",
        },
      ],
    },
    {
      component: "SheetTitle / SheetDescription",
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
