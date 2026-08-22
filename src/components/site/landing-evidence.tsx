"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  GitPullRequest,
  GripHorizontal,
  ServerCog,
} from "lucide-react";

import { ElasticSlider } from "@/components/trovecn/inputs/elastic-slider";
import { ScrubField } from "@/components/trovecn/inputs/scrub-field";
import {
  NotificationStack,
  type NotificationItem,
} from "@/components/trovecn/feedback/notification-stack";
import { ListDetailMorph } from "@/components/trovecn/navigation/list-detail-morph";

/**
 * Section 02. Four components, no cards.
 *
 * What changed and why:
 *
 * The grid used to hold six primitives — Switch, Tabs, Accordion, Checkbox
 * Group, Tooltip, Combobox. docs/what-to-build.md deprioritises exactly
 * those ("primitives a trusted library already owns … do not lead with
 * it"), and they are also the six tiles that read as nothing in a silent
 * clip: Tooltip's was four buttons, Combobox's an empty search input. The
 * page claimed premium detail and showed a form. These four answer
 * question 2 instead, and each one's caption is its own registry
 * description, which is already written in that form.
 *
 * Selection Toolbar and Comparison Slider are deliberately absent. The
 * toolbar's tile is a paragraph of grey text with no affordance until a
 * text drag it will not get here; the slider is upstairs at full width,
 * where it fits.
 *
 * The frames are gone too. design-system.md's "The site" section describes
 * the docs shell as flush, edge to edge, split by hairline borders, and
 * records that an earlier floating rounded shell "looked like a
 * competitor's site and was removed" — a removal that only ever reached
 * /docs. This grid uses the same construction so both halves of the site
 * read as one product.
 *
 * Every cell reserves a fixed box for its demo. The stack and the morph
 * both animate their own height (design-system.md "Demos"), and an
 * unreserved cell reflows the entire grid while someone is using it.
 *
 * No entrance animation, deliberately. This grid inherited a scroll-triggered
 * stagger from the showcase it replaced, and it did not survive review
 * against design-system.md "Motion": a reveal explains no change — the
 * content did not change, it arrived — and the delight budget names the
 * homepage hero, not this, as the "seen once" place to spend a beat. It also
 * cost something concrete here, because these cells hold live controls: a
 * cell translating into place while someone reaches for the slider is
 * decorative motion competing with the interaction the page exists to
 * advertise, on a page whose argument is that motion should be caused by the
 * person using it. Dropping it also means four working demos are never
 * sitting at opacity 0 waiting on JS. The Hero keeps its mount stagger; it is
 * the one entrance on the page.
 */

/* ------------------------------------------------------------------ *
 * Compact variants
 *
 * Same precedent as the grid this replaces: the complete examples stay on
 * the component pages, and the landing page gets one trimmed to the room it
 * has. The registry examples themselves are untouched.
 * ------------------------------------------------------------------ */

function ElasticSliderTile() {
  const [settings, setSettings] = useState({
    volume: 72,
    brightness: 45,
    warmth: 18,
  });
  const update = (key: keyof typeof settings) => (value: number) =>
    setSettings((current) => ({ ...current, [key]: value }));

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <ElasticSlider
        label="Volume"
        value={settings.volume}
        onValueChange={update("volume")}
        formatValue={(v) => `${Math.round(v)}%`}
      />
      <ElasticSlider
        label="Brightness"
        value={settings.brightness}
        onValueChange={update("brightness")}
        formatValue={(v) => `${Math.round(v)}%`}
      />
      <ElasticSlider
        label="Warmth"
        value={settings.warmth}
        onValueChange={update("warmth")}
        formatValue={(v) => `${Math.round(v)}%`}
      />
    </div>
  );
}

function ScrubFieldTile() {
  return (
    <div className="w-fit rounded-lg border border-border bg-card p-3 shadow-panel">
      <p className="pb-2 text-label uppercase text-muted-foreground">Layout</p>
      <div className="flex flex-col gap-1.5">
        <ScrubField label="X" defaultValue={24} suffix="px" />
        <ScrubField label="Y" defaultValue={16} suffix="px" />
        <ScrubField label="W" defaultValue={320} suffix="px" min={0} />
        <ScrubField label="H" defaultValue={180} suffix="px" min={0} />
        <ScrubField label="Radius" defaultValue={8} suffix="px" min={0} max={64} />
      </div>
    </div>
  );
}

/** No add/reset row. That pair is a docs affordance, and at landing-tile
 *  height it was the part being clipped off the bottom. Dismissing to empty
 *  is recoverable through the empty state instead. */
const stackSeed: NotificationItem[] = [
  {
    id: "n1",
    icon: <GitPullRequest />,
    title: "Review requested",
    body: "danabramov opened “Drop the scheduler”.",
    meta: "now",
  },
  {
    id: "n2",
    icon: <ServerCog />,
    title: "Deploy finished",
    body: "Build 1841 shipped in 2m 11s.",
    meta: "4m",
  },
  {
    id: "n3",
    icon: <CreditCard />,
    title: "Invoice #4021 paid",
    body: "Northwind Trading, $12,480 by ACH.",
    meta: "12m",
  },
  {
    id: "n4",
    icon: <CalendarClock />,
    title: "Design review",
    body: "Starts in 15 minutes.",
    meta: "38m",
  },
];

