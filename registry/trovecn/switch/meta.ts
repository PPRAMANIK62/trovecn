import type { RegistryItem } from "@/lib/registry-types";

import SwitchSizesExample from "./examples/sizes";
import SwitchSettingsRowExample from "./examples/settings-row";

const switchItem: RegistryItem = {
  slug: "switch",
  title: "Switch",
  description:
    "Base UI switch with a squishy, draggable thumb — it stretches on hover, squishes on press, and can be dragged (not just clicked) to the other side. The on/off control behind pricing toggles and settings rows.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/ui/switch.tsx",
  examples: [
    {
      title: "Sizes",
      description: "The two size steps, sm and default.",
      file: "registry/trovecn/switch/examples/sizes.tsx",
      Demo: SwitchSizesExample,
    },
    {
      title: "Settings row",
      description: "Label, description, and switch laid out as a settings list item.",
      file: "registry/trovecn/switch/examples/settings-row.tsx",
      Demo: SwitchSettingsRowExample,
    },
  ],
  api: [
    {
      component: "Switch",
      props: [
        {
          prop: "size",
          type: '"sm" | "default"',
          default: '"default"',
          description: "Track/thumb size step.",
        },
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
          description: "Called when the switch is toggled, by click or by drag.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the switch can be toggled.",
        },
      ],
    },
  ],
};

export { switchItem as switch };
