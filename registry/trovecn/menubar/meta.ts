import type { RegistryItem } from "@/lib/registry-types";

import MenubarAppShellExample from "./examples/app-shell";
import MenubarCheckboxesExample from "./examples/checkboxes";

export const menubar: RegistryItem = {
  slug: "menubar",
  title: "Menubar",
  description:
    "App-shell top menu. Every top-level menu is the dropdown Menu primitive nested in Base UI's Menubar container, which wires the macOS/Windows hover-switch behavior in for free — hovering a sibling trigger only opens it once another menu in the bar is already open.",
  category: "Primitives",
  isNew: true,
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover", "menu"],
  file: "src/components/ui/menubar.tsx",
  examples: [
    {
      title: "App shell",
      description: "File/Edit/View menus with shortcuts, the classic desktop-app shape.",
      file: "registry/trovecn/menubar/examples/app-shell.tsx",
      Demo: MenubarAppShellExample,
    },
    {
      title: "Checkboxes & radio",
      description: "A View menu with checkbox toggles and a theme radio group.",
      file: "registry/trovecn/menubar/examples/checkboxes.tsx",
      Demo: MenubarCheckboxesExample,
    },
  ],
  api: [
    {
      component: "Menubar",
      props: [
        {
          prop: "modal",
          type: "boolean",
          default: "true",
          description: "Whether an open menu locks page scroll and outside pointer input.",
        },
        {
          prop: "loopFocus",
          type: "boolean",
          default: "true",
          description: "Whether arrow-key focus loops from the last trigger back to the first.",
        },
      ],
    },
    {
      component: "MenubarMenu / MenubarTrigger / MenubarContent",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "MenubarTrigger's label; MenubarContent's items — a dropdown Menu popup.",
        },
      ],
    },
    {
      component: "MenubarItem",
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
      ],
    },
    {
      component: "MenubarCheckboxItem / MenubarRadioItem / MenubarRadioGroup",
      props: [
        {
          prop: "checked",
          type: "boolean",
          default: "—",
          description: "(MenubarCheckboxItem) Controlled checked state.",
        },
        {
          prop: "value",
          type: "unknown",
          default: "—",
          description:
            "(MenubarRadioGroup) Controlled selected value; (MenubarRadioItem) this item's value.",
        },
      ],
    },
  ],
};
