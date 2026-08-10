import type { RegistryItem } from "@/lib/registry-types";

import CheckboxSingleExample from "./examples/single";
import CheckboxBasicExample from "./examples/basic";

const checkboxItem: RegistryItem = {
  slug: "checkbox",
  title: "Checkbox",
  description: "An animated checkbox for standalone form choices.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/ui/checkbox.tsx",
  isNew: true,
  examples: [
    {
      title: "Single",
      description: "A lone terms-agreement checkbox with an inline label.",
      file: "registry/trovecn/checkbox/examples/single.tsx",
      Demo: CheckboxSingleExample,
    },
    {
      title: "Basic",
      description: "A few independent, unrelated settings checkboxes — no group treatment.",
      file: "registry/trovecn/checkbox/examples/basic.tsx",
      Demo: CheckboxBasicExample,
    },
  ],
  api: [
    {
      component: "Checkbox",
      props: [
        {
          prop: "checked",
          type: "boolean",
          default: "—",
          description: "Controlled checked state.",
        },
        {
          prop: "defaultChecked",
          type: "boolean",
          default: "false",
          description: "Initial checked state, uncontrolled.",
        },
        {
          prop: "onCheckedChange",
          type: "(checked, eventDetails) => void",
          default: "—",
          description: "Called when the checkbox is ticked or unticked.",
        },
        {
          prop: "indeterminate",
          type: "boolean",
          default: "false",
          description: "Renders a dash instead of a checkmark — neither ticked nor unticked.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the checkbox can be toggled.",
        },
        {
          prop: "name",
          type: "string",
          default: "—",
          description: "Identifies the field when a form is submitted.",
        },
      ],
    },
  ],
};

export { checkboxItem as checkbox };
