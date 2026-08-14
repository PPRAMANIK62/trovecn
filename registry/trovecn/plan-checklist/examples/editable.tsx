"use client";

import { useState } from "react";

import {
  PlanChecklist,
  type PlanChecklistItem,
} from "@/components/trovecn/ai-workbench/plan-checklist";

const INITIAL: PlanChecklistItem[] = [
  { id: "scope", label: "Read the linked issue and confirm scope", status: "done" },
  {
    id: "migration",
    label: "Write the column-add migration",
    status: "in-progress",
    detail: "users.last_active_at",
  },
  { id: "backfill", label: "Backfill existing rows", status: "pending" },
  { id: "index", label: "Add the supporting index", status: "pending" },
  { id: "rollout", label: "Note the rollout plan in the PR", status: "pending" },
];

export default function PlanChecklistEditableExample() {
  const [items, setItems] = useState<PlanChecklistItem[]>(INITIAL);

  function handleRelabel(id: string, label: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, label } : item)));
  }

  function handleReorder(orderedIds: string[]) {
    setItems((current) => {
      const byId = new Map(current.map((item) => [item.id, item]));
      return orderedIds.map((id) => byId.get(id)!);
    });
  }

  return (
    <PlanChecklist
      title="Add last-active tracking"
      items={items}
      onRelabel={handleRelabel}
      onReorder={handleReorder}
    />
  );
}
