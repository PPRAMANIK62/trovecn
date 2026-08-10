import type { RegistryItem } from "@/lib/registry-types";

import TabsStandaloneExample from "./examples/standalone";
import TabsIconsExample from "./examples/icons";

export const tabs: RegistryItem = {
  slug: "tabs",
  title: "Tabs",
  description: "A tab list with an animated indicator and panel transitions.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs", "font-weight", "use-proximity-hover"],
  file: "src/components/ui/tabs.tsx",
  examples: [
    {
      title: "Standalone",
      description: "Three tabs with the indicator sliding between them.",
      file: "registry/trovecn/tabs/examples/standalone.tsx",
      Demo: TabsStandaloneExample,
    },
    {
      title: "Icons",
      description: "A tab per icon+label pair — the indicator resizes to fit each one.",
      file: "registry/trovecn/tabs/examples/icons.tsx",
      Demo: TabsIconsExample,
    },
  ],
  api: [
    {
      component: "Tabs",
      props: [
        {
          prop: "defaultValue",
          type: "unknown",
          default: "—",
          description: "Initially active tab value, uncontrolled.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "Controlled active tab value.",
        },
        {
          prop: "onValueChange",
          type: "(value) => void",
          default: "—",
          description: "Called when the active tab changes.",
        },
        {
          prop: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Layout and keyboard navigation axis.",
        },
      ],
    },
    {
      component: "TabsList",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description:
            "One TabsTrigger per tab. The sliding indicator and the proximity hover pill render automatically — no separate indicator component to place.",
        },
      ],
    },
    {
      component: "TabsTrigger",
      props: [
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "Identifies which TabsContent this trigger activates.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether this tab is disabled.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Tab label — an icon plus text lays out side by side automatically.",
        },
      ],
    },
    {
      component: "TabsContent",
      props: [
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description: "Matches the TabsTrigger value this panel belongs to.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Panel content, shown while its tab is active.",
        },
      ],
    },
  ],
};
