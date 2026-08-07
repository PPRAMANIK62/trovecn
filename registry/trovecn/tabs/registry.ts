import type { RegistryManifestItem } from "@/lib/registry-types";

export const tabs: RegistryManifestItem = {
  name: "tabs",
  type: "registry:ui",
  title: "Tabs",
  description:
    "Tab list with a spring-driven sliding indicator and proximity hover across every tab.",
  dependencies: ["framer-motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs", "font-weight", "use-proximity-hover"],
  files: [{ path: "src/components/ui/tabs.tsx", type: "registry:ui" }],
};
