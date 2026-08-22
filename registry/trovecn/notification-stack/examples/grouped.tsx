"use client";

import { useState } from "react";
import { CalendarClock, GitPullRequest, Mail } from "lucide-react";

import {
  NotificationStack,
  type NotificationItem,
} from "@/components/trovecn/feedback/notification-stack";

const groups: { label: string; items: NotificationItem[] }[] = [
  {
    label: "GitHub",
    items: [
      {
        id: "gh-1",
        icon: <GitPullRequest />,
        title: "CI passed on #2181",
        meta: "now",
        body: "18 checks in 4m 02s.",
      },
      {
        id: "gh-2",
        icon: <GitPullRequest />,
        title: "Review requested on #2179",
        meta: "8m",
        body: "Second approval needed.",
      },
      {
        id: "gh-3",
        icon: <GitPullRequest />,
        title: "Branch deleted: fix/tooltip",
        meta: "20m",
        body: "Merged into main by chantel.",
      },
      {
        id: "gh-4",
        icon: <GitPullRequest />,
        title: "New issue: focus trap leaks",
        meta: "1h",
        body: "Focus stays trapped after unmount.",
      },
    ],
  },
  {
    label: "Mail",
    items: [
      {
        id: "mail-1",
        icon: <Mail />,
        title: "Northwind Trading",
        meta: "2m",
        body: "Invoice #4021 attached, net 30.",
      },
      {
        id: "mail-2",
        icon: <Mail />,
        title: "Your weekly digest",
        meta: "6h",
        body: "12 threads you haven't opened.",
      },
    ],
  },
  {
    label: "Calendar",
    items: [
      {
        id: "cal-1",
        icon: <CalendarClock />,
        title: "Design review",
        meta: "15m",
        body: "Agenda still empty.",
      },
    ],
  },
];

export default function NotificationStackGroupedExample() {
  const [state, setState] = useState(groups);

  const dismiss = (label: string) => (id: string) =>
    setState((current) =>
      current.map((group) =>
        group.label === label
          ? { ...group, items: group.items.filter((item) => item.id !== id) }
          : group,
      ),
    );

  return (
    <div className="flex h-[568px] w-full max-w-sm flex-col items-stretch justify-center gap-6">
      {state.map((group) => (
        <NotificationStack
          key={group.label}
          label={group.label}
          notifications={group.items}
          onDismiss={dismiss(group.label)}
        />
      ))}
    </div>
  );
}
