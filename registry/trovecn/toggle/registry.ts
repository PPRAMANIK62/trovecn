import type { RegistryManifestItem } from "@/lib/registry-types";

const toggleItem: RegistryManifestItem = {
  name: "toggle",
  type: "registry:ui",
  title: "Toggle",
  description: "Base UI two-state button — a favorite/star button, a toolbar formatting control.",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
  files: [{ path: "src/components/ui/toggle.tsx", type: "registry:ui" }],
};

export { toggleItem as toggle };
