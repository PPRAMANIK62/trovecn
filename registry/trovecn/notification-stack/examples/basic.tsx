"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  GitPullRequest,
  Mail,
  MessageSquare,
  Package,
  ServerCog,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NotificationStack,
  type NotificationItem,
} from "@/components/trovecn/feedback/notification-stack";

type Draft = Omit<NotificationItem, "id" | "meta">;

/**
 * Ten of them, cycled, rather than one message with a rising build number. A
 * pile of four identical cards says nothing about how the component handles
 * notifications that differ in source and in what they have to say.
 *
 * Every body is trimmed to one line. That is presentation for these pages, not
 * a constraint of the component. `body` clamps at two, and the pile solves each
 * peek from the bottom edge up so cards of different heights still come out
 * even. Uniform cards don't exercise it.
 */
const drafts: Draft[] = [
  {
    icon: <GitPullRequest />,
    title: "Review requested",
    body: "danabramov opened “Drop the scheduler”.",
  },
  { icon: <ServerCog />, title: "Deploy finished", body: "Build 1841 shipped in 2m 11s." },
  {
    icon: <Mail />,
    title: "Invoice #4021 paid",
    body: "Northwind Trading, $12,480 by ACH.",
  },
  {
    icon: <AlertTriangle />,
    title: "p99 latency above 800ms",
    body: "api-gateway, eu-west-1.",
  },
  { icon: <MessageSquare />, title: "Priya Raman", body: "Migration is behind a flag." },
  {
    icon: <UserPlus />,
    title: "Marco Reyes joined the workspace",
    body: "Invited by Priya Raman.",
  },
  {
    icon: <CalendarClock />,
    title: "Design review",
    body: "Starts in 15 minutes.",
  },
  {
    icon: <ShieldCheck />,
    title: "Access review due",
    body: "Nine roles need attesting.",
  },
  {
    icon: <CreditCard />,
    title: "Card ending 4417 expires this month",
    body: "No fallback method on file.",
  },
  { icon: <Package />, title: "v2.4.0 published", body: "3 packages, 1.2MB unpacked." },
];

/** Newest first. Everything below the top shifts one step down the list as
 *  arrivals push it back, so a pile of four doesn't read "now" four times. */
const ages = ["now", "1m", "4m", "12m", "38m", "1h"];

function withAges(items: (Draft & { id: string })[]): NotificationItem[] {
  return items.map((item, index) => ({ ...item, meta: ages[Math.min(index, ages.length - 1)] }));
}

/** A real centre trims on a schedule; this one trims so the demo stays inside
 *  the room the preview reserves for it. */
const CAP = 4;

const seed = withAges(
  drafts.slice(0, CAP).map((draft, index) => ({ ...draft, id: `seed-${index}` })),
);

let arrivals = 0;

export default function NotificationStackBasicExample() {
  const [items, setItems] = useState(seed);

  const add = () => {
    const draft = drafts[arrivals % drafts.length];
    arrivals += 1;
    setItems((current) =>
      withAges([{ ...draft, id: `arrival-${arrivals}` }, ...current].slice(0, CAP)),
    );
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {/* Fixed reserve, pile centred in it. The stack's own height animates, so
          without this the whole docs page reflows every time it opens. */}
      <div className="flex h-[308px] items-center">
        <NotificationStack
          className="w-full"
          notifications={items}
          onDismiss={(id) => setItems((current) => current.filter((item) => item.id !== id))}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={add}>
          New notification
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setItems(seed)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
