import type { RegistryItem } from "@/lib/registry-types";

import ButtonVariantsExample from "./examples/variants";
import ButtonSizesExample from "./examples/sizes";

export const button: RegistryItem = {
  slug: "button",
  title: "Button",
  description:
    "Base UI button with variant and size styling via class-variance-authority — the trigger every other primitive renders through `render`.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "class-variance-authority"],
  file: "src/components/ui/button.tsx",
  examples: [
    {
      title: "Variants",
      description: "All seven style variants side by side.",
      file: "registry/trovecn/button/examples/variants.tsx",
      Demo: ButtonVariantsExample,
    },
    {
      title: "Sizes",
      description: "The full size scale, from 2xs to lg.",
      file: "registry/trovecn/button/examples/sizes.tsx",
      Demo: ButtonSizesExample,
    },
  ],
  api: [
    {
      component: "Button",
      props: [
        {
          prop: "variant",
          type: '"default" | "outline" | "elevated" | "secondary" | "ghost" | "destructive" | "link"',
          default: '"default"',
          description: "Visual style of the button.",
        },
        {
          prop: "size",
          type: '"2xs" | "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"',
          default: '"default"',
          description:
            "Height/padding scale — the `icon-*` sizes are square, for icon-only buttons.",
        },
        {
          prop: "render",
          type: "ReactElement",
          default: "—",
          description: "Render as a different element (e.g. a link) while keeping button styling.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Button label or content.",
        },
      ],
    },
  ],
};
