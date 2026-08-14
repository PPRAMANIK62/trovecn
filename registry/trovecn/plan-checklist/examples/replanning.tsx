"use client";

import { useEffect, useState } from "react";

import { usePausableWait } from "@/components/site/demo-playback";
import {
  PlanChecklist,
  type PlanChecklistItem,
} from "@/components/trovecn/ai-workbench/plan-checklist";

const INITIAL: PlanChecklistItem[] = [
  { id: "repro", label: "Reproduce the flaky checkout test", status: "in-progress" },
  { id: "fix", label: "Fix the race in the payment mock", status: "pending" },
  { id: "rerun", label: "Re-run the suite 20x to confirm", status: "pending" },
];

export default function PlanChecklistReplanningExample() {
  const { wait } = usePausableWait();
  const [items, setItems] = useState<PlanChecklistItem[]>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setItems(INITIAL);
      await wait(900);
      if (cancelled) return;
      // The agent finds a second cause mid-investigation and inserts a step
      // for it, ahead of the work already queued — this is the "about to
      // happen" state changing live, not just advancing.
      setItems([
        { id: "repro", label: "Reproduce the flaky checkout test", status: "done" },
        {
          id: "clock",
          label: "Fix the unmocked system clock in the test setup",
          status: "in-progress",
          detail: "found while reproducing — blocks the original fix",
        },
        { id: "fix", label: "Fix the race in the payment mock", status: "pending" },
        { id: "rerun", label: "Re-run the suite 20x to confirm", status: "pending" },
      ]);
      await wait(900);
      if (cancelled) return;
      setItems((current) =>
        current.map((item, index) => {
          if (item.status === "in-progress") return { ...item, status: "done" };
          if (index === current.findIndex((i) => i.status === "pending")) {
            return { ...item, status: "in-progress" };
          }
          return item;
        }),
      );
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [wait]);

  return <PlanChecklist title="Debug flaky checkout test" items={items} />;
}
