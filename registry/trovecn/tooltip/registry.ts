import type { RegistryManifestItem } from "@/lib/registry-types";

export const tooltip: RegistryManifestItem = {
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description: "Fast, fading label that slides in from the trigger's side.",
  dependencies: ["framer-motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs", "font-weight"],
  files: [{ path: "src/components/ui/tooltip.tsx", type: "registry:ui" }],
};
