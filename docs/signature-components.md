# Signature components

Candidates that clear the [sourcing standard](sourcing.md). Each one does a
real job, carries a single physical detail that is the reason to pick it, and
has not been shipped as an installable component by anybody.

These are not motion demos. Every entry below is something a person would
install into a production app, which is what separates it from the
decorative tier and what makes it worth building twice: once for the clip,
and then for the years it sits in somebody's codebase.

Entries stay here until they are built, then move to
[ideas.md](ideas.md) under Built. Anything in the backlog at the bottom is
unvetted and has to pass the saturation check before it moves up.

## ScrubField

**Job.** Numeric input, anywhere a value is nudged rather than typed:
property panels, settings, filters, spacing controls.

**Source.** Figma property fields. Blender and After Effects do the same
thing.

**Signature detail.** Drag the label sideways and the value scrubs. Pointer
Lock means the cursor never leaves the field or hits the screen edge, so the
drag has no range limit. Alt scrubs at a tenth of the speed for precision.

**Claim status.** Leva ships this, buried inside an entire debug GUI nobody
wants in production. There is no standalone version in any shadcn-compatible
registry.

**Hard parts.** Less than expected, and worth recording why. Base UI ships
`number-field` with a `ScrubArea` and `ScrubAreaCursor`, so pointer lock,
the accumulated pointer delta, `pixelSensitivity`, Intl formatting, clamping,
keyboard stepping and the ARIA wiring all come for free. An earlier draft of
this entry claimed Safari's `movementX` scaling and a click-to-edit fallback
were the hard parts. Neither is ours: Base UI normalises the delta, and the
scrub area is a separate region from the input, so typing was never in
conflict with dragging. The modifiers also run the other way from what that
draft said, Alt is fine and Shift is coarse. Base UI disables the custom
scrub cursor in Safari, where the Pointer Lock notification causes a layout
shift.

What is actually hard is the layout. A number field has an intrinsic size,
and every early version stretched it to fill a row and then tried to hide the
leftover width. The answer was to stop stretching: one fixed-width control
with the label inside it, the left region scrubbing and the right typing, so
a stack aligns with no work from the caller.

**Motion notes.** The value itself gets no spring. It tracks the pointer one
to one or the gesture feels broken and laggy. The motion lives in the cursor
affordance on the label and in the settle when the drag ends.

Worth building first. It is the smallest surface here, it produces the most
immediate "I want that", and it closes the missing text input primitive at
the same time.

## ElasticSlider

**Job.** Any bounded continuous value: volume, brightness, zoom, opacity.

**Source.** The Apple Music volume slider.

**Signature detail.** The track thickens under the thumb while you drag, then
stretches with real resistance when you push past either end and snaps back
when you let go.

**Claim status.** Unclaimed. Base UI and Radix ship the semantics and leave
the feel to you, and none of the clone-tier libraries have attempted it.

**Hard parts.** The overshoot needs a damped resistance curve rather than a
clamp, so pushing twice as far past the end moves the track less than twice
as much. Deforming the track with `scaleY` on a wrapper distorts the rounded
caps, so the track probably wants to be an SVG path.

**Motion notes.** Reduced motion keeps the thickening, which is feedback, and
drops the rubber band, which is decoration.

Build it as a variant of the existing Slider primitive, not a new component.

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

## NotificationStack

**Job.** A notification centre holding grouped, persistent items.

**Source.** The iOS lock screen.

**Signature detail.** Notifications collapse into a pile with the edges of
the ones underneath peeking out. Expand and they fan out with a stagger.
Dismiss one and the rest restack.

**Claim status.** Sonner owns transient toasts and stops there. The
persistent grouped centre is unclaimed, and it is the obvious sibling.

**Hard parts.** Collapsed and expanded have to be the same DOM with different
transforms, so the change is a layout animation rather than a swap. Cap the
visible pile at three. On dismiss the list closes its gap first and restacks
second, because doing both at once turns into mush.

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
