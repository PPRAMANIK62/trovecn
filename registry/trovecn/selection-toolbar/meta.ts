import type { RegistryItem } from "@/lib/registry-types";

import SelectionToolbarBasicExample from "./examples/basic";
import SelectionToolbarCommentExample from "./examples/comment";
import SelectionToolbarWrappedExample from "./examples/wrapped";

export const selectionToolbar: RegistryItem = {
  slug: "selection-toolbar",
  title: "Selection Toolbar",
  description:
    "Select text and the toolbar arrives at the line your drag ended on, not centred over the paragraph, and flips below that line when the line above is selected too.",
  category: "Components",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "button", "springs"],
  file: "src/components/trovecn/inputs/selection-toolbar.tsx",
  examples: [
    {
      title: "Basic",
      description:
        "Select a few words and the toolbar fades in four pixels off the line the drag ended on, then formats in place. That fade is the only motion here. You see this toolbar on every selection, and at that frequency motion has to stay out of the way.",
      file: "registry/trovecn/selection-toolbar/examples/basic.tsx",
      Demo: SelectionToolbarBasicExample,
    },
    {
      title: "Across a wrap",
      description:
        "A selection spanning two lines has one client rect per line, and a bounding box as wide as the column. Anchoring to that box would centre the toolbar over the middle of the block. It anchors to the line holding the end of the selection instead, and flips below that line when the line above is selected too.",
      file: "registry/trovecn/selection-toolbar/examples/wrapped.tsx",
      Demo: SelectionToolbarWrappedExample,
    },
    {
      title: "Custom actions",
      description:
        "A comment composer wants fewer controls than a document editor. Look at what `run` receives. The range is live on the document and its editing host is focused, so `execCommand` works with no further setup. `text` is the selection itself, which is what the line underneath reports.",
      file: "registry/trovecn/selection-toolbar/examples/comment.tsx",
      Demo: SelectionToolbarCommentExample,
    },
  ],
  api: [
    {
      component: "SelectionToolbar",
      props: [
        {
          prop: "children",
          type: "ReactNode",
          description:
            "The editable region to watch. The component owns a wrapper and renders it inside, then ignores any selection whose common ancestor falls outside that wrapper, so several toolbars can sit on one page without fighting. Works against a `contenteditable` or any editor that puts a real DOM Range on the document.",
        },
        {
          prop: "actions",
          type: "SelectionAction[]",
          default: "richTextActions",
          description:
            "Controls shown in the toolbar, left to right. The default set is bold, italic, and strikethrough, formatting a bare `contenteditable` through `document.execCommand`. That API is deprecated and still the only thing that does the job without an editor framework. Pass your own and the component never calls it. Memoise the array, because it feeds the component's selection listeners and a fresh one each render resubscribes them.",
        },
        {
          prop: "className",
          type: "string",
          description:
            "Extends the wrapper around `children`. The toolbar sits in a portal and ignores it.",
        },
      ],
    },
    {
      component: "SelectionAction",
      props: [
        {
          prop: "id",
          type: "string",
          description: "Stable across renders. Used for the React key and for pressed state.",
        },
        {
          prop: "label",
          type: "string",
          description: "Accessible name of the control. The toolbar shows icons only.",
        },
        {
          prop: "icon",
          type: "ReactNode",
          description: "Goes into a 28px control. Size it yourself; the examples use 14px.",
        },
        {
          prop: "run",
          type: "(context: SelectionContext) => void",
          description:
            "Called with the range live on the document and its editing host focused, so `execCommand` and editor commands that read the selection both work with no further setup.",
        },
        {
          prop: "isActive",
          type: "(context: SelectionContext) => boolean",
          description:
            "Sets `aria-pressed` and fills the control. The component reads it while the selection is still live, and again after every action, never after focus has moved.",
        },
      ],
    },
  ],
};
