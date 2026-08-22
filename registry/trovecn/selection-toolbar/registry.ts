import type { RegistryManifestItem } from "@/lib/registry-types";

export const selectionToolbar: RegistryManifestItem = {
  name: "selection-toolbar",
  type: "registry:ui",
  title: "Selection Toolbar",
  description:
    "A formatting toolbar for a text selection, anchored to the line the drag ended on rather than centred over the paragraph, and flipped below that line when the line above is selected too.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "button", "springs"],
  files: [
    {
      path: "src/components/trovecn/inputs/selection-toolbar.tsx",
      type: "registry:ui",
    },
  ],
};
