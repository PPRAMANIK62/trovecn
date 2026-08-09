import type { RegistryItem } from "@/lib/registry-types";

import DialogSizesExample from "./examples/sizes";
import DialogWithFooterExample from "./examples/with-footer";

export const dialog: RegistryItem = {
  slug: "dialog",
  title: "Dialog",
  description:
    "Centered modal with a spring-scaled popup and fading backdrop — a detached floating plane, not an edge-attached panel like Drawer.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react", "lucide-react"],
  registryDependencies: ["utils", "springs", "button"],
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
};
