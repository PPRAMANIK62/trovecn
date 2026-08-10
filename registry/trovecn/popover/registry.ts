import type { RegistryManifestItem } from "@/lib/registry-types";

export const popover: RegistryManifestItem = {
  name: "popover",
  type: "registry:ui",
  title: "Popover",
  description:
    "Anchored floating panel that enters from its trigger with a small placement-aware offset.",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/popover.tsx", type: "registry:ui" }],
};
