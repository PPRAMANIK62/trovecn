import type { RegistryItem } from "@/lib/registry-types";

import ToggleGroupSingleExample from "./examples/single";
import ToggleGroupMultipleExample from "./examples/multiple";

const toggleGroupItem: RegistryItem = {
  slug: "toggle-group",
  title: "Toggle Group",
  description:
    "A row of linked Toggles. Single-select mode ports Tabs' sliding active-segment indicator — one spring-driven rect, plus a proximity hover pill underneath. Multi-select mode gives each pressed item its own persistent tint instead.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  file: "src/components/ui/toggle-group.tsx",
  isNew: true,
  examples: [
    {
      title: "Single select",
      description:
        "A view-mode switcher — List / Grid / Board — with the sliding indicator following the selected item.",
      file: "registry/trovecn/toggle-group/examples/single.tsx",
      Demo: ToggleGroupSingleExample,
    },
    {
      title: "Multiple select",
      description:
        "A text-formatting toolbar — bold, italic, underline — any combination can be pressed at once.",
      file: "registry/trovecn/toggle-group/examples/multiple.tsx",
      Demo: ToggleGroupMultipleExample,
    },
  ],
  api: [
    {
      component: "ToggleGroup",
      props: [
        {
          prop: "type",
          type: '"single" | "multiple"',
          default: '"single"',
          description:
            "Selection mode. Translated onto Base UI's always-array ToggleGroup API — single mode wraps/unwraps the active value in a one-element array; multiple mode passes the array straight through.",
        },
        {
          prop: "value",
          type: "string | string[]",
          default: "—",
          description:
            "Controlled pressed value(s) — a string in single mode, an array in multiple mode.",
        },
        {
          prop: "defaultValue",
          type: "string | string[]",
          default: "—",
          description: "Initial pressed value(s), uncontrolled.",
        },
        {
          prop: "onValueChange",
          type: "(value) => void",
          default: "—",
          description: "Called when the pressed value(s) change.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the whole group ignores interaction.",
        },
        {
          prop: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Keyboard navigation axis. The sliding single-select indicator assumes a horizontal strip, same scope as Tabs.",
        },
      ],
    },
    {
      component: "ToggleGroupItem",
      props: [
        {
          prop: "value",
          type: "string",
          default: "—",
          description: "This item's value within the group.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether this item can be pressed.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Item content — an icon, a label, or both.",
        },
      ],
    },
  ],
};

export { toggleGroupItem as toggleGroup };
