import type { RegistryItem } from "@/lib/registry-types";

import SliderBasicExample from "./examples/basic";
import SliderRangeExample from "./examples/range";

const sliderItem: RegistryItem = {
  slug: "slider",
  title: "Slider",
  description: "A direct-manipulation slider for values and ranges.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/ui/slider.tsx",
  examples: [
    {
      title: "Basic",
      description: "A single-thumb slider with a live value readout and hover/drag tooltip.",
      file: "registry/trovecn/slider/examples/basic.tsx",
      Demo: SliderBasicExample,
    },
    {
      title: "Range",
      description: "A two-thumb range slider for selecting a min/max span, with a 10-unit step.",
      file: "registry/trovecn/slider/examples/range.tsx",
      Demo: SliderRangeExample,
    },
  ],
  api: [
    {
      component: "Slider",
      props: [
        {
          prop: "value",
          type: "number | readonly number[]",
          default: "—",
          description:
            "Controlled value — a single number, or a two-item array for a range slider.",
        },
        {
          prop: "defaultValue",
          type: "number | readonly number[]",
          default: "min",
          description: "Initial value, uncontrolled.",
        },
        {
          prop: "onValueChange",
          type: "(value, eventDetails) => void",
          default: "—",
          description: "Called on every value change, including continuously while dragging.",
        },
        {
          prop: "onValueCommitted",
          type: "(value, eventDetails) => void",
          default: "—",
          description: "Called once when a drag, track-press, or keyboard change is committed.",
        },
        { prop: "min", type: "number", default: "0", description: "Minimum allowed value." },
        { prop: "max", type: "number", default: "100", description: "Maximum allowed value." },
        {
          prop: "step",
          type: "number",
          default: "1",
          description: "Granularity the slider snaps to.",
        },
        {
          prop: "minStepsBetweenValues",
          type: "number",
          default: "0",
          description: "Minimum step distance enforced between two range thumbs.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the slider ignores user interaction.",
        },
        {
          prop: "label",
          type: "ReactNode",
          default: "—",
          description:
            "Visible label rendered above the control, paired with a live value readout.",
        },
        {
          prop: "thumbLabels",
          type: "string[]",
          default: "—",
          description: "Accessible name(s) for the thumb(s) when there's no visible label.",
        },
        {
          prop: "formatValue",
          type: "(value: number) => string",
          default: "rounds to 1 decimal place",
          description: "Formats the number shown in the hover/drag tooltip and label readout.",
        },
        {
          prop: "trackClassName",
          type: "string",
          default: "—",
          description: "Class applied to the track element.",
        },
        {
          prop: "thumbClassName",
          type: "string",
          default: "—",
          description: "Class applied to each thumb element.",
        },
      ],
    },
  ],
};

export { sliderItem as slider };
