# Design system

How components here look, move, and behave. Read it before writing UI code.

This file is not a log. Nothing about one component belongs here. That goes in
the component's file header.

## How it should feel

Native apps feel better than web apps because of how they respond, not how
they look. A native control tracks your finger the whole time you drag it. You
can grab it mid-animation. It has weight, and it settles instead of stopping.
Most web components run on click events and CSS transitions, which fire once
and cannot be interrupted. Closing that gap is the job.

Family names three values for it.

**Simplicity. The component owns the hard part.** Absorb the state machine, the
measurement, the platform bug. Leave nothing for the caller to get wrong. Test:
read the prop table. If using it correctly needs knowing why it was built this
way, it is not finished.

**Fluidity. Nothing teleports.**

- Move things. Do not destroy and recreate them.
- Track the input while it is happening. Do not wait for release.
- A gesture reverses from where it is, not from where it started.
- A label whose text changes crossfades. It never swaps.

**Delight. Spend it where it is rare.**

- Seen constantly (hover, selection, tab switch): almost invisible. If a
  reviewer notices it, cut it.
- Seen sometimes (dialog, drawer, dropdown): full polish.
- Seen once (first copy, install finished, homepage hero): spend a beat more.

A component built around its own signature detail is exempt for that detail
only. The chrome around it is not. A toolbar that opens on every text selection
is constant-tier even if what it does is rare.

## Never

These break theming, accessibility, or the build. Not judgement calls.

- Never hardcode a hex, an rgb, or `text-[13.5px]`. If nothing in the scale
  fits, add a token in `globals.css` and comment it there.
- Never hand-edit `registry.json` or `src/lib/registry.generated.ts`. Both are
  generated from `registry/trovecn/<slug>/meta.ts` and get overwritten on
  `predev` and `prebuild`.
- Never animate `width` or `height` without gating it on `useReducedMotion()`.
- Never put a component's reasoning in `docs/`. It goes in the file header.

Everything else here is a default. Depart from it when the file header names
the reason in one line.

## Traps

The code will not warn you about any of these.

- The animation package is `motion`. Import from `motion/react`.
  `framer-motion` does not resolve.
- Base UI, not Radix. Polymorphism uses `render`, not `asChild`. Pass
  `nativeButton={false}` when `render` targets something that is not a
  `<button>`, or Base UI warns in dev.
- Tailwind v4 has no `tailwind.config.js`. Tokens live in `@theme inline` in
  `globals.css`.
- `--duration-*` is not a Tailwind namespace. Put those four tokens in `@theme`
  and Tailwind emits no utility and drops the variable, so every call site
  falls back to 150ms with no error. They live in `:root` with hand-written
  `@utility` rules beside them. `--ease-*` is a real namespace. `--duration-*`
  is not.
- A popover that opens on `pointerup` dismisses itself. Base UI reads the
  `click` that follows as an outside press. Defer the open by one task.
- Base UI closes a popover before a bubbled React keydown runs. To intercept
  escape, check `details.reason === "escape-key"` in `onOpenChange`.
- `new DOMRect()` at module scope returns a 500. A `"use client"` file still
  runs on the server and Node has no `DOMRect`. Dev hides it, because the
  client render keeps working from cache. Use an object literal cast to
  `DOMRect`.
- Next 16 runs Turbopack by default. There is no `--turbopack` flag.
- Do not extend `src/components/trovecn/ai-workbench`. That collection is
  closed.

## Where the facts are

Values live in code, commented at the definition. Those comments win over this
file.

| What                               | Read                                       |
| ---------------------------------- | ------------------------------------------ |
| Colour tokens, elevation, washes   | `src/app/globals.css`, commented per token |
| Type scale, weights, tracking      | `src/app/globals.css`, `--text-*` block    |
| Shadows (`card`, `well`, `panel`)  | `src/app/globals.css`, commented per class |
| Spring tiers and when to use them  | `src/lib/springs.ts`, JSDoc per tier       |
| Stack and versions                 | `package.json`                             |
| House pattern (`cva`, `data-slot`) | `src/components/ui/button.tsx`             |

## Look

- Left-align headlines, paragraphs, and any multi-line copy. Centred paragraph
  text is the clearest sign a page was filled in from a template. The homepage
  hero is the one exception, centred as a single composition. A second one
  needs an argument.
- `--card` and `--popover` must read as a different plane from `--background`
  at a glance, especially in dark mode. If you cannot see the step in a
  screenshot without zooming, push it further.
- Inside a component, depth is scale, blur, and offset. Never opacity. Fading a
  buried card washes it toward the background and a stack of planes turns into
  a smudge.
- Headings are medium weight. Never bold or semibold. Negative tracking does
  the work.
- No gradients, no stock images, no drop shadows standing in for depth.
- The wordmark is always `trove/cn`. `trove` in `font-sans` and
  `--foreground`, `/cn` in `font-mono` and `--muted-foreground`. No accent
  colour, no display face.
