import type { RegistryManifestItem } from "@/lib/registry-types";

export const elasticSlider: RegistryManifestItem = {
  name: "elastic-slider",
  type: "registry:ui",
  title: "Elastic Slider",
  description:
    "A bounded-value slider whose track thickens under the grab and stretches with real resistance past either end.",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  files: [
    {
      path: "src/components/trovecn/inputs/elastic-slider.tsx",
      type: "registry:ui",
    },
  ],
};
