"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  AgentActivity,
  type AgentActivityEntry,
  type AgentActivityStatus,
} from "@/components/trovecn/ai-workbench/agent-activity";
import { spring } from "@/lib/springs";

import { useDemoSequence } from "./use-demo-sequence";
import { StreamingDescription } from "./streaming-description";

const STEP_COUNT = 7;
// Reference reading and state shaping hold longer than tool execution and completion.
const STEP_TIMINGS = [
  { hold: 2100, reveals: [420] },
  { hold: 2550, reveals: [360, 780] },
  { hold: 1800, reveals: [320] },
  { hold: 3200, reveals: [460] },
  { hold: 3400, reveals: [280, 580] },
  { hold: 2450, reveals: [320] },
  { hold: 900 },
] as const;

function statusFor(index: number, visible: number): AgentActivityStatus {
  if (visible >= STEP_COUNT + 1) return "complete";
  if (index < visible - 1) return "complete";
  return index === visible - 1 ? "active" : "pending";
}

function useRollingCount(target: number, active: boolean) {
  const [value, setValue] = useState(active ? 1 : target);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;
    const startedAt = performance.now();

    const tick = () => {
      if (cancelled) return;

      const progress = Math.min((performance.now() - startedAt) / 2_400, 1);
      const nextValue = Math.max(1, Math.round(target * progress));
      setValue(nextValue);

      if (progress < 1) timer = window.setTimeout(tick, 400);
    };

    timer = window.setTimeout(tick, 400);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [active, target]);

  return value;
}

function RollingDiffValue({
  target,
  direction,
  active,
}: {
  target: number;
  direction: "up" | "down";
  active: boolean;
}) {
  const value = useRollingCount(target, active);
  const sign = direction === "up" ? "+" : "-";
  const from = direction === "up" ? "translateY(0.5em)" : "translateY(-0.5em)";
  const exit = direction === "up" ? "translateY(-0.5em)" : "translateY(0.5em)";
  const counterTransition = { ...spring.moderate.enter, bounce: 0 };

  return (
    <span
      aria-label={`${sign}${target}`}
      className="relative inline-grid h-[1.55em] min-w-[3ch] overflow-hidden align-[0.05em] leading-[1.55em] tabular-nums"
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, transform: from }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          exit={{ opacity: 0, transform: exit }}
          transition={counterTransition}
          className="col-start-1 row-start-1 whitespace-nowrap leading-[1.55em]"
          aria-hidden="true"
        >
          {sign}
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function DiffSummary({ active }: { active: boolean }) {
  return (
    <code className="font-mono text-caption">
      agent-activity.tsx&nbsp;&nbsp;
      <span className="text-success">
        <RollingDiffValue target={29} direction="up" active={active} />
      </span>{" "}
      <span className="text-destructive">
        <RollingDiffValue target={10} direction="down" active={active} />
      </span>
    </code>
  );
}

export default function AgentActivityAssembledExample() {
  const reduceMotion = useReducedMotion();
  const { visible, revealLevels } = useDemoSequence(STEP_TIMINGS, reduceMotion);
  const writeStatus = statusFor(4, visible);

  const entries: AgentActivityEntry[] = [
    {
      id: "search",
      icon: "search",
      label: "Searched agent timeline patterns",
      activeLabel: "Searching agent timeline patterns",
      status: statusFor(0, visible),
      sources: revealLevels[0] >= 1 ? ["motion.dev", "w3.org", "github.com"] : undefined,
    },
    {
      id: "inspect",
      icon: "tool",
      label: "Read agent-activity.tsx",
      activeLabel: "Reading agent-activity.tsx",
      status: statusFor(1, visible),
      description:
        revealLevels[1] >= 1 ? (
          <code className="font-mono text-caption">
            src/components/trovecn/ai-workbench/agent-activity.tsx
          </code>
        ) : undefined,
      details:
        revealLevels[1] >= 2
          ? {
              summary: "Reviewed 3 related files",
              items: ["agent-activity.tsx", "springs.ts", "design-system.md"],
            }
          : undefined,
    },
    {
      id: "tool",
      icon: "tool",
      label: "Prepared the execution surface",
      activeLabel: "Preparing the execution surface",
      status: statusFor(2, visible),
      description:
        revealLevels[2] >= 1 ? (
          <code className="font-mono text-caption">rg "AgentActivity" src</code>
        ) : undefined,
    },
    {
      id: "reason",
      icon: "thinking",
      label: "Connected the run states",
      activeLabel: "Connecting the run states",
      status: statusFor(3, visible),
      isStreamingText: true,
      description:
        revealLevels[3] >= 1 ? (
          <StreamingDescription
            text="Keep evidence attached to the step that produced it, while standalone phases remain adjacent and uncluttered."
            active={statusFor(3, visible) === "active"}
            complete={statusFor(3, visible) === "complete"}
          />
        ) : undefined,
    },
    {
      id: "implement",
      icon: "tool",
      label: "Wrote the activity refinements",
      activeLabel: "Writing the activity refinements",
      status: writeStatus,
      description:
        revealLevels[4] >= 1 ? <DiffSummary active={writeStatus === "active"} /> : undefined,
    },
    {
      id: "verify",
      icon: "tool",
      label: "Checked the final component contract",
      activeLabel: "Checking the final component contract",
      status: statusFor(5, visible),
      description:
        revealLevels[5] >= 1 ? (
          <code className="font-mono text-caption">bun run lint</code>
        ) : undefined,
    },
    {
      id: "done",
      icon: "thinking",
      label: "Run complete",
      activeLabel: "Completing the run",
      status: statusFor(6, visible),
    },
  ];

  return <AgentActivity entries={entries} title="Research run" />;
}
