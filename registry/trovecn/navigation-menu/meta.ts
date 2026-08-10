import type { RegistryItem } from "@/lib/registry-types";

import NavigationMenuMegaMenuExample from "./examples/mega-menu";
import NavigationMenuResizeExample from "./examples/resize";

export const navigationMenu: RegistryItem = {
  slug: "navigation-menu",
  title: "Navigation Menu",
  description: "A shared-viewport mega menu with preview panels.",
  category: "Primitives",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "use-proximity-hover"],
  file: "src/components/ui/navigation-menu.tsx",
  examples: [
    {
      title: "Mega menu",
      description: "A featured getting-started panel and a compact component grid.",
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
