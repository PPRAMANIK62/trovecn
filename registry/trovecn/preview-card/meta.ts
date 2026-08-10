import type { RegistryItem } from "@/lib/registry-types";

import PreviewCardLinkExample from "./examples/link";
import PreviewCardProfileExample from "./examples/profile";

export const previewCard: RegistryItem = {
  slug: "preview-card",
  title: "Preview Card",
  description:
    "A floating preview panel triggered on hover — link previews, profile cards, anything worth a longer look than a Tooltip's one-word label. Opens on a 700ms delay instead of Tooltip's 200ms, since richer content shouldn't commit on every incidental pass-over.",
  category: "Primitives",
  dependencies: ["motion", "@base-ui/react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/ui/preview-card.tsx",
  examples: [
    {
      title: "Link preview",
      description: "Hovering an inline link surfaces a site preview card.",
      file: "registry/trovecn/preview-card/examples/link.tsx",
      Demo: PreviewCardLinkExample,
    },
    {
      title: "Profile",
      description: "Hovering a username surfaces a profile card with an action.",
      file: "registry/trovecn/preview-card/examples/profile.tsx",
      Demo: PreviewCardProfileExample,
    },
  ],
  api: [
    {
      component: "PreviewCardTrigger",
      props: [
        {
          prop: "delay",
          type: "number",
          default: "700",
          description: "Hover delay before the preview card opens, in milliseconds.",
        },
        {
          prop: "closeDelay",
          type: "number",
          default: "300",
          description:
            "Delay before the preview card closes after the pointer leaves, in milliseconds.",
        },
      ],
    },
    {
      component: "PreviewCardContent",
      props: [
        {
          prop: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "Which side of the trigger to render on.",
        },
        {
          prop: "sideOffset",
          type: "number",
          default: "8",
          description: "Gap between the trigger and the preview card, in pixels.",
        },
        {
          prop: "align",
          type: '"start" | "center" | "end"',
          default: '"center"',
          description: "Alignment along the side.",
        },
        {
          prop: "alignOffset",
          type: "number",
          default: "0",
          description: "Offset along the alignment axis, in pixels.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "Preview card content.",
        },
      ],
    },
  ],
};
