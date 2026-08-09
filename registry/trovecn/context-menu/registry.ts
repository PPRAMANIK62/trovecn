import type { RegistryManifestItem } from "@/lib/registry-types";

const contextMenuItem: RegistryManifestItem = {
  name: "context-menu",
  type: "registry:ui",
  title: "Context Menu",
  description: "Right-click menu — Base UI's Menu popup anchored at the pointer.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/context-menu.tsx", type: "registry:ui" }],
};

export { contextMenuItem as contextMenu };
