import type { RegistryItem } from "@/lib/registry-types";

import PlanChecklistBasicExample from "./examples/basic";
import PlanChecklistEditableExample from "./examples/editable";
import PlanChecklistReplanningExample from "./examples/replanning";

export const planChecklist: RegistryItem = {
  slug: "plan-checklist",
  title: "Plan Checklist",
  description:
    "The agent's stated intentions before and while it acts — pending, in-progress, and done steps, live-editable and reorderable while they're still ahead.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  file: "src/components/trovecn/ai-workbench/plan-checklist.tsx",
  examples: [
    {
      title: "Basic",
      description:
        "A plan advances step by step — done, in-progress, and pending sit side by side as the run continues.",
      file: "registry/trovecn/plan-checklist/examples/basic.tsx",
      Demo: PlanChecklistBasicExample,
    },
    {
      title: "Editable & reorderable",
      description:
        "Not-yet-started steps can be renamed in place and moved with Move up/down — done and in-progress steps can't.",
      file: "registry/trovecn/plan-checklist/examples/editable.tsx",
      Demo: PlanChecklistEditableExample,
    },
    {
      title: "Replanning mid-run",
      description:
        "The agent discovers a blocking cause and inserts a new step ahead of the queued work, live.",
      file: "registry/trovecn/plan-checklist/examples/replanning.tsx",
      Demo: PlanChecklistReplanningExample,
    },
  ],
  api: [
    {
      component: "PlanChecklist",
      props: [
        {
          prop: "items",
          type: 'readonly { id: string; label: string; status: "pending" | "in-progress" | "done"; detail?: ReactNode }[]',
          default: "—",
          description:
            "Caller-owned source of truth, in the order the plan will run. label is plain text — the value an inline rename edits.",
        },
        {
          prop: "title",
          type: "ReactNode",
          default: '"Plan"',
          description: "Heading above the step list, paired with a computed done/total count.",
        },
        {
          prop: "onRelabel",
          type: "(id: string, label: string) => void",
          default: "—",
          description: 'Enables inline rename on "pending" items only. Omit to render fixed text.',
        },
        {
          prop: "onReorder",
          type: "(orderedIds: string[]) => void",
          default: "—",
          description:
            'Enables Move up/down on "pending" items only, called with the full reordered id list. Omit to render a fixed order.',
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the card root.",
        },
      ],
    },
  ],
};
