import type { RegistryItem } from "@/lib/registry-types";

import ComparisonSliderMagneticButtonExample from "./examples/magnetic-button";
import ComparisonSliderTiltCardExample from "./examples/tilt-card";
import ComparisonSliderListReorderExample from "./examples/list-reorder";

export const comparisonSlider: RegistryItem = {
  slug: "comparison-slider",
  title: "Comparison Slider",
  description:
    "A draggable divider that reveals one live layer over another — before/after, on/off, any two states of the same UI.",
  category: "Components",
  dependencies: ["lucide-react"],
  registryDependencies: ["utils"],
  file: "src/components/trovecn/motion-demos/comparison-slider.tsx",
  examples: [
    {
      title: "Magnetic pull",
      description:
        "Move your cursor over the card — the static button ignores it, the magnetic one pulls toward it and springs back on release.",
      file: "registry/trovecn/comparison-slider/examples/magnetic-button.tsx",
      Demo: ComparisonSliderMagneticButtonExample,
    },
    {
      title: "3D tilt",
      description:
        "The same cursor position drives both cards — one stays flat, the other tilts with real depth and a moving glare.",
      file: "registry/trovecn/comparison-slider/examples/tilt-card.tsx",
      Demo: ComparisonSliderTiltCardExample,
    },
    {
      title: "List reorder",
      description:
        "A small Indian-food leaderboard reshuffles every couple seconds — one side teleports to its new rank, the other animates there with a shared-layout spring.",
      file: "registry/trovecn/comparison-slider/examples/list-reorder.tsx",
      Demo: ComparisonSliderListReorderExample,
    },
  ],
  api: [
    {
      component: "ComparisonSlider",
      props: [
        {
          prop: "before / after",
          type: "ReactNode",
          default: "—",
          description:
            "Two live layers stacked full-bleed; `before` is clipped to the divider, `after` sits underneath.",
        },
        {
          prop: "beforeLabel / afterLabel",
          type: "string",
          default: '"Before" / "After"',
          description: "Corner labels identifying each side.",
        },
        {
          prop: "defaultValue",
          type: "number",
          default: "50",
          description: "Initial divider position, 0-100.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the container.",
        },
      ],
    },
  ],
};
