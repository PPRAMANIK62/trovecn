"use client";

import { useState } from "react";

import { PromptComposer } from "@/components/trovecn/ai-workbench/prompt-composer";

export default function PromptComposerDefaultExample() {
  const [isRunning, setIsRunning] = useState(false);
  const [model, setModel] = useState("GPT-5.4");

  return (
    <div className="flex min-h-64 w-full max-w-2xl items-center">
      <PromptComposer
        placeholder="Ask anything…"
        maxLength={2_000}
        models={["GPT-5.4", "GPT-5.4 mini", "Claude Sonnet 4"]}
        model={model}
        onModelChange={setModel}
        attachmentOptions={[
          { id: "file", label: "Upload a file", description: "Document, code, or dataset." },
          {
            id: "image",
            label: "Add an image",
            description: "Visual reference material.",
            kind: "image",
          },
        ]}
        isRunning={isRunning}
        onSubmit={() => setIsRunning(true)}
        onStop={() => setIsRunning(false)}
      />
    </div>
  );
}
