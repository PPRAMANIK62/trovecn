"use client";

import { ArrowLeft, GripHorizontal } from "lucide-react";

import { ListDetailMorph } from "@/components/trovecn/navigation/list-detail-morph";

/**
 * Real records rather than "Item 1", because the morph is judged on whether a
 * row's content lands where the detail's content starts. Placeholder rows hide
 * that: everything lines up when everything is the same width.
 */
const RELEASES = [
  {
    id: "2-4-0",
    version: "v2.4.0",
    date: "14 Aug",
    summary: "Streaming responses, retry budgets",
    author: "Priya Raman",
    notes: [
      "Responses now stream by default. `stream: false` restores the old behaviour.",
      "Retries carry a per-request budget instead of a fixed count, so a slow call cannot spend the whole window.",
      "Dropped the 15s hard timeout. A request that is still producing tokens is no longer killed halfway.",
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
      "Usage totals counted the system prompt twice on the first turn of a conversation.",
      "`countTokens` no longer allocates for messages it has already seen.",
    ],
  },
  {
    id: "2-3-0",
    version: "v2.3.0",
    date: "21 Jul",
    summary: "Tool definitions, batch endpoint",
    author: "Priya Raman",
    notes: [
      "Tools are declared once and reused across calls rather than resent per request.",
      "New batch endpoint for up to 500 requests, billed at half rate.",
      "Breaking: `tools` moved out of `options` and onto the request root.",
    ],
  },
  {
    id: "2-2-1",
    version: "v2.2.1",
    date: "9 Jul",
    summary: "Patch: regional routing",
    author: "Dana Whitfield",
    notes: [
      "Requests from eu-west-1 were routed to us-east-1 when the regional pool was saturated.",
      "Added `x-served-region` to every response so this is visible without a support ticket.",
    ],
  },
  {
    id: "2-2-0",
    version: "v2.2.0",
    date: "28 Jun",
    summary: "Structured outputs",
    author: "Marco Reyes",
    notes: [
      "Responses can be constrained to a JSON schema, validated server side before they are returned.",
      "A schema that cannot be satisfied now fails loudly instead of returning prose.",
    ],
  },
  {
    id: "2-1-4",
    version: "v2.1.4",
    date: "16 Jun",
    summary: "Patch: stream backpressure",
    author: "Dana Whitfield",
    notes: [
      "A slow consumer could stall the whole connection pool rather than only its own stream.",
    ],
  },
];

/**
 * Fixed reserve. The component fills the height it is given and the detail
 * overlays the list inside it, so the docs page never reflows when a row opens.
 * 380 is measured against four rows plus the list's own gaps, not guessed.
 */
export default function ListDetailMorphBasicExample() {
  return (
    <div className="h-[380px] w-full max-w-md">
      <ListDetailMorph className="h-full">
        <ListDetailMorph.List label="Releases">
          {RELEASES.map((release) => (
            <ListDetailMorph.Item key={release.id} value={release.id}>
              <div className="flex items-baseline gap-3 p-3.5">
                <span className="font-mono text-sm text-foreground">{release.version}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {release.summary}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
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
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-fast hover:text-foreground"
                    >
                      <ArrowLeft className="size-3.5" />
                      Releases
                    </ListDetailMorph.Close>
                    <GripHorizontal className="size-4 shrink-0 text-muted-foreground/60" />
                  </div>
                </ListDetailMorph.Handle>
                <div className="px-4 pb-5">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="font-mono text-base text-foreground">{release.version}</h3>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {release.date}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Released by {release.author}</p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {release.notes.map((note) => (
                      <li key={note} className="text-sm leading-relaxed text-muted-foreground">
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
