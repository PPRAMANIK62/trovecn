import type { RegistryItem } from "@/lib/registry-types";

import ContextMenuBasicExample from "./examples/basic";
import ContextMenuSubmenuExample from "./examples/submenu";

export const contextMenu: RegistryItem = {
  slug: "context-menu",
  title: "Context Menu",
  description: "A pointer-anchored action menu with nested and selectable items.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  file: "src/components/ui/context-menu.tsx",
  examples: [
    {
      title: "Basic",
      description: "Cut/copy/paste actions with shortcuts on a right-click surface.",
      file: "registry/trovecn/context-menu/examples/basic.tsx",
      Demo: ContextMenuBasicExample,
    },
    {
      title: "Submenu",
      description: "A nested Share submenu off the top-level menu.",
      file: "registry/trovecn/context-menu/examples/submenu.tsx",
      Demo: ContextMenuSubmenuExample,
    },
  ],
  api: [
    {
      component: "ContextMenu / ContextMenuTrigger / ContextMenuPortal",
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
      ],
    },
    {
      component: "ContextMenuContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"right"',
          description: "Which side of the click point the menu opens on.",
        },
        {
          prop: "align",
          type: '"start" | "center" | "end"',
          default: '"start"',
          description: "Alignment relative to the click point along that side.",
        },
      ],
    },
    {
      component: "ContextMenuItem",
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
      component: "ContextMenuSub / ContextMenuSubTrigger / ContextMenuSubContent",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description:
            "ContextMenuSubTrigger's label; ContextMenuSubContent's items — a nested ContextMenuContent.",
        },
      ],
    },
  ],
};
