"use client";

import { useState } from "react";
import { AlertTriangle, ServerCog, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NotificationStack,
  type NotificationItem,
} from "@/components/trovecn/feedback/notification-stack";

const seed: NotificationItem[] = [
  {
    id: "alert",
    icon: <AlertTriangle />,
    title: "p99 latency above 800ms",
    meta: "now",
    body: "eu-west-1, firing for 4 minutes.",
  },
  {
    id: "deploy",
    icon: <ServerCog />,
    title: "Rollback completed",
    meta: "6m",
    body: "Reverted to build 1839.",
  },
  {
    id: "audit",
    icon: <ShieldCheck />,
    title: "Access review due",
    meta: "3h",
    body: "11 accounts still unattested.",
  },
];

export default function NotificationStackClearingExample() {
  const [items, setItems] = useState(seed);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex h-[296px] items-center">
        <NotificationStack
          className="w-full"
          label="Incidents"
          notifications={items}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onDismiss={(id) => setItems((current) => current.filter((item) => item.id !== id))}
          emptyState="All clear. Nothing needs you."
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setItems([])} disabled={!items.length}>
          Clear all
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setItems(seed)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
