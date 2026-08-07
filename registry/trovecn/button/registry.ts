import type { RegistryManifestItem } from "@/lib/registry-types";

export const button: RegistryManifestItem = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Base UI button with variant and size styling via class-variance-authority.",
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["utils"],
  files: [{ path: "src/components/ui/button.tsx", type: "registry:ui" }],
};
