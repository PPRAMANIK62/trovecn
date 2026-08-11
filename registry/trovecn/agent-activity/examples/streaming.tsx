"use client";

import { useReducedMotion } from "motion/react";

import {
  AgentActivity,
  type AgentActivityEntry,
  type AgentActivityStatus,
} from "@/components/trovecn/ai-workbench/agent-activity";

import { useDemoSequence } from "./use-demo-sequence";

const STEPS = [
  {
    id: "search",
    icon: "search",
    label: "Searched component patterns",
    activeLabel: "Searching component patterns",
  },
  {
    id: "compare",
    icon: "reasoning",
    label: "Compared accessible disclosure patterns",
    activeLabel: "Comparing accessible disclosure patterns",
  },
  {
    id: "inspect",
    icon: "tool",
    label: "Inspected the local component contract",
    activeLabel: "Inspecting the local component contract",
  },
  {
    id: "trace",
    icon: "tool",
    label: "Traced existing usage and states",
    activeLabel: "Tracing existing usage and states",
  },
  {
    id: "shape",
    icon: "thinking",
    label: "Shaped the implementation",
    activeLabel: "Shaping the implementation",
  },
  {
    id: "verify",
    icon: "tool",
    label: "Checked the finished interaction",
    activeLabel: "Checking the finished interaction",
  },
  { id: "done", icon: "thinking", label: "Run complete", activeLabel: "Completing the run" },
] as const;

// Discovery and reasoning naturally take longer than a lightweight state handoff.
const STEP_TIMINGS = [
  { hold: 1700, reveals: [420] },
  { hold: 3250 },
  { hold: 1350, reveals: [320] },
  { hold: 2750 },
  { hold: 1550 },
  { hold: 2800 },
  { hold: 850 },
] as const;

function statusFor(index: number, visible: number): AgentActivityStatus {
  if (visible >= STEPS.length + 1) return "complete";
  if (index < visible - 1) return "complete";
  return index === visible - 1 ? "active" : "pending";
}

export default function AgentActivityStreamingExample() {
  const reduceMotion = useReducedMotion();
  const { visible, revealLevels } = useDemoSequence(STEP_TIMINGS, reduceMotion);

  const entries: AgentActivityEntry[] = STEPS.map((step, index) => ({
    ...step,
    status: statusFor(index, visible),
    sources: index === 0 && revealLevels[0] >= 1 ? ["motion.dev", "w3.org"] : undefined,
    description:
      index === 2 && revealLevels[2] >= 1 ? (
        <code className="font-mono text-caption">rg "AgentActivity" src</code>
      ) : undefined,
  }));

  return <AgentActivity entries={entries} title="Thinking" />;
}
