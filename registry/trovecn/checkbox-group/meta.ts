import type { RegistryItem } from "@/lib/registry-types";

import CheckboxGroupBasicExample from "./examples/basic";
import CheckboxGroupSettingsExample from "./examples/settings";

const checkboxGroupItem: RegistryItem = {
  slug: "checkbox-group",
  title: "Checkbox Group",
  description: "A multi-select checkbox list with connected selection states.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover", "use-merge-split"],
  file: "src/components/ui/checkbox.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "A todo list, pre-checked non-contiguously — check the row between two existing runs to see them merge into one block.",
      file: "registry/trovecn/checkbox-group/examples/basic.tsx",
      Demo: CheckboxGroupBasicExample,
    },
    {
      title: "Settings",
      description: "A permissions list — title and description per row.",
      file: "registry/trovecn/checkbox-group/examples/settings.tsx",
      Demo: CheckboxGroupSettingsExample,
    },
  ],
  api: [
    {
      component: "CheckboxGroup",
      props: [
        {
          prop: "value",
          type: "string[]",
          default: "—",
          description: "Names of the checked rows, controlled.",
        },
        {
          prop: "defaultValue",
          type: "string[]",
          default: "[]",
          description: "Initial checked row names, uncontrolled.",
        },
        {
          prop: "onValueChange",
          type: "(value, eventDetails) => void",
          default: "—",
          description: "Called when a row is ticked or unticked, with the group's new value.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the whole group ignores user interaction.",
        },
      ],
    },
    {
      component: "CheckboxGroupItem",
      props: [
        {
          prop: "name",
          type: "string",
          default: "—",
          description:
            "Identifies this row within the group's value array — passed through to the inner Checkbox's name.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether this row can be toggled.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Row content rendered next to the checkbox (label, description, etc.).",
        },
      ],
    },
  ],
};

export { checkboxGroupItem as checkboxGroup };
