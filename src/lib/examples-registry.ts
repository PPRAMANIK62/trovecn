import type { ComponentType } from "react";

import SteeredConversationExample from "@/components/trovecn/examples/steered-conversation";

export interface ExampleItem {
  slug: string;
  title: string;
  description: string;
  /** Repo-relative path to the demo's source, read verbatim onto its Code tab. */
  file: string;
  /** Registry component slugs this example composes, linked from its page. */
  composes: readonly string[];
  Demo: ComponentType;
}

/**
 * Composed, cross-component recipes — distinct from registry/trovecn/*
 * (single installable primitives). Hand-written and short-lived here; if
 * this list grows past a handful, give it its own category grouping the
 * way components-registry.ts groups by Category.
 */
export const examples: ExampleItem[] = [
  {
    slug: "steered-conversation",
    title: "Steered Conversation",
    description:
      "A live agent run that picks up a mid-response follow-up and visibly folds it into the same turn, instead of waiting for a separate reply.",
    file: "src/components/trovecn/examples/steered-conversation.tsx",
    composes: ["conversation", "agent-activity", "prompt-composer"],
    Demo: SteeredConversationExample,
  },
];

export function getExample(slug: string): ExampleItem | undefined {
  return examples.find((example) => example.slug === slug);
}
