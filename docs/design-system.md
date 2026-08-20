# Design system, trove/cn

Direction and judgement for anyone, human or agent, adding a component here.

Values live in code, not in this file. Token hues, type sizes, spring
durations and shadow recipes are all defined and commented at their
definition site, and those comments are the source of truth. This doc covers
what the code cannot say: why the system is shaped this way, and what to do
when something new does not fit.

## Where the facts live

| What                                                          | Read                                       |
| ------------------------------------------------------------- | ------------------------------------------ |
| Colour tokens, elevation, hover and active washes             | `src/app/globals.css`, commented per token |
| Type scale, weights, tracking                                 | `src/app/globals.css`, `--text-*` block    |
| Shadow recipes (`shadow-card`, `shadow-well`, `shadow-panel`) | `src/app/globals.css`, commented per class |
| Spring tiers and which to use when                            | `src/lib/springs.ts`, JSDoc per tier       |
| Stack and versions                                            | `package.json`                             |
| House component pattern (`cva`, `data-slot`, `cn()`)          | `src/components/ui/button.tsx`             |

Never hardcode a hex, an rgb, or a `text-[13.5px]`. If nothing in the scale
fits, add a token and comment it there rather than reaching for an arbitrary
value here.

## How to read this doc

**Contract** is frozen: tokens, type scale, timing source, reduced motion,
registry generation. Departing breaks theming, accessibility, or the build,
so it is not a judgement call.

**Everything else is a convention.** House defaults that are right most of
the time. A component may depart from any of them if its file header names
the reason in one line. That sentence is the whole cost. A convention that
cannot survive a component with a real argument was never much of a
convention.

Precedence: this doc governs how things look and move.
[sourcing.md](sourcing.md) governs what gets built. Neither overrules the
other. See also [ideas.md](ideas.md),
[signature-components.md](signature-components.md), and
[decisions.md](decisions.md) for what was tried and abandoned.

## Things that are not what you would assume

Short list, high value. Each one corrects a belief you probably arrived
with, and the code will not warn you.

- The animation package is **`motion`**, and every import comes from
  `motion/react`. Not `framer-motion`. That path does not resolve.
- Base UI, not Radix. Polymorphism uses a **`render` prop**, not `asChild`.
  Pass `nativeButton={false}` whenever `render` targets something that is
  not a `<button>`, or Base UI warns in dev.
- `src/lib/registry.generated.ts` and `registry.json` are **generated** from
  `registry/trovecn/<slug>/meta.ts`. Adding a component means adding a
  `meta.ts`. Hand-edits get overwritten on the next `predev` or `prebuild`.
- Tailwind v4 has **no `tailwind.config.js`**. Tokens live in `@theme inline`
  in `globals.css`.
- Turbopack is already the default in Next 16. No `--turbopack` flag.

## Concept

A registry of interface patterns observed on real products, rebuilt from
scratch and distributed as copyable source through the shadcn CLI. The site
is itself a docs product: a sidebar of components, one route per component, a
Preview and Code toggle, an install command.

Restrained, not decorative. No gradients, no stock imagery, no drop shadows
standing in for depth. But restraint has to read as a choice rather than as
the unstyled default a template ships with. The premium feel comes from
typographic confidence, left-aligned editorial layout, real separation
between elevation levels, and a few signature details reused consistently.

## Visual language

**Left-align editorial content.** Headlines, paragraphs, and multi-line copy
are left-aligned. Centred paragraph text is the single strongest signal that
a page was filled in from a template rather than laid out. Full centring is
for isolated single elements, a lone icon or a spinner, with one exception:
the homepage hero, centred as one composition. [decisions.md](decisions.md)
records why that exception exists and why it has stayed at one.

**Surfaces must visibly step.** `--card` and `--popover` need to read as a
distinct plane from `--background` at a glance, especially in dark mode. If
you cannot tell a card has a border or fill without zooming into a
screenshot, push the contrast further.

**Headings are medium weight, never bold or semibold.** Negative tracking
does the work weight would otherwise do.

