import type { RegistryItem } from "@/lib/registry-types";

import ComboboxStandaloneExample from "./examples/standalone";
import ComboboxGroupsExample from "./examples/groups";

export const combobox: RegistryItem = {
  slug: "combobox",
  title: "Combobox",
  description: "A searchable select with a width-matched floating list.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  file: "src/components/ui/combobox.tsx",
  examples: [
    {
      title: "Standalone",
      description: "A filtered list with a clear button, the plain single-select shape.",
      file: "registry/trovecn/combobox/examples/standalone.tsx",
      Demo: ComboboxStandaloneExample,
    },
    {
      title: "Grouped",
      description: "Items grouped under labelled sections, filtering within each group.",
      file: "registry/trovecn/combobox/examples/groups.tsx",
      Demo: ComboboxGroupsExample,
    },
  ],
  api: [
    {
      component: "Combobox",
      props: [
        {
          prop: "items",
          type: "readonly unknown[] | readonly { items: unknown[] }[]",
          default: "—",
          description:
            "Flat item list, or groups of items — filtered against the input as it's typed.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "Controlled selected value (an array when `multiple`).",
        },
        {
          prop: "onValueChange",
          type: "(value) => void",
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
          prop: "filter",
          type: "(itemValue, query) => boolean",
          default: "collator substring match",
          description: "Override the default filter — pass `null` to disable filtering entirely.",
        },
      ],
    },
    {
      component:
        "ComboboxInputGroup / ComboboxInput / ComboboxIcon / ComboboxSearchIcon / ComboboxClear",
      props: [
        {
          prop: "placeholder",
          type: "string",
          default: "—",
          description: "(ComboboxInput) Placeholder text shown when empty.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "ChevronDownIcon",
          description: "(ComboboxIcon) Override the default open-popup indicator icon.",
        },
      ],
    },
    {
      component: "ComboboxContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "Which side of the input the popup opens on.",
        },
        {
          prop: "align",
          type: '"start" | "center" | "end"',
          default: '"start"',
          description: "Alignment relative to the input along that side.",
        },
      ],
    },
    {
      component: "ComboboxList / ComboboxItem / ComboboxEmpty",
      props: [
        {
          prop: "children",
          type: "(item, index) => ReactNode",
          default: "—",
          description: "(ComboboxList) Renders once per filtered item — typically a ComboboxItem.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "(ComboboxItem) This item's value; matched against the selected value.",
        },
      ],
    },
    {
      component: "ComboboxGroup / ComboboxGroupLabel",
      props: [
        {
          prop: "items",
          type: "readonly unknown[]",
          default: "—",
          description: "(ComboboxGroup) The group's items, when rendering grouped data.",
        },
      ],
    },
  ],
};
