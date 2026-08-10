import type { RegistryItem } from "@/lib/registry-types";

import ToggleBasicExample from "./examples/basic";
import ToggleToolbarExample from "./examples/toolbar";

const toggleItem: RegistryItem = {
  slug: "toggle",
  title: "Toggle",
  description:
    "A two-state button that can be pressed or unpressed — a favorite/star button, a toolbar bold/italic control. Base UI's Toggle directly; the pressed-state fill is a plain color transition, not a spring, on purpose.",
  category: "Primitives",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
  file: "src/components/ui/toggle.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description: "A single icon toggle, like a favorite/star button.",
      file: "registry/trovecn/toggle/examples/basic.tsx",
      Demo: ToggleBasicExample,
    },
    {
      title: "Toolbar",
      description:
        "A row of independent icon toggles — bold, italic, underline — each pressed on its own, not linked as a ToggleGroup.",
      file: "registry/trovecn/toggle/examples/toolbar.tsx",
      Demo: ToggleToolbarExample,
    },
  ],
  api: [
    {
      component: "Toggle",
      props: [
        {
          prop: "pressed",
          type: "boolean",
          default: "—",
          description: "Controlled pressed state.",
        },
        {
          prop: "defaultPressed",
          type: "boolean",
          default: "false",
          description: "Initial pressed state, uncontrolled.",
        },
        {
          prop: "onPressedChange",
          type: "(pressed, eventDetails) => void",
          default: "—",
          description: "Called when the pressed state changes.",
        },
        {
          prop: "size",
          type: '"sm" | "default" | "lg"',
          default: '"default"',
          description: "Size step.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the toggle can be pressed.",
        },
      ],
    },
  ],
};

export { toggleItem as toggle };
