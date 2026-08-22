"use client";

import { ArrowLeft, GripHorizontal, Paperclip } from "lucide-react";

import { ListDetailMorph } from "@/components/trovecn/navigation/list-detail-morph";

/**
 * Twelve rows against a fixed viewport, so the list scrolls. That is the case
 * the component is actually built for and the one every shortcut breaks: open a
 * row from the bottom, come back, and the return has to find a row that is no
 * longer on screen. `revealRow` corrects the list's scroll before the close
 * commits, which is invisible here because the detail is covering the list
 * while it happens.
 */
const THREADS = [
  {
    id: "northwind",
    from: "Dana Whitfield",
    subject: "Northwind contract, redlines attached",
    preview: "Legal came back on clause 7 and 11. Nothing structural.",
    time: "09:41",
    attachment: true,
  },
  {
    id: "oncall",
    from: "Marco Reyes",
    subject: "Swapping on-call this weekend",
    preview: "Can you take Saturday? I'll cover the following two.",
    time: "09:06",
  },
  {
    id: "p99",
    from: "Alerts",
    subject: "p99 latency above 800ms, api-gateway",
    preview: "eu-west-1 for the last 12 minutes. Auto-scaling did not trigger.",
    time: "08:58",
  },
  {
    id: "invoice",
    from: "Billing",
    subject: "Invoice #4021 paid",
    preview: "Northwind Trading, $12,480 by ACH.",
    time: "08:31",
  },
  {
    id: "design",
    from: "Priya Raman",
    subject: "Design review moved to Thursday",
    preview: "Kavi is out Wednesday and I'd rather not run it without them.",
    time: "Yesterday",
  },
  {
    id: "access",
    from: "Security",
    subject: "Access review due in 3 days",
    preview: "Nine roles need attesting. Two are dormant service accounts.",
    time: "Yesterday",
  },
  {
    id: "migration",
    from: "Priya Raman",
    subject: "Migration is behind a flag now",
    preview: "Default off. We can turn it on per workspace from the admin panel.",
    time: "Yesterday",
  },
  {
    id: "candidate",
    from: "Recruiting",
    subject: "Candidate debrief, staff frontend",
    preview: "Four yes, one no-with-reservations. Written feedback is in.",
    time: "Tue",
    attachment: true,
  },
  {
    id: "renewal",
    from: "Dana Whitfield",
    subject: "Vendor renewal, 30 days out",
    preview: "We're paying for 200 seats and using 74.",
    time: "Tue",
  },
  {
    id: "postmortem",
    from: "Marco Reyes",
    subject: "Postmortem: the 03:00 cache stampede",
    preview: "Root cause was a TTL that expired every key in the same second.",
    time: "Mon",
  },
  {
    id: "roadmap",
    from: "Priya Raman",
    subject: "Q4 roadmap, first pass",
    preview: "Three bets, one of which I think we should cut now rather than in November.",
    time: "Mon",
  },
  {
    id: "welcome",
    from: "Workspace",
    subject: "Marco Reyes joined the workspace",
    preview: "Invited by Priya Raman.",
    time: "Mon",
  },
];

/** Enough body to make the detail scroll, which is what puts the scroll
 *  arbitration and the pinned handle under real pressure. */
const BODY = [
  "Quick summary before the detail, since I know this thread has got long.",
  "The short version is that we agreed on the shape last week and everything since has been about who owns which half. I don't think that is worth another meeting, so here is what I propose and you can push back inline.",
  "First, the boundary. Anything that reads from the queue stays with us. Anything that writes to it moves. That is a cleaner split than the one we drew on the whiteboard, and it means neither team has to be in the room for a routine change.",
  "Second, the timeline. I would rather do this over three weeks with the flag off than over one week with it on. We have been burned by the fast version twice and both times the rollback was the expensive part.",
  "Third, the thing nobody has said out loud: the old path has to stay working the entire time. Not as a fallback we never exercise, but as the default until the new one has run a full week of real traffic without anyone touching it.",
  "If that all sounds right, I'll write it up properly and put it in the doc. If it doesn't, say so now rather than in the review.",
];

/**
 * Fixed reserve, tuned to the list rather than to the detail. The detail
 * inherits this height and scrolls inside it, which is the behaviour the
 * component's header documents.
 */
export default function ListDetailMorphInboxExample() {
  return (
    <div className="h-[420px] w-full max-w-md">
      <ListDetailMorph className="h-full">
        <ListDetailMorph.List label="Inbox">
          {THREADS.map((thread) => (
            <ListDetailMorph.Item key={thread.id} value={thread.id}>
              <div className="flex flex-col gap-1 p-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {thread.from}
                  </span>
                  {thread.attachment ? (
                    <Paperclip className="size-3 shrink-0 text-muted-foreground" />
                  ) : null}
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                    {thread.time}
                  </span>
                </div>
                <span className="truncate text-sm text-foreground">{thread.subject}</span>
                <span className="truncate text-xs text-muted-foreground">{thread.preview}</span>
              </div>
            </ListDetailMorph.Item>
          ))}
        </ListDetailMorph.List>

        <ListDetailMorph.Detail label="Message">
          {(id) => {
            const thread = THREADS.find((item) => item.id === id);
            if (!thread) return null;
            return (
              <>
                <ListDetailMorph.Handle label="Drag down to go back">
                  <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
                    <ListDetailMorph.Close
                      label="Back to inbox"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-fast hover:text-foreground"
                    >
                      <ArrowLeft className="size-3.5" />
                      Inbox
                    </ListDetailMorph.Close>
                    <GripHorizontal className="size-4 shrink-0 text-muted-foreground/60" />
                  </div>
                </ListDetailMorph.Handle>
                <div className="px-4 pb-6">
                  <h3 className="text-sm font-medium text-foreground">{thread.subject}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {thread.from} · {thread.time}
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {BODY.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 24)}
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            );
          }}
        </ListDetailMorph.Detail>
      </ListDetailMorph>
    </div>
  );
}
