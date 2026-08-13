import type { RegistryItem } from "@/lib/registry-types";

import ConversationDefaultExample from "./examples/default";

export const conversation: RegistryItem = {
  slug: "conversation",
  title: "Conversation",
  description:
    "A quiet conversation surface with authored hierarchy and contextual message actions.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  file: "src/components/trovecn/ai-workbench/conversation.tsx",
  examples: [
    {
      title: "Conversation flow",
      description:
        "Plain responses, a compact reply bubble, and actions that stay out of the reading flow.",
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
          description: "Controlled conversation rows with stable IDs.",
        },
        {
          prop: "onCopy",
          type: "(message: ConversationMessage) => void",
          default: "—",
          description: "Runs after automatic string copying, or enables copying for rich content.",
        },
        {
          prop: "onEdit",
          type: "(message: ConversationMessage) => void",
          default: "—",
          description: "Adds an edit action to user messages.",
        },
        {
          prop: "onRegenerate",
          type: "(message: ConversationMessage) => void",
          default: "—",
          description: "Adds a regenerate action to responses.",
        },
        {
          prop: "emptyState",
          type: "ReactNode",
          default: "—",
          description: "Optional content when no messages exist.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the conversation root.",
        },
      ],
    },
    {
      component: "ConversationMessage",
      props: [
        {
          prop: "role",
          type: '"user" | "assistant"',
          default: "—",
          description: "Controls the authored layout and available actions.",
        },
        {
          prop: "content",
          type: "ReactNode",
          default: "—",
          description: "Consumer-rendered message content.",
        },
        {
          prop: "timestamp",
          type: "ReactNode",
          default: "—",
          description: "Optional day/time metadata shown only for user messages.",
        },
      ],
    },
  ],
};
