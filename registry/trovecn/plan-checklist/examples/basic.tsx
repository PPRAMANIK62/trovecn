"use client";

import { useEffect, useState } from "react";

import { usePausableWait } from "@/components/site/demo-playback";
import {
  PlanChecklist,
  type PlanChecklistItem,
} from "@/components/trovecn/ai-workbench/plan-checklist";

const INITIAL: PlanChecklistItem[] = [
  { id: "read", label: "Read the current auth middleware", status: "in-progress" },
  { id: "draft", label: "Draft the replacement session check", status: "pending" },
  { id: "tests", label: "Update the auth test suite", status: "pending" },
  { id: "docs", label: "Note the change in AGENTS.md", status: "pending" },
];

export default function PlanChecklistBasicExample() {
  const { wait } = usePausableWait();
  const [items, setItems] = useState<PlanChecklistItem[]>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    function advance() {
      setItems((current) => {
        const index = current.findIndex((item) => item.status === "in-progress");
        if (index === -1) return current;
        return current.map((item, i) => {
          if (i === index) return { ...item, status: "done" };
          if (i === index + 1) return { ...item, status: "in-progress" };
          return item;
        });
      });
    }

    const run = async () => {
      setItems(INITIAL);
      await wait(900);
      if (cancelled) return;
      advance();
      await wait(900);
      if (cancelled) return;
      advance();
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [wait]);

  return <PlanChecklist title="Fix session expiry" items={items} />;
}
