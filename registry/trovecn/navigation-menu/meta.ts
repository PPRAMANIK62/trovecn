import type { RegistryItem } from "@/lib/registry-types";

import NavigationMenuMegaMenuExample from "./examples/mega-menu";
import NavigationMenuResizeExample from "./examples/resize";

export const navigationMenu: RegistryItem = {
  slug: "navigation-menu",
  title: "Navigation Menu",
  description:
    "Mega-menu nav with preview panels. One shared viewport resizes and crossfades between whichever top-level item is active, instead of each item owning its own popup — the top-level trigger row gets the same proximity-hover wash every other interactive list in this registry uses.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "use-proximity-hover"],
  file: "src/components/ui/navigation-menu.tsx",
  examples: [
    {
      title: "Mega menu",
      description: "A feature grid and a simple list, off two different triggers.",
      file: "registry/trovecn/navigation-menu/examples/mega-menu.tsx",
      Demo: NavigationMenuMegaMenuExample,
    },
    {
      title: "Resizing viewport",
      description: "Two very differently sized panels sharing one viewport.",
      file: "registry/trovecn/navigation-menu/examples/resize.tsx",
      Demo: NavigationMenuResizeExample,
    },
  ],
  api: [
    {
      component: "NavigationMenu",
      props: [
        {
          prop: "align",
          type: '"start" | "center" | "end"',
          default: '"start"',
          description: "Alignment of the shared viewport relative to the active trigger.",
        },
      ],
    },
    {
      component: "NavigationMenuItem / NavigationMenuTrigger / NavigationMenuContent",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "NavigationMenuTrigger's label; NavigationMenuContent's panel content.",
        },
      ],
    },
    {
      component: "NavigationMenuLink",
      props: [
        {
          prop: "href",
          type: "string",
          default: "—",
          description: "Renders as an anchor by default; pass `render` to use a router Link.",
        },
        {
          prop: "active",
          type: "boolean",
          default: "false",
          description: "Marks the link as the current page.",
        },
      ],
    },
  ],
};