**One signature mark.** The wordmark is always `trove/cn`. `trove` in
`font-sans` and `--foreground`, `/cn` in `font-mono` and
`--muted-foreground`, echoing the CLI install command. No accent hue, no
separate display face. The sans and mono pairing plus the slash is the whole
mark.

**Catalog numbering on component pages.** Each detail page shows its
position in the collection next to its category, for example
`AI Workbench · 03`. Small effort, disproportionate effect on how
intentional the collection reads.

## Motion

Motion is part of a component's behaviour, not decoration. It should make an
action, a state change, or a spatial relationship easier to understand.
Choose the motion story before choosing a token.

### Playbook

Answer these in the component header or the PR description before writing a
transition.

1. **What changed?** Name the event. Input received, a surface opened,
   content replaced, an object changed footprint.
2. **What stays anchored?** Keep the user's reference point still. Move a new
   surface from its trigger or spatial origin.
3. **What moves first?** A surface makes room before its label appears. Old
   content leaves before new content claims the space.
4. **How often is this seen?** Repeated feedback is nearly instant. Larger,
   rarer changes can take a deliberate beat.
5. **What survives reduced motion?** Opacity, colour, and the final state.

If the only answer is "to make it feel nicer," don't animate it. The
exception is a component whose signature detail _is_ the motion, where being
noticed is the job. Say so in the header and skip to the choreography.

### Recipes

| Situation        | Choreography                                                                                       | Avoid                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Press feedback   | Acknowledge input immediately with a small scale or depth change.                                  | Large compression, delayed rebound, animating every child.     |
| Tooltip, popover | Fade and travel a few pixels from the trigger side. The surface arrives as one stable plane.       | A generic bounce, or a long reveal that delays reading.        |
| Menu, select     | The popup arrives quickly. The selected-row highlight follows continuously.                        | Making pointer tracking read as a discrete, lagging animation. |
| Dialog, drawer   | Fade the backdrop, then bring the surface from its spatial origin. Dismiss faster than it entered. | A modal scaling from nowhere, or a sluggish reverse entrance.  |
| Content swap     | Outgoing content leaves faster. Its replacement arrives a few pixels from the direction of change. | Page-like travel for tabs, filters, or frequent swaps.         |
| Expand, collapse | Preserve the surface's identity as its footprint changes, then reveal supporting content.          | Text appearing before its container has made room.             |

One focal movement per component. Child motion supports it rather than
competing with it.

### Timing

Import a tier from `@/lib/springs`. The JSDoc there says which tier suits
what, and carries the exemption for gesture and physics motion that the four
tiers cannot express.

Two rules the tokens encode but do not explain. Exits are faster than enters,
because a dismissal should read crisp and final rather than as the entrance
played backwards. And motion responds to interruption, adapting from its
current position and velocity rather than restarting, which is the whole
reason to use springs over fixed-duration tweens.

### Ration delight

Motion intensity should track how often a user sees it.

- Seen constantly (hover, selection indicators, tab switches): stays almost
  invisible. A hover animation a reviewer notices is usually too much.
- Seen occasionally (dialogs, dropdowns, drawers, switches): full polish, no
  restraint needed.
- Seen rarely or once (a first successful copy, completing an install flow,
  the homepage hero): the one place to spend a beat more personality than
  the tier table requires.

That "too much" line moves for a component built around its own signature
detail. ElasticSlider's rubber band and ScrubField's pointer lock exist to be
noticed. Restraint applies to the chrome around them, not to the thing
itself.

### Reduced motion means fewer and gentler, not none

`<MotionConfig reducedMotion="user">` is wired at the root in
`src/app/layout.tsx`. It kills `transform` and `layout` animation while
leaving opacity and colour running, so a dialog fades instead of scaling.

That only reaches Motion. Prefer `transform` and `opacity`, which stay on the
GPU compositor and get this handling for free. Animating `width` or `height`
directly is a departure needing a stated reason, and such a component must
gate its own movement on `useReducedMotion()`. Motion's `layout` animations
are not a departure, since they compile to transforms.

### Two techniques worth knowing

