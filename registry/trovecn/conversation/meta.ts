import type { RegistryItem } from "@/lib/registry-types";

import ConversationDefaultExample from "./examples/default";

export const conversation: RegistryItem = {
  slug: "conversation",
  title: "Conversation",
  description:
    "An editorial AI transcript with stable streaming states and anchored response branches.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  file: "src/components/trovecn/ai-workbench/conversation.tsx",
  isNew: true,
  examples: [
    {
      title: "Working response",
      description:
        "A calm transcript that keeps a partial response, its branch, and its next action anchored in one reading flow.",
      file: "registry/trovecn/conversation/examples/default.tsx",
      Demo: ConversationDefaultExample,
    },
  ],
  api: [
    {
      component: "Conversation",
      props: [
        {
          prop: "messages",
          type: "readonly ConversationMessage[]",
          default: "—",
          description: "Controlled transcript rows with stable IDs.",
        },
        {
          prop: "copiedMessageId",
          type: "string",
          default: "—",
          description: "Temporarily switches one copy action to its confirmed state.",
        },
        {
          prop: "onCopy",
          type: "(message: ConversationMessage) => void",
          default: "—",
          description: "Enables the copy action for assistant responses.",
        },
        {
          prop: "onRetry",
          type: "(message: ConversationMessage) => void",
          default: "—",
          description: "Enables retry for stopped or failed responses.",
        },
        {
          prop: "onBranchChange",
          type: "(message: ConversationMessage, index: number) => void",
          default: "—",
          description: "Selects a response alternative without moving its message slot.",
        },
        {
          prop: "onSourceSelect",
          type: "(source: ConversationSource, message: ConversationMessage) => void",
          default: "—",
          description: "Handles sources without a direct href.",
        },
        {
          prop: "renderMessage",
          type: "(message: ConversationMessage) => ReactNode",
          default: "—",
          description: "Replaces an entire row for specialised rendering.",
        },
        {
          prop: "emptyState",
          type: "ReactNode",
          default: "—",
          description: "Optional content when no transcript rows exist.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the transcript root.",
        },
      ],
    },
    {
      component: "ConversationMessage",
      props: [
        {
          prop: "role / content / status",
          type: '"user" | "assistant" / ReactNode / ConversationMessageStatus',
          default: "— / — / complete",
          description: "The row’s author, rendered body, and lifecycle state.",
        },
        {
          prop: "branch",
          type: "{ index: number; count: number }",
          default: "—",
          description: "Optional active response alternative, kept in the same message position.",
        },
        {
          prop: "sources",
          type: "readonly ConversationSource[]",
          default: "—",
          description:
            "Optional source actions; href renders a link, otherwise onSourceSelect handles it.",
        },
      ],
    },
  ],
};