- Component pages show their position in the collection next to the category,
  like `Inputs · 03`.

## Motion

Animate to explain a change. If the only reason is that it looks nicer, do not
animate it.

Import a spring from `@/lib/springs`. The JSDoc says which tier fits what, and
carries the exemption for gesture and physics motion the four tiers cannot
express.

- One focal movement per component. Everything else supports it.
- One cause, one curve. Things moving for the same reason share a spring.
- Exits run faster than enters. A dismissal should read final, not reversed.
- Content waits for its container to make room. On the way out it leaves
  immediately, because a label caught half-covered looks broken and a slightly
  late one does not.
- Read chained timings together. Two animations that hand off are one sequence
  with one length.
- When motion feels wrong, measure how much of it you can see before changing
  the duration. A two pixel movement does not get clearer by lasting longer.
  Make it bigger.
- Layout measured from a new child has one blind frame before any observer
  fires. Measure in a layout effect, keep the last value as a fallback so zero
  cannot reach the geometry, and use `offsetHeight` if an ancestor may be
  mid-transform.

### Reduced motion

`<MotionConfig reducedMotion="user">` is set in `src/app/layout.tsx`. It stops
transform and layout animation and leaves opacity and colour running, so a
dialog fades instead of scaling.

Prefer `transform` and `opacity` and you get that free. Motion's `layout`
animations compile to transforms, so they are fine. Anything else needs its own
`useReducedMotion()` gate.

Keep feedback, drop decoration. A property change that tells the user their
input landed stays on. The travel and overshoot around it goes.

### Two fixes worth knowing

Animating font weight reflows the text, because a heavier weight is wider. Put
an invisible copy of the label at the heaviest weight underneath to hold the
width, and animate `font-variation-settings` on the visible copy. Geist Sans is
already variable.

When a label's text changes, crossfade old and new. Never swap.

## Where code goes

```
src/components/ui/<name>.tsx                    primitive
src/components/trovecn/<collection>/<name>.tsx  pattern
registry/trovecn/<name>/meta.ts                 site metadata
registry/trovecn/<name>/registry.ts             shadcn manifest
registry/trovecn/<name>/examples/<slug>.tsx     worked example
```

Primitives are structural and look the same wherever they are used. Scaffold
one with `npx shadcn add <name>`, then apply the house motion on top. Do not
hand-write a Base UI wrapper, the CLI gets focus, portal, and positioning
right.

Patterns are what people browse and install. Build them from primitives. A
pattern should rarely reach past a primitive into raw Base UI.

Adding a component means adding a `meta.ts`.

Export the reusable piece with real props and no demo content inside it. People
read these files verbatim in the Code tab. Use `"use client"` for motion,
state, or browser APIs. `motion`, `lucide-react`, `cn()`, and
`class-variance-authority` are installed. If you need another dependency, note
it at the top of the file instead of installing it.

### The file header

Everything about one component goes here. Its job and API, its state model
including loading, error, empty, and recovery, its keyboard and screen reader
behaviour, its motion story and reduced-motion version, every departure from
this file with a one-line reason, and every platform behaviour you measured
rather than assumed.

## Demos

- The page shell already centres and frames every example. Do not rebuild that
  framing inside a component.
- Never wrap a demo in `bg-card`. The stage is already recessed to
  `--background` under a `--card` frame, so card-toned content stands out for
  free. A wrapper makes one flat shape with a seam nobody can see.
- If the component animates its own height, reserve the open size in a fixed
  box and centre the content in it. Measure it, do not guess. Otherwise opening
  it resizes the stage and every section below on the page moves.
  `ComponentPreview` cannot help, its stage is a bare flex container by design.
- A component that reacts to scroll needs the demo to make its own scroll
  container and scope the effect to it, with a ref or
  `viewport={{ root: containerRef }}`. The component itself still defaults to
  `window`, which is the real usage, and takes an optional ref so the demo can
  override it. Give the container `rounded-lg border border-border
bg-background shadow-panel`, with the shadow on an outer non-scrolling
  wrapper and `overflow-y-auto` on an inner div, because `shadow-panel`'s inset
  highlight gets clipped on a scrolling element.

## The site

`/` is marketing. `/docs` is the manifesto about why craft matters, and the
homepage CTA lands there rather than on `/docs/components`. It stays out of the
sidebar. `/docs/components/[slug]` is one page per component.

Each `RegistryItem` declares an `examples` array, not one demo. Every example
gets a heading, a one-sentence description, and Preview and Code tabs. Write
API tables by hand from the real prop types, including the obvious props.

No "observed on" credit and no install command on a detail page. Inspiration
belongs in the commit message.

The docs shell is flush, edge to edge, split by hairline borders. No rounded
corners, no gutter, no floating panels. An earlier floating shell looked like a
competitor's site and was removed.

Landing grid cards are not wrapped in a link. The card is the destination and
the caption carries the click, with small controls layered by z-index. An
overlay link with pointer-events holes fights event bubbling on every primitive
and loses.
