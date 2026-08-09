import type { RegistryManifestItem } from "@/lib/registry-types";

export const combobox: RegistryManifestItem = {
  name: "combobox",
  type: "registry:ui",
  title: "Combobox",
  description: "Base UI combobox — a text input filtered against a list as you type.",
  dependencies: ["@base-ui/react", "framer-motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/combobox.tsx", type: "registry:ui" }],
};
