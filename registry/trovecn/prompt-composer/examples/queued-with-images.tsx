"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import {
  PromptComposer,
  type PromptComposerFile,
  type PromptComposerQueuedMessage,
} from "@/components/trovecn/ai-workbench/prompt-composer";
import { usePausableWait } from "@/components/site/demo-playback";

const FIRST_MESSAGE =
  "Compare last week's onboarding funnel to this week's and flag any step that regressed.";
const SECOND_MESSAGE = "Also break it down by device type.";

// A self-contained placeholder "screenshot" so the demo never depends on a network asset.
const CHART_PREVIEW =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
      '<rect width="120" height="120" fill="#e2e8f0"/>' +
      '<rect x="14" y="70" width="16" height="36" fill="#94a3b8"/>' +
      '<rect x="38" y="52" width="16" height="54" fill="#64748b"/>' +
      '<rect x="62" y="34" width="16" height="72" fill="#475569"/>' +
      '<rect x="86" y="58" width="16" height="48" fill="#64748b"/>' +
      "</svg>",
  );

const DEMO_FILES: readonly PromptComposerFile[] = [
  { id: "chart", name: "onboarding-funnel.png", kind: "image", previewUrl: CHART_PREVIEW },
  { id: "export", name: "cohort-export.csv", kind: "file" },
];

/** Types text into a setter, chunk by chunk, yielding to `wait` between chunks. */
async function typeText(
  text: string,
  setValue: (value: string) => void,
  wait: (ms: number) => Promise<void>,
  isCancelled: () => boolean,
  chunk = 2,
  tickMs = 22,
) {
  for (let index = 0; index <= text.length; index += chunk) {
    if (isCancelled()) return;
    setValue(text.slice(0, index));
    await wait(tickMs);
  }
  if (!isCancelled()) setValue(text);
}

/**
 * Scripts a full turn: draft a message, attach evidence, send it, then draft
 * and queue a follow-up while the first response is still running.
 */
export default function PromptComposerQueuedExample() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { wait } = usePausableWait();
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<readonly PromptComposerFile[]>([]);
  const [queue, setQueue] = useState<readonly PromptComposerQueuedMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setPrompt("");
      setFiles([]);
      setQueue([]);
      setIsRunning(false);
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;
    const clickSend = () => {
      containerRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    };

    const run = async () => {
      setPrompt("");
      setFiles([]);
      setQueue([]);
      setIsRunning(false);

      await wait(500);
      if (isCancelled()) return;

      await typeText(FIRST_MESSAGE, setPrompt, wait, isCancelled);
      if (isCancelled()) return;

      await wait(350);
      setFiles([DEMO_FILES[0]]);
      await wait(280);
      if (isCancelled()) return;
      setFiles(DEMO_FILES);

      await wait(600);
      if (isCancelled()) return;
      clickSend();

      await wait(900);
      if (isCancelled()) return;

      await typeText(SECOND_MESSAGE, setPrompt, wait, isCancelled);
      if (isCancelled()) return;

      await wait(500);
      if (isCancelled()) return;
      clickSend();

      await wait(2400);
      if (isCancelled()) return;
      setIsRunning(false);

      await wait(700);
      if (isCancelled()) return;
      // SECOND_MESSAGE is the only item ever queued in this script, so it's
      // simpler and StrictMode-safe to clear the queue directly here rather
      // than read it back out of a setQueue updater (that updater runs
      // twice in dev to check purity — a setIsRunning side effect nested
      // inside it would double-fire).
      setQueue([]);
      setIsRunning(true);

      await wait(2400);
      if (isCancelled()) return;
      setIsRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [reduceMotion, wait]);

  return (
    <div ref={containerRef} className="flex min-h-64 w-full max-w-2xl items-center">
      <PromptComposer
        placeholder="Ask anything…"
        value={prompt}
        onValueChange={setPrompt}
        files={files}
        onFilesChange={setFiles}
        queue={queue}
        onQueueChange={setQueue}
        isRunning={isRunning}
        onSubmit={() => {
          setIsRunning(true);
          setFiles([]);
        }}
        onStop={() => setIsRunning(false)}
      />
    </div>
  );
}
