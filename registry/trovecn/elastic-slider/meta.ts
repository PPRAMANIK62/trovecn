import type { RegistryItem } from "@/lib/registry-types";

import ElasticSliderBasicExample from "./examples/basic";
import ElasticSliderStackExample from "./examples/stack";
import ElasticSliderZoomExample from "./examples/zoom";

export const elasticSlider: RegistryItem = {
  slug: "elastic-slider",
  title: "Elastic Slider",
  description:
    "Grab it and the track thickens. Push past either end and the whole bar stretches, giving less the harder you pull, then snaps back when you let go.",
  category: "Components",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/trovecn/inputs/elastic-slider.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "The track carries its own state in one property: it answers a hovering mouse at 8px and a real grab at 10px. Drag past the end and hold — resistance builds from the first pixel, and the band never gives more than 28px however hard you pull.",
      file: "registry/trovecn/elastic-slider/examples/basic.tsx",
      Demo: ElasticSliderBasicExample,
    },
    {
      title: "Settings stack",
      description:
        "The job it was built for. Several bounded values in a column, where the thickening tells you which one you have hold of without a highlight or a label change.",
      file: "registry/trovecn/elastic-slider/examples/stack.tsx",
      Demo: ElasticSliderStackExample,
    },
    {
      title: "Fractional range",
      description:
        "A 0.5–2× zoom on a 0.01 step. `formatValue` owns the readout, so the track never has to care that the range isn't 0–100.",
      file: "registry/trovecn/elastic-slider/examples/zoom.tsx",
      Demo: ElasticSliderZoomExample,
    },
  ],
  api: [
    {
      component: "ElasticSlider",
      props: [
        {
          prop: "value / defaultValue",
          type: "number",
          default: "min",
          description:
            "Controlled and uncontrolled value. Single-thumb only — a rubber band with two ends to stretch reads as a bug, not a feature.",
        },
        {
          prop: "onValueChange",
          type: "(value: number) => void",
          default: "—",
          description: "Fires on every change, including continuously through a drag.",
        },
        {
          prop: "onValueCommitted",
          type: "(value: number) => void",
          default: "—",
          description:
            "Fires once the drag, track-press, or keyboard change is released. This is the one to persist on.",
        },
        { prop: "min", type: "number", default: "0", description: "Lower bound." },
        { prop: "max", type: "number", default: "100", description: "Upper bound." },
        {
          prop: "step",
          type: "number",
          default: "1",
          description: "Granularity the value snaps to, and the distance each arrow key moves.",
        },
        {
          prop: "label",
          type: "ReactNode",
          default: "—",
          description: "Visible label above the track, paired with a live value readout.",
        },
        {
          prop: "thumbLabel",
          type: "string",
          default: "—",
          description:
            "Accessible name for the thumb when there is no visible `label`. The thumb has no painted body, but it is still the focusable, keyboard-driven control.",
        },
        {
          prop: "formatValue",
          type: "(value: number) => string",
          default: "integers as-is, otherwise 1 decimal",
          description: "Formats the readout beside the label.",
        },
        {
          prop: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Blocks interaction. The track stays at its resting weight and never stretches.",
        },
        {
          prop: "className / trackClassName / indicatorClassName",
          type: "string",
          default: "—",
          description:
            "`className` extends the label-and-track column, `trackClassName` the control region, `indicatorClassName` the filled line — use it to recolour the fill without touching the groove.",
        },
      ],
    },
  ],
};
