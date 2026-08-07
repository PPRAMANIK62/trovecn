import type { RegistryManifestItem } from "@/lib/registry-types";

export const popover: RegistryManifestItem = {
  name: "popover",
  type: "registry:ui",
  title: "Popover",
  description:
    "Anchored floating panel that grows out of its trigger, scaling from Base UI's transform-origin.",
  dependencies: ["framer-motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/popover.tsx", type: "registry:ui" }],
};
