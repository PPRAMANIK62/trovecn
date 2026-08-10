import type { RegistryManifestItem } from "@/lib/registry-types";

const toggleGroupItem: RegistryManifestItem = {
  name: "toggle-group",
  type: "registry:ui",
  title: "Toggle Group",
  description:
    "A row of linked Base UI Toggles — single-select segmented control with a sliding indicator, or independent multi-select.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/toggle-group.tsx", type: "registry:ui" }],
};

export { toggleGroupItem as toggleGroup };
