# list-detail-morph

List to detail navigation where the row you press becomes the detail view, and
turns around from wherever it is if you leave early.

Written after the component shipped. The choreography, the four departures, and
the accessibility model live in the file header, next to the code they explain,
and this does not repeat them. Where the two disagree the header is right. What
follows is the argument for building it and the versions that lost.

## The test

**1. Would someone reach for this while building a product?**

Yes. Inboxes, settings screens, file browsers, anything with a list of records
and a page per record. This is navigation, which is as close to furniture as a
component gets.

**2. How it behaves under the hand.**

> **View Transitions.** You press a row, it grows into the detail, and the
> animation plays to the end. Press back mid-flight and nothing happens until
> it lands.

> **Ours.** You press a row and it grows into the detail. Press back before it
> lands and the surface reverses from its current position and velocity rather
> than finishing the trip and playing the close from rest. Drag the open detail
> down and it follows your finger back toward its row, shrinking as it goes.
> Release short of 96px and it springs back open under its own release
> velocity.

**3. Better than the best version anywhere?**

Against the web, yes, and the reason is structural rather than a matter of
tuning.

Interruption in the View Transitions API is `WICG/view-transitions#157`, titled
"Support interruption" and still open. Every View Transitions demo of this
pattern cuts when you interrupt it, because the API cannot do otherwise.
Motion's projection can, which is the whole reason this exists as a component
rather than a CSS recipe.

Against native, this is roughly parity with a well-built iOS push transition,
which is the bar and not an easy one.

## What it beats

The pattern is everywhere and the interruption is nowhere. That is the gap, and
it is a gap in the platform rather than in anyone's effort.

The second gap is the gesture. A View Transition is fired by a navigation
event, so there is nothing to drag. Dragging the open detail back into its row
is not a harder version of the same thing, it is a different mechanism.

## Numbers

The morph:

```
ROW_RADIUS     12     px, a collapsed row
DETAIL_RADIUS  16     px, the open detail, interpolated between
CONTENT_LEAD   0.16   fraction of travel the body waits before arriving
MIN_VIEWPORT   280    px floor under the root when the list has no rows
```

The body waits the shell's whole travel rather than part of it. It is laid out
at its final size throughout, so a shell still growing clips it and the cut
falls mid-glyph. Text arriving before its container has made room is in the
Avoid column of the house recipes, and here it is not a matter of taste. It is
a visible slice through a word.

The dismissal gesture:

```
DISMISS_TRAVEL    96     px of travel that commits on release
DISMISS_VELOCITY  520    px/s that commits from anywhere
ENGAGE_SLOP       6      px that decide scroll versus dismiss
MAX_LIFT          32     px of rubber band dragging up, which has nowhere to go
LIFT_DECAY        90     px buying the first half of it
MAX_SHRINK        0.08   scale removed at full travel
VELOCITY_WINDOW   80     ms the release velocity is measured across
```

The shrink is a pure function of travel rather than an animation running
alongside it. That is what keeps position and scale from arriving at different
times on a fast release.

### Scroll arbitration

The part that makes or breaks a gesture like this, and the reason the constants
above are so small.

The detail's body scrolls, so a downward drag is almost always a scroll and
only sometimes a dismissal. A drag starting inside the body engages only if the
body was at `scrollTop === 0` when the pointer went down, and the first 6px of
movement are downward and more vertical than horizontal. Anything else releases
the gesture to the browser. The decision is made once per press and never
revisited, which is what stops a drag from changing its mind halfway.

`Handle` is the escape hatch. A press there engages immediately whatever the
scroll position, and it is the only way to dismiss from halfway down a long
detail.

## Paths not taken

**One fade on the whole list.** This is the interesting one, and it is subtly
wrong in a way nothing warns about.

Motion crossfades the `layoutId` pair, holding the row's own content at full
opacity through the first half of the morph and clearing it at 95%. Dimming the
whole list multiplies the opening row down to nothing in the first 50ms, which
erases the near side of that handover. The shell then spends most of its travel
as an empty card inflating, which is the generic version of this transition and
the exact thing the component exists to beat.

The fix is a fade per row, excluding the row that opened. The rows around it
were the measured problem. The one growing never was.

**No fade at all.** Measured opening the fifth row of six: the top row's 12px
corner and the shell's 16px corner were both on screen, fifteen pixels apart,
for about a third of the travel. Two rounded corners that close together read
as two stacked cards rather than one surface growing.

**A real 1px border for the hairline.** `border-width` is not in Motion's
scale-correction table, which registers only the radii and `box-shadow`, so a
border thickens non-uniformly as the shell grows. It is an inset `box-shadow`
spread instead, at exactly five parsed tokens, which is the most
`correctBoxShadow` accepts before it gives up and returns the value untouched.

**`shadow-panel` on the shell.** Ruled out by the same limit. Those are
three-shadow recipes, and adding one puts the parsed value over five tokens,
which silently drops the ring correction too. Separation comes from `--card`
against `--background` instead.

**A `rounded-*` class for the radius.** Motion only scale-corrects properties
it tracks, and an uncorrected radius bows into a barrel shape as the box grows.
Measured, not assumed.

**Velocity from the last `pointermove` delta.** Two moves are about 4ms apart on
a 240Hz screen, so a single delta turns three pixels of lift-off jitter into
750px/s and throws the detail away on a gesture that was a tap. An 80ms window
also lets a held drag decay to nothing, so pulling halfway, stopping to read,
and letting go does not commit on a number taken before the pause.

**A top fade under a pinned `Handle`.** A mask cannot fade content sliding under
a pinned header while sparing the header, because they are the same pixels.
Measured, the header's text washed from 18 to 75 out of 255 across the band.
The fade returns when no handle is mounted.

**Focus to the first control inside the detail.** The region carries the
accessible name, so landing on the region announces what you just opened, and
it makes the body's arrow-key scrolling work immediately. `Close` is one Tab
away and Escape works without it.

**A focus trap.** The detail covers the list completely, but this is not a
modal dialog and content elsewhere on the page should stay reachable. The list
is `inert` instead, which drops the covered subtree from both the tab order and
the accessibility tree while tabbing past the component still works.

**A live region.** The morph is silent but the focus move is not. Opening
announces the region, closing announces the row. A polite announcement on top
would double-speak every transition, which is worse than the silence it fixes.

## Selling points

1. **Interruptible.** Press back mid-flight and it reverses from where it is,
   at the speed it was going. This is the one thing the platform API cannot do,
   and it is not a tuning difference.
2. **Draggable.** The open detail follows your finger back into its row, and
   the scroll arbitration means it does that without stealing a single scroll.
3. **Scroll position is free.** The list never unmounts. The detail is an
   overlay over the same container and the row stays mounted underneath, so
   nothing is destroyed and nothing has to be restored.
4. **The return trip finds its row.** The list scrolls independently, so the
   row can be off screen by the time you come back. `revealRow` corrects
   `scrollTop` before the close commits, so Motion measures the row where it
   will actually be. Morphing toward a box that is off screen reads as the card
   being thrown away rather than put back.

### The silent clip

Press a row and press back before it lands. The shell stops, turns, and goes
home from the middle of its travel.

Three seconds, no caption needed, and it is the frame no competing version can
produce.

## Where the rest lives

The choreography, the four departures, the reduced-motion behaviour, the
keyboard and screen reader model, and the reasoning behind every constant are
in the header of `src/components/trovecn/navigation/list-detail-morph.tsx`.

The API across all six parts and the three worked examples are in
`registry/trovecn/list-detail-morph/meta.ts`.
