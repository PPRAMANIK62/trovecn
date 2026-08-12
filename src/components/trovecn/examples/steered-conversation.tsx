"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import {
  AgentActivity,
  type AgentActivityEntry,
  type AgentActivityIcon,
  type AgentActivityStatus,
} from "@/components/trovecn/ai-workbench/agent-activity";
import {
  Conversation,
  type ConversationMessage,
} from "@/components/trovecn/ai-workbench/conversation";
import {
  PromptComposer,
  type PromptComposerFile,
  type PromptComposerQueuedMessage,
  type PromptComposerSubmitEvent,
} from "@/components/trovecn/ai-workbench/prompt-composer";
import { usePausableWait } from "@/components/site/demo-playback";

// The real hero screenshot this repo ships (public/agent-activity-landing-page.png) —
// the whole demo below is about revisiting it, not a stand-in mockup.
const LANDING_SCREENSHOT = "/agent-activity-landing-page.png";

const OPEN_FILE: PromptComposerFile = {
  id: "hero-shot",
  name: "hero.png",
  kind: "image",
  previewUrl: LANDING_SCREENSHOT,
};

const OPEN_TEXT = "Here's the hero as it ships — feels like it's missing a beat.";
const ACK_REPLY =
  "Yeah — headline, subhead, and the CTA row all land on the same 80ms stagger right now, all spring.slow. Want me to look at retiming it?";
const FIRST_PROMPT = "Yeah — make the CTA row land as a clear second beat, not racing the subhead.";
const TURN1_REPLY =
  "Split the CTA row into its own group, delayed to 0.18s — it now lands a clear beat after the subhead instead of racing it. hero.tsx is updated.";
const STEER_PROMPT =
  "Actually, keep them in one group — just slow the whole thing down. spring.slow feels rushed for a first paint.";
const FINAL_REPLY =
  "Simpler — kept everything on one stagger and just slowed it down: duration 0.42, bounce down to 0.14. Reads calmer without splitting the timing into two groups. hero.tsx is updated; want me to recut this screenshot to match?";

// Same 64px square, object-cover tile PromptComposer's own attachment
// preview uses (its `filePreviewSize` default) — a sent attachment should
// read as the same object the composer showed while drafting, not grow
// into a full, uncropped image once it lands in the transcript. Stays in
// the bubble's own flow (top-right, above the text) rather than floating
// outside it — the attachment and the caption are one message, not two
// separately positioned pieces.
function messageWithImage(text: string, file?: PromptComposerFile) {
  if (!file?.previewUrl) return text;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
          {/* oxlint-disable-next-line no-img-element */}
          <img src={file.previewUrl} alt={file.name} className="size-full object-cover" />
        </div>
      </div>
      <span>{text}</span>
    </div>
  );
}

function DiffLines({ removed, added }: { removed: string; added: string }) {
  return (
    <code className="block font-mono text-caption leading-relaxed">
      <span className="text-destructive">- {removed}</span>
      <br />
      <span className="text-success">+ {added}</span>
    </code>
  );
}

// Two short runs, not one — a follow-up sent while the first is still working
// waits for it to finish, then dispatches as its own turn, so the activity
// trail is always sandwiched between the message that triggered it and the
// reply that closes it out. Nothing ever gets spliced mid-run.
const TURN1_STEPS = [
  { id: "read", icon: "tool" as const, label: "Read hero.tsx", activeLabel: "Reading hero.tsx" },
  {
    id: "compare",
    icon: "reasoning" as const,
    label: "Compared the current entrance beats",
    activeLabel: "Comparing the current entrance beats",
  },
  {
    id: "apply",
    icon: "tool" as const,
    label: "Applied a delayed CTA beat",
    activeLabel: "Applying a delayed CTA beat",
  },
  {
    id: "done-1",
    icon: "thinking" as const,
    label: "Ready to summarize",
    activeLabel: "Wrapping up",
  },
];

const TURN2_STEPS = [
  {
    id: "revise",
    icon: "tool" as const,
    label: "Reworked the CTA delay into the shared stagger",
    activeLabel: "Reworking the timing",
  },
  {
    id: "done-2",
    icon: "thinking" as const,
    label: "Ready to summarize",
    activeLabel: "Wrapping up",
  },
];

function statusFor(index: number, visible: number): AgentActivityStatus {
  if (index < visible - 1) return "complete";
  if (index === visible - 1) return "active";
  return "pending";
}

interface RetimingStep {
  id: string;
  icon: AgentActivityIcon;
  label: string;
  activeLabel: string;
}

