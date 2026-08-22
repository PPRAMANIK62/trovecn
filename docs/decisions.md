# Decisions

Things that were tried and abandoned, kept out of
[the design system](design-system.md) so the rules there read as rules
rather than as a list of past mistakes.

Read this when a convention looks arbitrary and you want to know whether
somebody already paid for the lesson. Nothing here is binding on its own.

## Whole-tile links on the landing grid

`LandingTile` used to cover the entire tile with an absolutely positioned
`<Link>`, then punch `pointer-events-auto` holes back through it so the demo
underneath stayed interactive.

That fought event bubbling and stacking contexts per primitive. Base UI's
switch renders as `<span role="switch">` rather than a `<button>`, for one,
and a click could still reach the overlay after landing on the control
beneath it.

transitions.dev, the reference this grid is modelled on, does not wrap its
cards in a link at all. Each card is the destination, with small controls
layered by z-index. `LandingTile` now does the same: the stage stays
interactive with no pointer-events tricks, and the caption below it carries
the click through to the docs page.

## Card-toned demos on a card-toned stage

The first `blur-navbar` and `scroll-text-reveal` demos each wrapped their own
scroll container in `border-border bg-card`, which was the same tone as the
preview stage they sat on. The result read as one flat shape with a seam
nobody could see, however crisp the border was.

That is why the preview stage steps _down_ to `--background` while its frame
steps up to `--card`. A demo that adds its own `bg-card` wrapper "to give it
a background" recreates the bug. Both of those demos have since been removed
from the registry, but the elevation rule they produced still stands.

## Floating panels in the docs shell

An earlier `AppFrame` mechanism gave the docs shell rounded panels floating
with margin around them. It converged visually on a competing site, so it
was removed.

The replacement is flush, edge-to-edge panes split by hairline borders,
reading as one continuous surface. Rounded corners, canvas gutters, and
overlapping chrome in the docs shell are all downstream of the thing that
was removed, which is why the shell section says not to reintroduce them.

## One centred composition, on the homepage only

Centred paragraph text is the single strongest signal that a page was filled
in from a template rather than laid out. The homepage hero is exempt because
a marketing page needs one composed focal moment.

The exemption stops there by intent, not by principle. If a second centred
block ever earns its place, it needs an argument, not a precedent.

## Registry metadata used to be synced by hand

`src/lib/components-registry.ts` and `registry.json` were once maintained
independently, on the reasoning that the site's metadata and the shadcn build
manifest answer different questions.

Both are now generated from `registry/trovecn/<slug>/meta.ts` by
`scripts/generate-registry-index.ts` and
`scripts/generate-registry-manifest.ts`, wired into `predev` and `prebuild`.
Adding a component means adding a `meta.ts`. Hand-editing
`registry.generated.ts` or `registry.json` gets overwritten on the next run.

## Base UI already owned most of ScrubField

The `ScrubField` entry in [signature-components.md](signature-components.md)
spent its "hard parts" section on Safari's `movementX` scaling and on a
click-to-edit fallback that had to coexist with dragging. Both were wrong,
and the entry was corrected before the component shipped rather than after.

Base UI's `number-field` ships `ScrubArea` and `ScrubAreaCursor`, so pointer
lock, the accumulated delta, `pixelSensitivity`, Intl formatting, clamping,
keyboard stepping and the ARIA wiring are all free. The delta is already
normalised, so Safari is not ours to fix. The scrub area is a separate region
from the input, so typing was never in conflict with dragging. The modifiers
also run the opposite way from that draft: Alt is fine, Shift is coarse. Base
UI disables the custom scrub cursor in Safari, where the Pointer Lock
notification causes a layout shift.

What was actually hard was layout. A number field has an intrinsic size, and
every early version stretched it to fill a row and then tried to hide the
leftover width. The answer was to stop stretching: one fixed-width control
with the label inside it, the left region scrubbing and the right typing, so
a stack aligns with no work from the caller.

The general lesson is that a candidate's "hard parts" are guesses written
before anyone read the primitive's source. Check what the primitive already
does before budgeting for it.

## ElasticSlider's track is an SVG line, not a styled div

The obvious build is a rounded `div` with `scaleY` for the thickening and
`scaleX` for the stretch. Both are wrong, and visibly so: `scaleY` squashes
the round caps into ellipses and `scaleX` smears them sideways, so the bar
reads as a stretched _picture_ of a bar rather than a bar that grew. It is
the exact tell that separates this from the cheaper versions of the effect.

