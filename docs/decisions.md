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
