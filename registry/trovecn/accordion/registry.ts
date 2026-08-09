import type { RegistryManifestItem } from "@/lib/registry-types";

export const accordion: RegistryManifestItem = {
  name: "accordion",
  type: "registry:ui",
  title: "Accordion",
  description:
    "Collapsible accordion with spring-animated height and chevron, and proximity hover across every row.",
  dependencies: ["motion", "@base-ui/react", "lucide-react"],
  registryDependencies: ["utils", "springs", "font-weight", "use-proximity-hover"],
  files: [{ path: "src/components/ui/accordion.tsx", type: "registry:ui" }],
};
