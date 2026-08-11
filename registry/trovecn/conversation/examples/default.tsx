"use client";

import { useState } from "react";

import {
  Conversation,
  type ConversationMessage,
} from "@/components/trovecn/ai-workbench/conversation";

const branches = [
  "Start with the working constraint: preserve the text column as the stable anchor. Let the agent response be mostly unboxed, so the result reads like considered work rather than a chat bubble.",
  "Begin with the durable state: a response remains readable while it streams, stops, or fails. Controls arrive after the answer instead of framing every line of it.",
];

export default function ConversationDefaultExample() {
  const [branchIndex, setBranchIndex] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string>();

  const messages: ConversationMessage[] = [
    {
      id: "prompt",
      role: "user",
      content: "How should an AI workbench conversation feel different from a generic chat app?",
    },
    {
      id: "answer",
      role: "assistant",
      label: "Design partner",
      status: "complete",
      content: <p>{branches[branchIndex]}</p>,
      branch: { index: branchIndex, count: branches.length },
      sources: [{ id: "principles", label: "Design principles" }],
    },
    {
      id: "streaming",
      role: "assistant",
      label: "Design partner",
      status: "streaming",
      content: (
        <p>
          Then give the work a visible next edge: status is calm, actions are close to the answer,
          and the composer remains the clear place to continue.
        </p>
      ),
    },
    {
      id: "partial",
      role: "assistant",
      label: "Design partner",
      status: "stopped",
      content: (
        <div className="space-y-3">
          <p>For implementation, keep content boundaries explicit:</p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-3 font-mono text-caption leading-5 text-foreground">
            <code>{`<Conversation messages={messages} onRetry={retry} />`}</code>
          </pre>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-2xl py-3">
      <Conversation
        messages={messages}
        copiedMessageId={copiedMessageId}
        onCopy={() => {
          setCopiedMessageId("answer");
          window.setTimeout(() => setCopiedMessageId(undefined), 1_600);
        }}
        onBranchChange={(_, index) => setBranchIndex(index)}
        onSourceSelect={() => undefined}
        onRetry={() => undefined}
      />
    </div>
  );
}
