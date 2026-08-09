import type { RegistryManifestItem } from "@/lib/registry-types";

export const dialog: RegistryManifestItem = {
  name: "dialog",
  type: "registry:ui",
  title: "Dialog",
  description: "Centered modal with a spring-scaled popup and fading backdrop.",
  dependencies: ["motion", "@base-ui/react", "lucide-react"],
  registryDependencies: ["utils", "springs", "button"],
  files: [{ path: "src/components/ui/dialog.tsx", type: "registry:ui" }],
};
