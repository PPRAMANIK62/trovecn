import type { RegistryManifestItem } from "@/lib/registry-types";

const navigationMenuItem: RegistryManifestItem = {
  name: "navigation-menu",
  type: "registry:ui",
  title: "Navigation Menu",
  description: "Mega-menu nav with a shared viewport that resizes between preview panels.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "use-proximity-hover"],
  files: [{ path: "src/components/ui/navigation-menu.tsx", type: "registry:ui" }],
};

export { navigationMenuItem as navigationMenu };
