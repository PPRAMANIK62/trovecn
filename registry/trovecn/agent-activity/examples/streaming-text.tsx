"use client";

import { useReducedMotion } from "motion/react";

import {
  AgentActivity,
  type AgentActivityEntry,
} from "@/components/trovecn/ai-workbench/agent-activity";

import { useDemoSequence } from "./use-demo-sequence";
import { StreamingDescription } from "./streaming-description";

const STEPS = [
  {
    id: "context",
    label: "Established the request context",
    activeLabel: "Establishing the request context",
    text: "I’m mapping the request against the existing component surface and its interaction contract, separating the information that belongs to a timeline from the evidence that belongs to a single step.",
  },
  {
    id: "constraints",
    label: "Reviewed visual and accessibility constraints",
    activeLabel: "Reviewing visual and accessibility constraints",
    text: "The active state needs to remain unmistakable while output arrives, disclosures need an explicit relationship to their content, and reduced-motion preferences should resolve to stable completed text.",
  },
  {
    id: "pattern",
    label: "Formed the interaction pattern",
    activeLabel: "Forming the interaction pattern",
    text: "Supporting material such as sources, command output, images, and details should receive a rail. Standalone phases are simply adjacent moments in the run, so they remain visually quiet.",
  },
  {
    id: "response",
    label: "Prepared the response",
    activeLabel: "Preparing the response",
    text: "I’m condensing the findings into a focused implementation that reads like a real agent trace: deliberate progress, useful evidence, and a clear completion state.",
  },
] as const;

// Each thought holds for the time its particular reading and response need.
const STEP_TIMINGS = [{ hold: 2650 }, { hold: 2900 }, { hold: 2200 }, { hold: 2600 }] as const;

function statusFor(index: number, visible: number): "pending" | "active" | "complete" {
  if (visible >= STEPS.length + 1) return "complete";
  if (index < visible - 1) return "complete";
  return index === visible - 1 ? "active" : "pending";
}

export default function AgentActivityStreamingTextExample() {
  const reduceMotion = useReducedMotion();
  const { visible } = useDemoSequence(STEP_TIMINGS, reduceMotion);

  const entries: AgentActivityEntry[] = STEPS.map((step, index) => {
    const status = reduceMotion ? "complete" : statusFor(index, visible);

    return {
      id: step.id,
      label: step.label,
      activeLabel: step.activeLabel,
      status,
      isStreamingText: true,
      showIcon: false,
      description: (
        <StreamingDescription
          text={step.text}
          active={status === "active"}
          complete={status === "complete"}
        />
      ),
    };
  });

  entries.push({
    id: "complete",
    label: "Thinking complete",
    activeLabel: "Completing the thinking",
    status: reduceMotion ? "complete" : visible >= STEPS.length + 1 ? "complete" : "pending",
    showIcon: false,
  });

  return <AgentActivity entries={entries} title="Thinking" />;
}
