import type { RegistryManifestItem } from "@/lib/registry-types";

const menubarItem: RegistryManifestItem = {
  name: "menubar",
  type: "registry:ui",
  title: "Menubar",
  description: "App-shell top menu — a row of dropdown Menus with macOS-style hover switching.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover", "menu"],
  files: [{ path: "src/components/ui/menubar.tsx", type: "registry:ui" }],
};

export { menubarItem as menubar };
