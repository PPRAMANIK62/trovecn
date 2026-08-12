import type { RegistryManifestItem } from "@/lib/registry-types";

export const comparisonSlider: RegistryManifestItem = {
  name: "comparison-slider",
  type: "registry:ui",
  title: "Comparison Slider",
  description: "Draggable clip-path divider that reveals one live layer over another.",
  dependencies: ["lucide-react"],
  registryDependencies: ["utils"],
  files: [
    {
      path: "src/components/trovecn/motion-demos/comparison-slider.tsx",
      type: "registry:ui",
    },
  ],
};