The track is therefore a `<line>` with `stroke-linecap="round"`, animating
`strokeWidth` and its endpoint coordinates. Geometry changes keep every cap a
true half-circle at any thickness or length. Because the endpoints move in
pixel user units, the SVG carries no `viewBox` and the component measures the
control with a `ResizeObserver` instead.

This is why the component animates non-`transform` properties, which
[design-system.md](design-system.md) otherwise asks you to justify, and why
the thickening is deliberately _not_ gated on `useReducedMotion()` — the
thickening is the feedback that says the bar is yours, so it stays. The
stretch is decoration, and that is the part reduced motion drops.

## ElasticSlider answers hover with weight, not with a pill

The first version had no hover state at all — the track sat inert until you
pressed it, which left the most common interaction with the component giving
no feedback. The obvious fix is the one every video scrubber ships: reveal a
pill under the cursor.

It was rejected. A pill is a second focal movement competing with the stretch
that the component exists for, and
[design-system.md](design-system.md) is specific that a signature detail buys
latitude for itself and not for the chrome around it. It also moves the target
mid-approach — you aim at a bar, a knob materialises, and now you are aiming
at the knob. Scrubbers get away with that because frame-precise seeking needs
a precision grab target; a coarse value like volume or zoom does not.

The track instead answers in the vocabulary it already had: 6px at rest, 8px
under a hovering mouse, 10px once held. Hover gets the smallest step that
still reads as live, because it is the most frequently seen animation the
component has. Touch pointers are excluded, or the track would thicken on
every tap-to-set.

Two things fell out of building it that are worth keeping. Releasing back to a
hovered pointer settles at 8px rather than 6px, so the bar does not appear to
drop out from under a cursor that never left. And the drag flag is cleared by
the component's own pointerup/pointercancel handler rather than by Base UI's
`onValueCommitted` — a cancelled gesture never commits, and waiting on that
event left the track stuck at its full weight for good.

## NotificationStack's pile is solved from the bottom edge up

The obvious build lays the collapsed pile out from the top: card `i` sits at
`i * PEEK`. That is correct only while every card is the same height. Give one
a two-line body and its peek grows with it, so the pile's edges come out
unevenly spaced. Even spacing is the one thing the whole illusion rests on.

Each buried card is therefore clipped to the front card's height and its top is
solved backwards from where its bottom edge has to land. A card shorter than the
front one simply sits lower rather than showing a shorter peek, and the pile
reads the same whatever it is holding.

The clip has a second job nobody would predict. `clip-path` applies after
`filter`, and a rect at `inset(0 …)` cuts the element's box shadow off at its
own border box. So an _unclipped_ card needs a rect that bleeds outwards or it
loses its shadow the moment the property animates at all. A _buried_ card needs
the opposite, clipped flush on every side, because a shadow spreading sideways
from behind the front card is what turns a pile into a smudge. Both directions
were visible bugs before they were rules.

## Depth in a pile is scale and blur, not opacity

The first depth ramp faded buried cards to 0.85 and 0.55. In dark mode that
washed the card tone back towards the surface behind it and the rungs
disappeared. Same failure as "Card-toned demos on a card-toned stage" above,
arrived at from a different direction.

Buried cards are now barely faded (0.9 / 0.72). A card further back is the same
material, not a more transparent one; scale, blur, and the peek carry the depth
between them. The blur has its own ceiling for a related reason. Under 1px per
rung, because a peek is only 12px tall and a blur tuned against a whole card
turns that strip into a shadow.

## Four transform layers per card, one channel each

