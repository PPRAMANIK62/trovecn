"use client";

import {
  AgentActivity,
  type AgentActivityEntry,
} from "@/components/trovecn/ai-workbench/agent-activity";

const entries: AgentActivityEntry[] = [
  {
    id: "search",
    icon: "search",
    label: "Searched implementation references",
    status: "complete",
    sources: ["motion.dev", "developer.mozilla.org", "w3.org"],
  },
  {
    id: "read",
    icon: "tool",
    label: "Read agent-activity.tsx",
    status: "complete",
    description: (
      <code className="font-mono text-caption">
        src/components/trovecn/ai-workbench/agent-activity.tsx
      </code>
    ),
    details: {
      summary: "Reviewed 3 related files",
      items: ["agent-activity.tsx", "springs.ts", "design-system.md"],
    },
  },
  {
    id: "inspect",
    icon: "tool",
    label: "Checked the local component surface",
    status: "complete",
    description: <code className="font-mono text-caption">rg "AgentActivity" src</code>,
  },
  {
    id: "reason",
    icon: "thinking",
    label: "Formed an implementation approach",
    status: "complete",
    description:
      "Keep the active run legible, reveal supporting evidence in place, and preserve reduced-motion behavior.",
  },
  {
    id: "write",
    icon: "tool",
    label: "Wrote the activity refinements",
    status: "complete",
    description: (
      <code className="font-mono text-caption">
        agent-activity.tsx&nbsp;&nbsp;<span className="text-success">+29</span>{" "}
        <span className="text-destructive">-10</span>
      </code>
    ),
  },
  {
    id: "verify",
    icon: "tool",
    label: "Verified the component contract",
    status: "complete",
    description: <code className="font-mono text-caption">bun run lint</code>,
  },
  { id: "done", icon: "thinking", label: "Ready to respond", status: "complete" },
];

export default function AgentActivityBasicExample() {
  return <AgentActivity entries={entries} title="Thinking" />;
}