**Ghost-span for animated font weight.** A heavier weight is wider, so
animating weight on a bare text node reflows the layout. Use an invisible
copy of the label at the heaviest weight to reserve the width, and animate
`font-variation-settings` on the visible copy above it. Geist Sans is already
a variable font.

**Label content morphs, never teleports.** When a label's text changes rather
than just its weight, "Copy" to "Copied" for instance, crossfade old and new
instead of swapping instantly.

### Review checklist

- [ ] Name the motion purpose and use the playbook before choosing a token.
- [ ] Define entry, active state, exit, and interruption.
- [ ] Keep one focal movement. Sequence supporting elements.
- [ ] Test reduced motion. Opacity and colour feedback remains, travel and
      bounce are gone.
- [ ] Replay the demo several times. Judge whether the motion clarifies the
      interaction and settles cleanly, not merely whether it runs.

## Two tiers

Primitives and patterns are different kinds of thing, not the same thing at
different maturity.

**Primitives** (`src/components/ui/<name>.tsx`) are structural. Scaffold with
`npx shadcn add <name>` rather than hand-writing a Base UI wrapper, since the
CLI gets focus, portal, and positioning right. Then apply the house motion
system on top. A primitive looks and moves identically wherever it is
embedded.

**Patterns** (`src/components/trovecn/<collection>/<name>.tsx`) are what gets
browsed and installed. Composed from primitives plus whatever is specific to
that one pattern. A pattern should rarely reach past a primitive into raw
Base UI.

```
src/components/ui/<kebab-name>.tsx                    primitive
src/components/trovecn/<collection>/<kebab-name>.tsx  pattern
registry/trovecn/<kebab-name>/meta.ts                 site metadata
registry/trovecn/<kebab-name>/registry.ts             shadcn manifest entry
registry/trovecn/<kebab-name>/examples/<slug>.tsx     one worked example
```

Component files export the reusable piece with real props and no hardcoded
demo content. They ship through the registry and get read verbatim for the
Code tab, so a stranger will both install and read them. Use `"use client"`
for Motion, state, or browser APIs. `motion`, `lucide-react`, `cn()`, and
`class-variance-authority` are installed. If a component genuinely needs a
new dependency, note it at the top of the file instead of installing it.

## The site

`/` is marketing. `/docs` is the manifesto about why craft matters, which is
where the homepage CTA lands rather than `/docs/components`. It deliberately
does not appear in the sidebar. `/docs/components/[slug]` is one page per
component.

A detail page is a reference, not a screenshot. Each `RegistryItem` declares
an `examples` array rather than a single demo, so every example gets its own
heading, one-sentence description, and Preview and Code tabs. That is what
demonstrates the API instead of one instance doing everything at once. Write
the API tables by hand from the actual prop types, including the obvious
props.

No "observed on" attribution and no install command on the detail page. A
component's inspiration belongs in commit history.

Landing and docs use different shells on purpose. Docs is flush,
edge-to-edge panes split by hairline borders, with no rounded corners,
canvas gutter, or floating chrome. [decisions.md](decisions.md) records what
that replaced. The theme toggle sits in the content pane's own top strip at
every breakpoint, so it is not gated on the `xl`-only info card.

## Building demos

The page shell wraps every example centrally. Don't replicate that framing
in a component; just build the piece.

Don't wrap a demo in `bg-card` to give it a background. The stage is already
recessed to `--background` beneath a `--card` frame, so card-toned content
pops against it for free, and adding a wrapper recreates a real bug recorded
in [decisions.md](decisions.md).

A component reacting to scroll needs its **demo** file to make its own
scrollable container and scope the effect to it, either by attaching
listeners to a ref instead of `window` or by passing
`viewport={{ root: containerRef }}`. The component itself should still
default to `window`, since that is the real usage, and accept an optional ref
so the demo can override it. Give that container real elevation:
`rounded-lg border border-border bg-background shadow-panel`, with the shadow
on an outer non-scrolling wrapper and `overflow-y-auto` on an inner div,
because `shadow-panel`'s inset highlight gets clipped on a scrolling element.