function NotificationStackTile() {
  const [items, setItems] = useState(stackSeed);

  return (
    <div className="flex w-full max-w-sm items-center">
      <NotificationStack
        className="w-full"
        notifications={items}
        onDismiss={(id) => setItems((current) => current.filter((item) => item.id !== id))}
        emptyState={
          <button
            type="button"
            onClick={() => setItems(stackSeed)}
            className="text-caption text-muted-foreground underline-offset-4 hover:underline"
          >
            Bring them back
          </button>
        }
      />
    </div>
  );
}

/** Three rows, not six. At six the list overflows the reserved box and clips
 *  its top row mid-sentence. */
const RELEASES = [
  {
    id: "2-4-0",
    version: "v2.4.0",
    date: "14 Aug",
    summary: "Streaming responses",
    author: "Priya Raman",
    notes: [
      "Responses now stream by default. `stream: false` restores the old behaviour.",
      "Retries carry a per-request budget instead of a fixed count.",
      "Fixed a leak where an aborted stream kept its reader open.",
    ],
  },
  {
    id: "2-3-2",
    version: "v2.3.2",
    date: "2 Aug",
    summary: "Patch: token accounting",
    author: "Marco Reyes",
    notes: [
      "Usage totals counted the system prompt twice on the first turn.",
      "`countTokens` no longer allocates for messages it has already seen.",
    ],
  },
  {
    id: "2-3-0",
    version: "v2.3.0",
    date: "21 Jul",
    summary: "Tool definitions",
    author: "Priya Raman",
    notes: [
      "Tools are declared once and reused rather than resent per request.",
      "New batch endpoint for up to 500 requests, billed at half rate.",
    ],
  },
];

function ListDetailMorphTile() {
  return (
    <div className="w-full max-w-sm">
      <ListDetailMorph>
        <ListDetailMorph.List label="Releases">
          {RELEASES.map((release) => (
            <ListDetailMorph.Item key={release.id} value={release.id}>
              <div className="flex items-center gap-3 px-3.5 py-3">
                <span className="font-mono text-caption text-foreground">{release.version}</span>
                <span className="min-w-0 flex-1 truncate text-caption text-muted-foreground">
                  {release.summary}
                </span>
                <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                  {release.date}
                </span>
              </div>
            </ListDetailMorph.Item>
          ))}
        </ListDetailMorph.List>

        <ListDetailMorph.Detail label="Release notes">
          {(id) => {
            const release = RELEASES.find((item) => item.id === id);
            if (!release) return null;
            return (
              <>
                <ListDetailMorph.Handle label="Drag down to go back">
                  <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
                    <ListDetailMorph.Close
                      label="Back to releases"
                      className="flex items-center gap-1.5 text-caption text-muted-foreground transition-colors duration-fast hover:text-foreground"
                    >
                      <ArrowLeft className="size-3.5" />
                      Releases
                    </ListDetailMorph.Close>
                    <GripHorizontal className="size-4 shrink-0 text-muted-foreground/60" />
                  </div>
                </ListDetailMorph.Handle>
                <div className="px-4 pb-5">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="font-mono text-body text-foreground">{release.version}</h3>
                    <span className="text-caption tabular-nums text-muted-foreground">
                      {release.date}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-muted-foreground">
                    Released by {release.author}
                  </p>
                  <ul className="mt-3.5 flex flex-col gap-2.5">
                    {release.notes.map((note) => (
                      <li key={note} className="text-caption leading-relaxed text-muted-foreground">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            );
          }}
        </ListDetailMorph.Detail>
      </ListDetailMorph>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const EVIDENCE = [
  {
    slug: "elastic-slider",
    title: "Elastic Slider",
    line: "Grab it and the track thickens. Push past either end and the whole bar stretches, giving less the harder you pull, then snaps back when you let go.",
    reserve: "h-[300px]",
    Demo: ElasticSliderTile,
  },
  {
    slug: "notification-stack",
    title: "Notification Stack",
    line: "Notifications collapse into a pile with the edges underneath peeking out. Pull to fan them apart; throw one sideways and the rest close the gap, then restack.",
    reserve: "h-[340px]",
    Demo: NotificationStackTile,
  },
  {
    slug: "list-detail-morph",
    title: "List Detail Morph",
    line: "The row you press becomes the detail view. Leave before it lands and it turns around from where it is, rather than finishing the trip and playing the close from rest.",
    reserve: "h-[340px]",
    Demo: ListDetailMorphTile,
  },
  {
    slug: "scrub-field",
    title: "Scrub Field",
    line: "Drag the label to scrub the value under pointer lock, or click the number and type. The cursor never runs off the edge.",
    reserve: "h-[300px]",
    Demo: ScrubFieldTile,
  },
] as const;

export function LandingEvidence() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 md:px-8">
        <p className="font-mono text-label uppercase text-muted-foreground">02 — What installs</p>
        <h2 className="mt-2 max-w-xl text-title text-foreground">
          Four interactions, described by what they do under your hand.
        </h2>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 border-t border-border md:grid-cols-2">
        {EVIDENCE.map((entry, i) => (
          <div
            key={entry.slug}
            className="border-b border-border px-6 py-9 md:px-8 md:py-10 md:[&:nth-child(odd)]:border-r"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-micro tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Only the name navigates, same rule as the grid this
                  replaces — the demo underneath stays a live control, and an
                  overlay link would swallow the drag it exists to advertise. */}
              <Link
                href={`/docs/components/${entry.slug}`}
                className="rounded-sm text-control text-foreground outline-none transition-colors duration-fast hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {entry.title}
              </Link>
            </div>
            <p className="mt-2 max-w-md text-caption leading-relaxed text-muted-foreground">
              {entry.line}
            </p>
            <div className={`mt-7 flex ${entry.reserve} items-center`}>
              <entry.Demo />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
