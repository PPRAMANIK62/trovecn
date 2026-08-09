import type { RegistryManifestItem } from "@/lib/registry-types";

export const menu: RegistryManifestItem = {
  name: "menu",
  type: "registry:ui",
  title: "Menu",
  description: "Base UI menu with submenus, checkbox/radio items, and a spring-driven popup.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/menu.tsx", type: "registry:ui" }],
};
