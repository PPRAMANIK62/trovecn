import type { RegistryManifestItem } from "@/lib/registry-types";

const sliderItem: RegistryManifestItem = {
  name: "slider",
  type: "registry:ui",
  title: "Slider",
  description:
    "Base UI slider with a spring-driven thumb — direct 1:1 tracking while dragging, a spring settle on release or track-press, and a delayed hover tooltip. Supports single-value and two-thumb range use out of the box.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/ui/slider.tsx", type: "registry:ui" }],
};

export { sliderItem as slider };
