import type { RegistryManifestItem } from "@/lib/registry-types";

const drawerItem: RegistryManifestItem = {
  name: "drawer",
  type: "registry:ui",
  title: "Drawer",
  description: "Edge-anchored panel with real drag-to-dismiss on top and bottom.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/drawer.tsx", type: "registry:ui" }],
};

export { drawerItem as drawer };
