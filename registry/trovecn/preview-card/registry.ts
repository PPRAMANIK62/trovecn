import type { RegistryManifestItem } from "@/lib/registry-types";

const previewCardItem: RegistryManifestItem = {
  name: "preview-card",
  type: "registry:ui",
  title: "Preview Card",
  description: "A floating preview panel that opens on a longer hover delay than Tooltip.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/preview-card.tsx", type: "registry:ui" }],
};

export { previewCardItem as previewCard };
