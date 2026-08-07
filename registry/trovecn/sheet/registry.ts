import type { RegistryManifestItem } from "@/lib/registry-types";

export const sheet: RegistryManifestItem = {
  name: "sheet",
  type: "registry:ui",
  title: "Sheet",
  description:
    "Edge-anchored panel built on the Dialog primitive, sliding in from any side with a fading backdrop.",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
  files: [{ path: "src/components/ui/sheet.tsx", type: "registry:ui" }],
};
