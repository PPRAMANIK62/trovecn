import type { RegistryManifestItem } from "@/lib/registry-types";

export const tooltip: RegistryManifestItem = {
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description: "Fast, fading label with minimal collision-aware travel from its trigger.",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs", "font-weight"],
  files: [{ path: "src/components/ui/tooltip.tsx", type: "registry:ui" }],
};
