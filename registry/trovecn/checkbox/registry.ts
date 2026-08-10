import type { RegistryManifestItem } from "@/lib/registry-types";

const checkboxItem: RegistryManifestItem = {
  name: "checkbox",
  type: "registry:ui",
  title: "Checkbox",
  description: "Base UI checkbox with a hand-drawn checkmark that draws on and off.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/checkbox.tsx", type: "registry:ui" }],
};

export { checkboxItem as checkbox };
