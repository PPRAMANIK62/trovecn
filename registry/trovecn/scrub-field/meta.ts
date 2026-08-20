import type { RegistryItem } from "@/lib/registry-types";

import ScrubFieldBasicExample from "./examples/basic";
import ScrubFieldFormatsExample from "./examples/formats";
import ScrubFieldPropertyPanelExample from "./examples/property-panel";
import ScrubFieldVerticalExample from "./examples/vertical";

export const scrubField: RegistryItem = {
  slug: "scrub-field",
  title: "Scrub Field",
  description:
    "One control with two regions: drag the label to scrub the value under pointer lock, or click the number and type. The cursor never runs off the edge.",
  category: "Components",
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["utils"],
  file: "src/components/trovecn/inputs/scrub-field.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "Press the label and pull sideways. Hold Alt to scrub fine, Shift to scrub coarse, or click the field and type.",
      file: "registry/trovecn/scrub-field/examples/basic.tsx",
      Demo: ScrubFieldBasicExample,
    },
    {
      title: "Property panel",
      description:
        "The job it was built for. A stack of identical controls, where dragging the label beats typing for every value.",
      file: "registry/trovecn/scrub-field/examples/property-panel.tsx",
      Demo: ScrubFieldPropertyPanelExample,
    },
    {
      title: "Units and formatting",
      description:
        "Intl formatting handles percentages and currency; `suffix` covers units Intl has no style for. Lower sensitivity suits a 0–1 range.",
      file: "registry/trovecn/scrub-field/examples/formats.tsx",
      Demo: ScrubFieldFormatsExample,
    },
    {
      title: "Vertical scrub",
      description:
        "The same field on each axis. `direction=\"vertical\"` pulls up to increase, and the handle's cursor and arrow both turn to match — an arrow pointing across the axis you're dragging reads as a bug.",
      file: "registry/trovecn/scrub-field/examples/vertical.tsx",
      Demo: ScrubFieldVerticalExample,
    },
  ],
  api: [
    {
      component: "ScrubField",
      props: [
        {
          prop: "label",
          type: "ReactNode",
          default: "—",
          description:
            "The drag handle, and the input's label. Pressing it and moving sideways scrubs the value.",
        },
        {
          prop: "value / defaultValue",
          type: "number | null",
          default: "—",
          description: "Controlled and uncontrolled value. Pass `value` with `onValueChange`.",
        },
        {
          prop: "onValueChange",
          type: "(value: number | null, details) => void",
          default: "—",
          description:
            "Fires on every change. `details.reason` is `'scrub'` for drags, `'keyboard'` for arrows, `'input-change'` for typing.",
        },
        {
          prop: "onValueCommitted",
          type: "(value: number | null, details) => void",
          default: "—",
          description: "Fires once the pointer is released or the input is blurred.",
        },
        {
          prop: "min / max",
          type: "number",
          default: "—",
          description: "Bounds. Step-based interaction always clamps to them.",
        },
        {
          prop: "step",
          type: "number | 'any'",
          default: "1",
          description: "Amount each pixel threshold, arrow key, or stepper press moves the value.",
        },
        {
          prop: "smallStep / largeStep",
          type: "number",
          default: "0.1 / 10",
          description: "Step used while Alt (fine) or Shift (coarse) is held.",
        },
        {
          prop: "format",
          type: "Intl.NumberFormatOptions",
          default: "—",
          description: "Formats the displayed value. Use for percent, currency, and unit styles.",
        },
        {
          prop: "suffix",
          type: "string",
          default: "—",
          description:
            "Static unit rendered inside the field, for units Intl has no format for such as `px` or `ms`.",
        },
        {
          prop: "pixelSensitivity",
          type: "number",
          default: "2",
          description:
            "Pixels the pointer must travel before the value moves. Raise it for small ranges.",
        },
        {
          prop: "direction",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            'Axis the scrub follows. `"vertical"` pulls up to increase. The handle\'s cursor and arrow both turn to match.',
        },
        {
          prop: "snapOnStep",
          type: "boolean",
          default: "false",
          description: "Snap to the nearest multiple of `step` while scrubbing or stepping.",
        },
        {
          prop: "allowWheelScrub",
          type: "boolean",
          default: "false",
          description: "Let the mouse wheel change the value while the input is focused.",
        },
        {
          prop: "disabled / readOnly",
          type: "boolean",
          default: "false",
          description:
            "`disabled` blocks all interaction; `readOnly` keeps focus but blocks edits.",
        },
        {
          prop: "className / inputClassName",
          type: "string",
          default: "—",
          description:
            "`className` extends the bordered control itself, `inputClassName` the number input inside it.",
        },
      ],
    },
  ],
};
