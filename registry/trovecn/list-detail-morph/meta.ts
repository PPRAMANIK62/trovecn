import type { RegistryItem } from "@/lib/registry-types";

import ListDetailMorphBasicExample from "./examples/basic";
import ListDetailMorphControlledExample from "./examples/controlled";
import ListDetailMorphInboxExample from "./examples/inbox";

export const listDetailMorph: RegistryItem = {
  slug: "list-detail-morph",
  title: "List Detail Morph",
  description:
    "The row you press becomes the detail view. Leave before it lands and it turns around from where it is, rather than finishing the trip and playing the close from rest. Drag the open detail down and it follows your finger back into its row.",
  category: "Navigation",
  dependencies: ["motion", "lucide-react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/trovecn/navigation/list-detail-morph.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "Press a row and it grows into the detail. Press Back mid-flight and it reverses from its current position and velocity, which is the part View Transitions cannot do.",
      file: "registry/trovecn/list-detail-morph/examples/basic.tsx",
      Demo: ListDetailMorphBasicExample,
    },
    {
      title: "Scrolling list, scrolling detail",
      description:
        "The job it was built for. The list scrolls, so a row can be off screen by the time you return, and the detail scrolls, so most downward drags have to mean scroll rather than dismiss.",
      file: "registry/trovecn/list-detail-morph/examples/inbox.tsx",
      Demo: ListDetailMorphInboxExample,
    },
    {
      title: "Controlled",
      description:
        "`value` driven from outside, so a deep link, a shortcut, or the stepper below can open the detail. This one starts open, and the component holds no state of its own.",
      file: "registry/trovecn/list-detail-morph/examples/controlled.tsx",
      Demo: ListDetailMorphControlledExample,
    },
  ],
  api: [
    {
      component: "ListDetailMorph",
      props: [
        {
          prop: "value",
          type: "string | null",
          default: "—",
          description:
            "The open row, controlled. `null` closes the detail. Matches an `Item`'s `value`. Pass this and the component holds no state of its own, which is what lets something other than a press open the detail.",
        },
        {
          prop: "defaultValue",
          type: "string | null",
          default: "null",
          description: "Starting row for the uncontrolled case. Ignored once `value` is passed.",
        },
        {
          prop: "onValueChange",
          type: "(value: string | null) => void",
          default: "—",
          description:
            "Fires on press, on Escape, on `Close`, and when a drag commits. It fires when the close *starts*, not when the morph finishes, because the return animation is the component's business and the caller's state should not lag a frame behind the gesture.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "A `List` and a `Detail`. Order does not matter; the detail is positioned.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the root, which is the viewport both the list and the detail fill. Set a height here. The component floors itself at the list's last measured height so an open detail over an empty list cannot collapse, but that is a floor under you rather than a layout policy, and most callers should size it themselves.",
        },
      ],
    },
    {
      component: "ListDetailMorph.List",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description:
            "`Item` elements. The list never unmounts, which is why scroll position survives the round trip with nothing to save or restore.",
        },
        {
          prop: "label",
          type: "string",
          default: "—",
          description: "Accessible name for the list.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the list, which is its own scroll container. It declares itself scrollable to Motion's projection, without which a row below the fold morphs in from off box.",
        },
      ],
    },
    {
      component: "ListDetailMorph.Item",
      props: [
        {
          prop: "value",
          type: "string",
          default: "—",
          description:
            "Identity of this row, and what you pass to open it. Must be stable across renders: it is what pairs this row's shell with the detail's, so a changing value breaks the morph rather than merely re-rendering.",
        },
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description:
            "The row's content. It sits in a fixed-size child that carries its own projection, so it stays at its natural size while the shell around it grows. Without that a circular avatar renders as a 2.5:1 ellipse partway through the morph.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the row. The corner radius and the hairline are set by the component and should be left alone: the radius is an inline value because Motion only scale-corrects properties it tracks, and the hairline is an inset shadow because `border-width` is not in that table at all.",
        },
      ],
    },
    {
      component: "ListDetailMorph.Detail",
      props: [
        {
          prop: "children",
          type: "(value: string) => ReactNode",
          default: "—",
          description:
            "A render function receiving the open row's value. Only called while something is open, so it never has to handle `null`. Its body waits a beat behind the shell, since text arriving before its container has made room is the artefact the house recipes call out.",
        },
        {
          prop: "label",
          type: "string",
          default: "—",
          description:
            "Accessible name for the detail region. Worth setting: opening moves focus to the region rather than to a control inside it, so this is what a screen reader announces when the view changes. There is deliberately no live region on top of that.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the detail. It overlays the list and inherits the root's height, scrolling inside it.",
        },
      ],
    },
    {
      component: "ListDetailMorph.Handle",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description:
            "A grab area that starts the dismissal at any scroll position. Without it a long detail can only be dismissed from the very top, because the body's own scroll owns every other downward drag.",
        },
        {
          prop: "label",
          type: "string",
          default: "—",
          description:
            "Describes the gesture on hover. Not a button and not in the tab order: it has no click behaviour to expose, and `Close` already gives the keyboard a labelled route to the same outcome.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the handle. It is sticky and carries the card tone by default, and both are load-bearing rather than styling: everything you render sits inside the one scroll container, so a static handle scrolls out of reach and takes the only always-available dismissal with it.",
        },
      ],
    },
    {
      component: "ListDetailMorph.Close",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          default: "—",
          description: "The control's content. A real button, so Enter and Space work for free.",
        },
        {
          prop: "label",
          type: "string",
          default: "—",
          description: "Accessible name, for when the trigger is an icon.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description:
            "Extends the button. Closing returns focus to the row that opened the detail, so a keyboard user is never dropped at the top of the document.",
        },
      ],
    },
  ],
};
