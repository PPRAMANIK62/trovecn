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
