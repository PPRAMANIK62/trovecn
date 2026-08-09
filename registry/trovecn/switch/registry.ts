import type { RegistryManifestItem } from "@/lib/registry-types";

const switchItem: RegistryManifestItem = {
  name: "switch",
  type: "registry:ui",
  title: "Switch",
  description: "Base UI switch with a squishy, draggable, spring-driven thumb.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/switch.tsx", type: "registry:ui" }],
};

export { switchItem as switch };
