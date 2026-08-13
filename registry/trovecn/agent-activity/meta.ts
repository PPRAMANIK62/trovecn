import type { RegistryItem } from "@/lib/registry-types";

import AgentActivityAssembledExample from "./examples/assembled";
import AgentActivityBasicExample from "./examples/basic";
import AgentActivityStreamingExample from "./examples/streaming";
import AgentActivityStreamingTextExample from "./examples/streaming-text";
import AgentActivityWithImagesExample from "./examples/with-images";

export const agentActivity: RegistryItem = {
  slug: "agent-activity",
  title: "Agent Activity",
  description:
    "A collapsible agent-run timeline with streaming steps, sources, details, and inline visual artifacts.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/trovecn/ai-workbench/agent-activity.tsx",
  examples: [
    {
      title: "Basic",
      description:
        "Completed steps, source chips, and an expandable detail group in one quiet run.",
      file: "registry/trovecn/agent-activity/examples/basic.tsx",
      Demo: AgentActivityBasicExample,
    },
    {
      title: "Streaming",
      description: "Steps appear one at a time; the active one holds the run’s live state.",
      file: "registry/trovecn/agent-activity/examples/streaming.tsx",
      Demo: AgentActivityStreamingExample,
    },
    {
      title: "Streaming text",
      description:
        "A thinking step grows character by character without changing the timeline’s anchor.",
      file: "registry/trovecn/agent-activity/examples/streaming-text.tsx",
      Demo: AgentActivityStreamingTextExample,
    },
    {
      title: "With images",
      description:
        "A visual finding arrives inline with its caption, then feeds into the next action.",
      file: "registry/trovecn/agent-activity/examples/with-images.tsx",
      Demo: AgentActivityWithImagesExample,
    },
    {
      title: "Assembled run",
      description:
        "A complete agent flow that combines search, inspection, tool activity, reasoning, and completion.",
      file: "registry/trovecn/agent-activity/examples/assembled.tsx",
      Demo: AgentActivityAssembledExample,
    },
  ],
  api: [
    {
      component: "AgentActivity",
      props: [
        {
          prop: "entries",
          type: "readonly AgentActivityEntry[]",
          default: "—",
          description:
            "Timeline steps in display order; pending entries are hidden until their state changes.",
        },
        {
          prop: "title",
          type: "ReactNode",
          default: '"Thinking"',
          description: "Stable, interactive label for the complete agent run.",
        },
        {
          prop: "defaultOpen / open / onOpenChange",
          type: "boolean / boolean / (open: boolean) => void",
          default: "true / — / —",
          description: "Uncontrolled or controlled state for the run disclosure.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the activity log root.",
        },
      ],
    },
    {
      component: "AgentActivityEntry",
      props: [
        {
          prop: "status",
          type: '"pending" | "active" | "complete"',
          default: "—",
          description: "Pending steps are hidden; active steps carry the live shimmer state.",
        },
        {
          prop: "label / activeLabel / description / isStreamingText",
          type: "ReactNode / ReactNode / ReactNode / boolean",
          default: "—",
          description:
            "Completed label, optional in-progress label, supporting content, and whether a description itself token-streams.",
        },
        {
          prop: "sources / details / image",
          type: "ReactNode[] / AgentActivityDetails / AgentActivityImage",
          default: "—",
          description:
            "Optional evidence, an expandable detail list, or an inline visual artifact.",
        },
      ],
    },
  ],
};