A card in the stack is written to by four independent things: its slot in the
pile (React state, discrete, staggered), the pull gesture previewing the other
state (a motion value, continuous), the swipe (Motion's own `drag`), and its
arrival and departure (`AnimatePresence`). Every one of them wants `y`, `scale`,
or `opacity`.

Merging any two of them means one writer clobbering the other's property, so
each owns its own nested element and the browser composes the transforms. It
looks like more DOM than the component needs right up until the first time a
card is dismissed mid-open.

## A pile solved from a measured child has one blind frame

Adding a notification to `NotificationStack` used to make the whole pile flinch.
It was not the entrance animation, which is where anyone would look. Every
card's slot is solved from the front card's height, an arriving card _becomes_
the front card, and nothing knows its height until something measures it. So
there was one committed frame in which the pile had no front card at all,
collapsed to a 24px stub, and sprang back out.

A `ResizeObserver` is not enough on its own here. Its first callback is a
separate task, and the frame in between is the one that shows. The card now also
measures itself synchronously in a layout effect, before it is painted, and the
stack keeps the last known front height as a fallback so a zero can never reach
the geometry even if that fails. `offsetHeight`, not a bounding rect, because an
ancestor of the card is mid-scale and a rect would inherit it.

The instrumented before and after, one entry per committed value:

```text
broken   91.75/67.75 → 24/-1 → 111.25/87.25
fixed    91.75/67.75 → 111/87 → 111.25/87.25
```

The general shape: any component that derives its layout from a child it has to
measure has a blind frame whenever that child is new, and the more the rest of
the layout depends on that one measurement, the more violent the frame is.

## An arrival must not mix curves

The same arrival was mixing three of them. The rungs behind the new card slid on
`spring.moderate.exit`, a flat tween, because the pile was collapsed and
collapsing is an exit. The card itself sprang in. The pile bounced on `LAND`.
Three curves starting together and finishing apart read as three unrelated
things rather than one card landing.

A pile recovering from an arrival or a dismissal is doing neither of the things
the open/close curves are for, so it now gets the enter spring in both cases and
no stagger. The entrance direction was wrong too. The card rose from below while
the rungs gave way downwards beneath it. It drops from above now, the only
reading that agrees with the squash.

## The collapsed arrival needed a bigger gesture, not a longer one

The first complaint about the arrival was that it felt too fast, and the first
instinct, stretching the durations, would not have fixed it. Collapsed, the
whole event is a text swap in place plus `PEEK` of growth. The squash was 2.5%
of a 90px pile, about two pixels, and the entry fell 10px. Every part of it was
sub-perceptual, so slowing it down would only have bought a slower blink. The
open state read well the whole time for one reason. There, the same arrival
moves cards a full card height.

So the collapsed case scales the gesture to the object rather than sharing one
constant with the open state. Further to fall, a deeper compression, a real
overshoot on the rungs. That overshoot is the only thing that says one card just
became the second one.

Two timing faults came out with it. Opacity was riding the same spring as the
transform, so the arriving card spent its first frames semi-transparent directly
over the outgoing card's text. Two texts in one place, the artefact that masked
transitions exist to avoid. And the rungs gave way on the event rather than on
contact. Delaying them by `ARRIVE_IMPACT` is what turns a simultaneous blur of
movement into cause and effect.

The dismissal turned out to be the same fault mirrored, and it survived a whole
round of fixing the arrival before anyone noticed. The card left on
`spring.quick.exit`, 100ms, the icon-crossfade tier and four sizes too small for
a whole surface, while shrinking 8% and going nowhere. The pile closed its gap
in the same frame, so both events shared one window and neither was legible. It
now falls backwards along the pile's own depth axis, past where rung two sits,
and the gap waits `DEPART_LEAD_*` behind it.

A separate bug fell out of looking. A thrown card's opacity hit zero at 180ms
while `onDismiss` waited on the throw spring to finish at 400ms. Two hundred and
twenty milliseconds in which the card was already invisible and nothing had
happened yet. Timings that hand off to each other have to be read together, not
tuned one at a time.

The general lesson. When motion feels wrong, check how much of it is visible
before reaching for the duration. An animation nobody can see does not get
better by lasting longer.

## Content must not race its own container

`design-system.md` lists "text appearing before its container has made room"
under Avoid, and the restack was doing it. A promoted card's label faded in on
the quick tier with no delay while its slot was still travelling. Reveals now
wait `CONTENT_LEAD` behind whatever the container is doing.

Leaving is deliberately not symmetric. Content goes immediately, with no delay
at all, because a label caught halfway under a card being buried looks like a
bug in a way that a label arriving slightly late never does.

## A demo whose height animates has to reserve its open size

`NotificationStack` animates its own height, so a preview that lets it open
resizes the preview stage, and every section below it on the docs page moves.
Smoothly animated or not, it reads as the page coming apart.

The examples reserve the open height in a fixed box and centre the pile in it,
so the stage never changes size. The reserve is measured, not guessed, and it is
why `basic` caps its list rather than growing without limit. `ComponentPreview`
cannot help here. Its stage is a bare flex container by design, for reasons
recorded in its own header.
