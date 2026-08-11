"use client";

import { useReducedMotion } from "motion/react";

import {
  AgentActivity,
  type AgentActivityEntry,
  type AgentActivityStatus,
} from "@/components/trovecn/ai-workbench/agent-activity";

import { useDemoSequence } from "./use-demo-sequence";
import { StreamingDescription } from "./streaming-description";

const STEP_COUNT = 5;
// Visual analysis has a longer hold than capturing or recording the result.
const STEP_TIMINGS = [
  { hold: 1600, reveals: [420] },
  { hold: 1500, reveals: [460] },
  { hold: 3100, reveals: [420] },
  { hold: 1650, reveals: [380] },
  { hold: 2650 },
] as const;

function statusFor(index: number, visible: number): AgentActivityStatus {
  if (visible >= STEP_COUNT + 1) return "complete";
  if (index < visible - 1) return "complete";
  return index === visible - 1 ? "active" : "pending";
}

export default function AgentActivityWithImagesExample() {
  const reduceMotion = useReducedMotion();
  const { visible, revealLevels } = useDemoSequence(STEP_TIMINGS, reduceMotion);

  const entries: AgentActivityEntry[] = [
    {
      id: "search",
      icon: "search",
      label: "Found the interface reference",
      activeLabel: "Finding the interface reference",
      status: statusFor(0, visible),
      sources: revealLevels[0] >= 1 ? ["landing page"] : undefined,
    },
    {
      id: "image",
      icon: "image",
      label: "Captured the landing-page reference",
      activeLabel: "Capturing the landing-page reference",
      status: statusFor(1, visible),
      image:
        revealLevels[1] >= 1
          ? {
              src: "/agent-activity-landing-page.png",
              alt: "The components landing page with a premium interfaces headline",
              caption: "Landing page reference · 16:9",
            }
          : undefined,
    },
    {
      id: "review",
      icon: "thinking",
      label: "Reviewed hierarchy and state changes",
      activeLabel: "Reviewing hierarchy and state changes",
      description:
        revealLevels[2] >= 1 ? (
          <StreamingDescription
            text="Checking the persistent anchor, revealed history, and active state."
            active={statusFor(2, visible) === "active"}
            complete={statusFor(2, visible) === "complete"}
          />
        ) : undefined,
      status: statusFor(2, visible),
      isStreamingText: true,
    },
    {
      id: "compare",
      icon: "reasoning",
      label: "Compared the reference with the local surface",
      activeLabel: "Comparing the reference with the local surface",
      description:
        revealLevels[3] >= 1 ? (
          <StreamingDescription
            text="Noting which visual cues communicate progress and which are decorative noise."
            active={statusFor(3, visible) === "active"}
            complete={statusFor(3, visible) === "complete"}
          />
        ) : undefined,
      status: statusFor(3, visible),
      isStreamingText: true,
    },
    {
      id: "done",
      icon: "thinking",
      label: "Visual review complete",
      activeLabel: "Completing the visual review",
      status: statusFor(4, visible),
    },
  ];

  return <AgentActivity entries={entries} title="Vision review" />;
}
