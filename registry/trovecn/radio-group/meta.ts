import type { RegistryItem } from "@/lib/registry-types";

import RadioGroupBasicExample from "./examples/basic";
import RadioGroupSettingsExample from "./examples/settings";

export const radioGroup: RegistryItem = {
  slug: "radio-group",
  title: "Radio Group",
  description:
    "Base UI radio group with a spring-driven selected background that tracks whichever option is currently chosen, plus proximity hover across every row. The mutually-exclusive picker behind plan selectors and settings lists.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  file: "src/components/ui/radio-group.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description: "A plan picker — three mutually-exclusive options with a springy selection.",
      file: "registry/trovecn/radio-group/examples/basic.tsx",
      Demo: RadioGroupBasicExample,
    },
    {
      title: "Settings",
      description: "Label and description per row, the shape of a settings list.",
      file: "registry/trovecn/radio-group/examples/settings.tsx",
      Demo: RadioGroupSettingsExample,
    },
  ],
  api: [
    {
      component: "RadioGroup",
      props: [
        {
          prop: "value",
          type: "string",
          default: "—",
          description: "Controlled value of the currently selected radio item.",
        },
        {
          prop: "defaultValue",
          type: "string",
          default: "—",
          description: "Initial value, uncontrolled.",
        },
        {
          prop: "onValueChange",
          type: "(value, eventDetails) => void",
          default: "—",
          description: "Called when the selected value changes.",
        },
        {
          prop: "name",
          type: "string",
          default: "—",
          description: "Identifies the field when a form is submitted.",
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
      component: "RadioGroupItem",
      props: [
        {
          prop: "value",
          type: "string",
          default: "—",
          description: "Unique identifying value of this radio within the group.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether this radio item can be selected.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Row content rendered next to the radio dot (label, description, etc.).",
        },
      ],
    },
  ],
};