// Mirrors the wall-clock time each trail stays visible in run() below (the
// steer-prompt retype included, since turn 1 is still working while it's
// typed). Kept as fixed sums rather than measured with Date.now() so the
// "Worked for…" label stays correct even if the demo is paused mid-run —
// usePausableWait already keeps the trail itself immune to real elapsed time,
// and the label should match that, not wall clock.
const TURN1_ACTIVITY_MS = 1500 + 2000 + 1232 + 450 + 600 + 1800 + 700 + 500;
const TURN2_ACTIVITY_MS = 1800 + 700 + 500;

function formatWorkedFor(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  if (totalSeconds < 60) return `Worked for ${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `Worked for ${minutes}m ${seconds}s`;
}

function buildEntries(steps: readonly RetimingStep[], visible: number): AgentActivityEntry[] {
  return steps.map((step, index) => {
    const status = statusFor(index, visible);
    const active = status !== "pending";
    let description: AgentActivityEntry["description"];
    let image: AgentActivityEntry["image"];

    if (active && step.id === "read") {
      description = <code className="font-mono text-caption">src/components/site/hero.tsx</code>;
    }
    if (active && step.id === "compare") {
      description =
        "staggerChildren: 0.08, delayChildren: 0.05 — headline, subhead, and CTA all on the same wave.";
      image = {
        src: LANDING_SCREENSHOT,
        alt: "trove/cn landing page hero",
        caption: "Same wave, three elements.",
      };
    }
    if (active && step.id === "apply") {
      description = (
        <DiffLines removed="delayChildren: 0.05" added="CTA row: own group, delayChildren: 0.18" />
      );
    }
    if (active && step.id === "revise") {
      description = (
        <DiffLines
          removed="CTA row: own group, delayChildren: 0.18"
          added="one group; duration: 0.42, bounce: 0.14"
        />
      );
    }

    return {
      id: step.id,
      icon: step.icon,
      label: step.label,
      activeLabel: step.activeLabel,
      status,
      description,
      image,
    };
  });
}

/**
 * The historical record of a finished turn: the trail folds into the
 * transcript collapsed under a "Worked for…" summary, same as the live
 * label a moment ago just swaps meaning from action to duration — so it
 * stays inspectable (Codex's post-run disclosure) instead of vanishing
 * the instant the reply lands.
 */
function assistantReplyWithActivity(
  text: string,
  entries: AgentActivityEntry[],
  durationMs: number,
) {
  return (
    <div className="flex flex-col gap-3">
      <AgentActivity entries={entries} title={formatWorkedFor(durationMs)} defaultOpen={false} />
      <span>{text}</span>
    </div>
  );
}

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
 * The whole exchange plays live through the real composer — opening
 * attachment included — rather than starting from a pre-seeded transcript.
 * Conversation holds the turn history, AgentActivity renders the
 * in-progress step trail for whichever turn is running, and a message sent
 * while a run is active queues instead of interrupting it — then dispatches
 * as its own turn once that run finishes, arriving after the trail that was
 * already showing rather than jumping above it.
 */
export default function SteeredConversationExample() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { wait } = usePausableWait();

  const [messages, setMessages] = useState<readonly ConversationMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<readonly PromptComposerFile[]>([]);
  const [queue, setQueue] = useState<readonly PromptComposerQueuedMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [visible, setVisible] = useState(0);
  const [showActivity, setShowActivity] = useState(false);
  // Stays pinned to bottom only while the scripted sequence is still
  // producing content. Once it settles, a viewer expanding a past turn's
  // collapsed "Worked for…" history is a manual read, not new output — it
  // should push later content down in place, not yank the scroll position
  // back to the bottom out from under them.
  const sequenceDoneRef = useRef(false);

  // Tracks content size directly (not React state) so it stays pinned to the
  // bottom through step-expand animations, image loads, and text streaming —
  // any of which grow the content well after the state change that caused it.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || !contentEl) return;

    const scrollToBottom = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };

    scrollToBottom();
    const observer = new ResizeObserver(() => {
      if (sequenceDoneRef.current) return;
      scrollToBottom();
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, []);

  function handleSubmit({ prompt: value }: PromptComposerSubmitEvent) {
    const attached = files[0];
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: messageWithImage(value, attached) },
    ]);
    setFiles([]);
    setIsRunning(true);
  }

  useEffect(() => {
    if (reduceMotion) {
      setMessages([
        { id: "settled-open", role: "user", content: messageWithImage(OPEN_TEXT, OPEN_FILE) },
        { id: "settled-ack", role: "assistant", content: ACK_REPLY },
        { id: "settled-turn1", role: "user", content: FIRST_PROMPT },
        {
          id: "settled-turn1-reply",
          role: "assistant",
          content: assistantReplyWithActivity(
            TURN1_REPLY,
            buildEntries(TURN1_STEPS, TURN1_STEPS.length + 1),
            TURN1_ACTIVITY_MS,
          ),
        },
        { id: "settled-steer", role: "user", content: STEER_PROMPT },
        {
          id: "settled-final",
          role: "assistant",
          content: assistantReplyWithActivity(
            FINAL_REPLY,
            buildEntries(TURN2_STEPS, TURN2_STEPS.length + 1),
            TURN2_ACTIVITY_MS,
          ),
        },
      ]);
      setShowActivity(false);
      setIsRunning(false);
      setPrompt("");
      setFiles([]);
      setQueue([]);
      sequenceDoneRef.current = true;
      return;
    }

    sequenceDoneRef.current = false;
    let cancelled = false;
    const isCancelled = () => cancelled;
    const clickSend = () => {
      containerRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    };
    const pushAssistant = (content: ConversationMessage["content"]) =>
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content },
      ]);

    const run = async () => {
      setMessages([]);
      setPrompt("");
      setFiles([]);
      setQueue([]);
      setIsRunning(false);
      setShowActivity(false);
      setTurn(1);
      setVisible(0);

      await wait(600);
      if (isCancelled()) return;

      // Opening turn — typed and attached live, then sent through the composer.
      await typeText(OPEN_TEXT, setPrompt, wait, isCancelled);
      if (isCancelled()) return;

      await wait(350);
      if (isCancelled()) return;
      setFiles([OPEN_FILE]);

      await wait(550);
      if (isCancelled()) return;
      clickSend();

      await wait(900);
      if (isCancelled()) return;
      setIsRunning(false);
      pushAssistant(ACK_REPLY);

      await wait(900);
      if (isCancelled()) return;

      // Turn 1 — the retiming work, with a real step trail.
      await typeText(FIRST_PROMPT, setPrompt, wait, isCancelled);
      if (isCancelled()) return;

      await wait(450);
      if (isCancelled()) return;
      clickSend();

      await wait(150);
      if (isCancelled()) return;
      setTurn(1);
      setShowActivity(true);
      setVisible(1);

      await wait(1500);
      if (isCancelled()) return;
      setVisible(2);

      await wait(2000);
      if (isCancelled()) return;

      // The steering moment: draft and send a follow-up while turn 1 is
      // still running — the composer queues it instead of interrupting.
      await typeText(STEER_PROMPT, setPrompt, wait, isCancelled);
      if (isCancelled()) return;

      await wait(450);
      if (isCancelled()) return;
      clickSend();

      await wait(600);
      if (isCancelled()) return;
      setVisible(3);

      await wait(1800);
      if (isCancelled()) return;
      setVisible(4);

      await wait(700);
      if (isCancelled()) return;
      setVisible(5);

      await wait(500);
      if (isCancelled()) return;
      setIsRunning(false);
      setShowActivity(false);
      pushAssistant(
        assistantReplyWithActivity(
          TURN1_REPLY,
          buildEntries(TURN1_STEPS, TURN1_STEPS.length + 1),
          TURN1_ACTIVITY_MS,
        ),
      );

      await wait(700);
      if (isCancelled()) return;

      // Turn 2 — the queued follow-up auto-dispatches now that turn 1 is
      // idle, arriving after the reply that just closed turn 1 rather than
      // above the trail it interrupted.
      setQueue([]);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "user", content: STEER_PROMPT },
      ]);
      setIsRunning(true);

      await wait(150);
      if (isCancelled()) return;
      setTurn(2);
      setShowActivity(true);
      setVisible(1);

      await wait(1800);
      if (isCancelled()) return;
      setVisible(2);

      await wait(700);
      if (isCancelled()) return;
      setVisible(3);

      await wait(500);
      if (isCancelled()) return;
      setIsRunning(false);
      setShowActivity(false);
      pushAssistant(
        assistantReplyWithActivity(
          FINAL_REPLY,
          buildEntries(TURN2_STEPS, TURN2_STEPS.length + 1),
          TURN2_ACTIVITY_MS,
        ),
      );
      sequenceDoneRef.current = true;
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [reduceMotion, wait]);

  const activeSteps = turn === 1 ? TURN1_STEPS : TURN2_STEPS;
  const entries = buildEntries(activeSteps, visible);

  return (
    <div
      ref={containerRef}
      className="flex h-[620px] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-background"
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div ref={contentRef}>
          <Conversation messages={messages} />
          {showActivity ? (
            <div className="mt-4">
              <AgentActivity entries={entries} title="Retiming the entrance" />
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-3">
        <PromptComposer
          placeholder="Ask anything…"
          value={prompt}
          onValueChange={setPrompt}
          files={files}
          onFilesChange={setFiles}
          queue={queue}
          onQueueChange={setQueue}
          isRunning={isRunning}
          onSubmit={handleSubmit}
          onStop={() => setIsRunning(false)}
        />
      </div>
    </div>
  );
}
