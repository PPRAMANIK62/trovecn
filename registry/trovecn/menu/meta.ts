import type { RegistryItem } from "@/lib/registry-types";

import MenuStandaloneExample from "./examples/standalone";
import MenuCheckboxesExample from "./examples/checkboxes";

export const menu: RegistryItem = {
  slug: "menu",
  title: "Menu",
  description:
    "Base UI menu with submenus, checkbox/radio items, and a spring-driven popup — the dropdown behind mega-menus and sidebar row actions.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  file: "src/components/ui/menu.tsx",
  examples: [
    {
      title: "Standalone",
      description: "Actions and shortcuts off an icon trigger.",
      file: "registry/trovecn/menu/examples/standalone.tsx",
      Demo: MenuStandaloneExample,
    },
    {
      title: "Checkboxes & radio",
      description: "Grouped checkbox items alongside a radio group, the settings-menu shape.",
      file: "registry/trovecn/menu/examples/checkboxes.tsx",
      Demo: MenuCheckboxesExample,
    },
  ],
  api: [
    {
      component: "Menu / MenuTrigger / MenuPortal",
      props: [
        {
          prop: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Whether the menu is initially open, uncontrolled.",
        },
        {
          prop: "open",
          type: "boolean",
          default: "—",
          description: "Controlled open state.",
        },
        {
          prop: "onOpenChange",
          type: "(open: boolean) => void",
          default: "—",
          description: "Called when the open state changes.",
        },
        {
          prop: "modal",
          type: "boolean",
          default: "true",
          description: "Whether opening the menu locks page scroll and outside pointer input.",
        },
      ],
    },
    {
      component: "MenuContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "Which side of the trigger the menu opens on.",
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
          default: "4",
          description: "Gap in pixels between the trigger and the menu.",
        },
      ],
    },
    {
      component: "MenuItem",
      props: [
        {
          prop: "variant",
          type: '"default" | "destructive"',
          default: '"default"',
          description: "Visual style — destructive tints the label and highlight red.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the item ignores interaction.",
        },
        {
          prop: "closeOnClick",
          type: "boolean",
          default: "true",
          description: "Whether selecting the item closes the menu.",
        },
      ],
    },
    {
      component: "MenuCheckboxItem / MenuRadioItem / MenuRadioGroup",
      props: [
        {
          prop: "checked",
          type: "boolean",
          default: "—",
          description: "(MenuCheckboxItem) Controlled checked state.",
        },
        {
          prop: "onCheckedChange",
          type: "(checked: boolean) => void",
          default: "—",
          description: "(MenuCheckboxItem) Called when the checked state changes.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description:
            "(MenuRadioGroup) Controlled selected value; (MenuRadioItem) this item's value.",
        },
        {
          prop: "onValueChange",
          type: "(value) => void",
          default: "—",
          description: "(MenuRadioGroup) Called when the selected value changes.",
        },
      ],
    },
    {
      component: "MenuSub / MenuSubTrigger / MenuSubContent",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "MenuSubTrigger's label; MenuSubContent's items — a nested MenuContent.",
        },
      ],
    },
  ],
};
