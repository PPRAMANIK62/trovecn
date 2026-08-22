# Signature components

Candidates that clear the [sourcing standard](sourcing.md). Each one does a
real job, carries a single physical detail that is the reason to pick it, and
has not been shipped as an installable component by anybody.

These are not motion demos. Every entry below is something a person would
install into a production app, which is what separates it from the
decorative tier and what makes it worth building twice: once for the clip,
and then for the years it sits in somebody's codebase.

Entries stay here until they are built, then move to
[ideas.md](ideas.md) under Built. `ScrubField`, `ElasticSlider`, and
`NotificationStack` have already gone that way. Whatever an entry taught
while it was being built goes to [decisions.md](decisions.md) rather than
leaving with it. Anything
in the backlog at the bottom is unvetted and has to pass the saturation
check before it moves up.

## SelectionToolbar

**Job.** Formatting a text selection in any editor or comment box.

**Source.** Medium, Notion, Linear's composer.

**Signature detail.** Hit the link button and the toolbar morphs into the URL
field in place. Same container, width animates, icons cross-fade out as the
input fades in. Escape morphs it back.

**Claim status.** Tiptap and ProseMirror ship bubble menus, unstyled and
without the morph. Every styled version in the wild swaps one popover for
another, which is the exact thing this replaces.

**Hard parts.** Anchoring to a `Range` that spans wrapped lines and survives
scrolling. Keeping the document selection alive while the toolbar takes
focus. The container has to own its width during the morph or the icons
reflow mid-animation and the illusion collapses.

## ListDetailMorph

**Job.** List to detail navigation, the most common transition in software.

**Source.** Family, Apple Photos, App Store cards.

**Signature detail.** The row you tapped becomes the detail view. Then the
part nobody ships: it is interruptible. Hit back halfway through and it
reverses from wherever it currently is.

**Claim status.** View Transitions demos are everywhere and none of them are
interruptible, because the API cannot be. Motion's layout animations can,
which is the entire opening.

**Hard parts.** Interruption is the whole component and has to work from the
first commit, not be retrofitted. Content inside the morphing container must
cross-fade at a fixed size while the container animates, or text stretches
and the morph reads as a scale. Scroll position has to survive the return
trip.

## Rejected

Kept here so the same ideas do not come back around.

- **Dynamic Island.** Emil's original plus Aceternity, Cult UI, SmoothUI and
  Skiper UI. The most saturated interaction on the web.
- **CommandPalette.** cmdk owns it, and every registry ships a wrapper.
- **UndoToast and BulkActionTray.** Real patterns, but they are shapes rather
  than signature details. They belong inside a composed example.
- **DataTable.** TanStack owns the logic, and the hard parts are responsive
  layout work rather than interaction work.

## Backlog

Unvetted. Each still has to pass the saturation check in
[sourcing.md](sourcing.md) before it moves up.

- Marquee drag-select across a grid, with the count following the cursor.
- A preview card that morphs into the full record instead of dismissing and
  navigating. Would build on the existing `preview-card`.
- Resizable panels with elastic snap points instead of a hard clamp.
- Word-level text rewrite morph: old words fade out, container width
  animates, new words fade in.
- Swipe triage card stack with throw physics, for review queues and inboxes.
- Time range brush dragged directly over a chart.
