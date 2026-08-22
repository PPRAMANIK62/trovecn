import type { RegistryManifestItem } from "@/lib/registry-types";

export const listDetailMorph: RegistryManifestItem = {
  name: "list-detail-morph",
  type: "registry:ui",
  title: "List Detail Morph",
  description:
    "List to detail navigation where the row you pressed becomes the detail view, and reverses from wherever it is if you leave early.",
  dependencies: ["motion", "lucide-react"],
  registryDependencies: ["utils", "springs"],
  files: [
    {
      path: "src/components/trovecn/navigation/list-detail-morph.tsx",
      type: "registry:ui",
    },
  ],
};
