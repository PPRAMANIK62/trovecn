import type { RegistryItem } from "@/lib/registry-types";

import SelectBasicExample from "./examples/basic";
import SelectGroupedExample from "./examples/grouped";

export const select: RegistryItem = {
  slug: "select",
  title: "Select",
  description:
    "Base UI select with a spring-driven popup sized to its content, a sliding highlight that tracks the current selection, and a checkmark that draws itself in rather than popping. The picker behind form fields and settings rows.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  file: "src/components/ui/select.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description: "A flat option list, the plain single-select shape.",
      file: "registry/trovecn/select/examples/basic.tsx",
      Demo: SelectBasicExample,
    },
    {
      title: "Grouped",
      description: "Items grouped under labelled sections.",
      file: "registry/trovecn/select/examples/grouped.tsx",
      Demo: SelectGroupedExample,
    },
  ],
  api: [
    {
      component: "Select",
      props: [
        {
          prop: "items",
          type: "Record<string, ReactNode> | readonly { label, value }[] | readonly { items }[]",
          default: "—",
          description:
            "Optional data-driven item list — when specified, Select.Value renders the matching label instead of the raw value.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "Controlled selected value (an array when `multiple`).",
        },
        {
          prop: "defaultValue",
          type: "unknown",
          default: "—",
          description: "Initial selected value, uncontrolled.",
        },
        {
          prop: "onValueChange",
          type: "(value, eventDetails) => void",
          default: "—",
          description: "Called when the selected value changes.",
        },
        {
          prop: "multiple",
          type: "boolean",
          default: "false",
          description: "Whether more than one item can be selected.",
        },
        {
          prop: "open",
          type: "boolean",
          default: "—",
          description: "Controlled open state.",
        },
        {
          prop: "onOpenChange",
          type: "(open, eventDetails) => void",
          default: "—",
          description:
            "Called when the open state changes. Closing on an item click is held open ~300ms first so the checkmark and selected-row highlight are visible — every other close reason closes immediately.",
        },
        {
          prop: "isItemEqualToValue",
          type: "(itemValue, value) => boolean",
          default: "Object.is",
          description:
            "Custom comparison for matching an item's value against the selected value — useful when values are objects.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the whole select ignores interaction.",
        },
      ],
    },
    {
      component: "SelectTrigger / SelectValue / SelectIcon",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "(SelectTrigger) SelectValue + SelectIcon, or any custom trigger content.",
        },
        {
          prop: "placeholder",
          type: "ReactNode",
          default: "—",
          description: "(SelectValue) Shown when nothing is selected yet.",
        },
        {
          prop: "children",
          type: "(value) => ReactNode",
          default: "—",
          description: "(SelectValue) Optional formatter for the selected value's display label.",
        },
      ],
    },
    {
      component: "SelectContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "Which side of the trigger the popup opens on.",
        },
        {
          prop: "align",
          type: '"start" | "center" | "end"',
          default: '"start"',
          description: "Alignment relative to the trigger along that side.",
        },
        {
          prop: "sideOffset",
          type: "number",
          default: "6",
          description: "Gap in pixels between the trigger and the popup.",
        },
        {
          prop: "alignItemWithTrigger",
          type: "boolean",
          default: "false",
          description:
            "Whether the popup overlaps the trigger so the selected item's text lines up with the trigger's value text, native-`<select>`-style, instead of opening as a plain anchored dropdown.",
        },
      ],
    },
    {
      component: "SelectList / SelectItem",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "(SelectList) SelectItem/SelectGroup rows — owns the selected/hover pills.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "(SelectItem) This item's value; matched against the selected value.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "(SelectItem) Whether the item ignores interaction.",
        },
        {
          prop: "label",
          type: "string",
          default: "item text content",
          description: "(SelectItem) Label used for keyboard type-ahead matching.",
        },
      ],
    },
    {
      component: "SelectGroup / SelectGroupLabel",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "(SelectGroup) SelectItem rows; (SelectGroupLabel) the section heading.",
        },
      ],
    },
  ],
};
