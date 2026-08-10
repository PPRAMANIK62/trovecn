# Design System — "trove/cn"

Reference doc for anyone (human or agent) adding a component to this repo.
Read this before writing UI code — it exists so six people can build six
different components in parallel and have them look like one product.

## Concept

A registry of interface patterns observed on real sites (Apple, Linear,
Stripe, Vercel, Framer, Raycast, …), rebuilt from scratch and distributed as
copyable source via the shadcn CLI — the same distribution model as
`ui.shadcn.com`. The site itself is a docs product: a sidebar of components,
one route per component, a Preview/Code toggle, an install command.

Restrained, not decorative — no gradients, no stock imagery, no drop shadows
standing in for depth. But restraint has to read as a deliberate choice, not
the unstyled default a template ships with. The premium feel comes from
typographic confidence, left-aligned editorial layout, real surface
separation between elevation levels, and a small number of signature details
reused consistently (see "Visual language" below) — not from adding
decoration.

Full component backlog lives in `docs/ideas.md`.

## Stack

- Next.js 16 (App Router, Turbopack is the default — no `--turbopack` flag
  needed). React 19.2.
- Tailwind CSS v4 (`@theme inline` token system in `src/app/globals.css`,
  no `tailwind.config.js`).
- shadcn CLI, `base-nova` style, built on **Base UI** primitives
  (`@base-ui/react`) — not Radix. See `src/components/ui/button.tsx` for the
  house pattern: `cva` for variants, `data-slot="..."` attribute on the root
  element, `cn()` from `@/lib/utils` for class merging. Base UI uses a
  `render` prop for polymorphism (not Radix's `asChild`) — e.g.
  `<Button render={<Link href="/x" />} nativeButton={false}>Text</Button>`.
  Pass `nativeButton={false}` whenever `render` targets a non-`<button>`
  element (a link, for example) — Base UI warns in dev otherwise.
- Framer Motion for animation.
- Shiki for syntax-highlighted code blocks (`src/lib/highlight.ts`),
  rendered server-side.
- TypeScript everywhere. Path alias `@/*` → `src/*`.

## Design tokens (src/app/globals.css)

Structural tokens (surfaces, borders, `--primary`, `--accent`) stay
zero-chroma gray — `--primary` is ink for the default button fill and
`--accent` is a plain hover fill, neither is a brand color, so both stay
neutral in both themes. `--ring` and `--link` are the exception: they
deliberately share one blue hue (~265 in OKLCH) as the app's interaction
accent for focus rings and links. `--accent-blue`/`--accent-blue-hover`
carry that same hue too, but scoped to a single consumer — Switch's checked
track — not a general-purpose token other components should reach for.
`--destructive` is its own semantic red, unrelated to any of the above.
Components are distributed as source into other codebases, so a consumer
that wants zero accent hue can override `--ring`/`--link`/`--accent-blue`
back to gray, same as they'd override any other token here. Light is the
default theme; dark is toggled via a `.dark` class on `<html>` (see
`ThemeToggle`, `src/components/site/theme-toggle.tsx`) — always reach for
the CSS variables below via Tailwind's `bg-*`/`text-*`/`border-*` utilities,
never hardcode hex/rgb, so both themes stay correct automatically.

| Token                                   | Role                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--background`                          | page background                                                                                                                                                 |
| `--foreground`                          | primary text                                                                                                                                                    |
| `--card` / `--card-foreground`          | panel surface one step off background (code blocks, install command pill)                                                                                       |
| `--popover` / `--popover-foreground`    | floating surfaces (menus, command palette)                                                                                                                      |
| `--primary` / `--primary-foreground`    | near-black/near-white — default button fill. Not a "brand color," just ink.                                                                                     |
| `--link`                                | blue interaction-accent hue. Inline links; active sidebar item still leans on underline/weight, not just color. Exposed as `text-link`/`border-link`/`bg-link`. |
| `--accent` / `--accent-foreground`      | neutral gray hover fill — ghost / nav items, expanded accordion items, menu highlight                                                                           |
| `--accent-blue` / `--accent-blue-hover` | the same blue hue as `--ring`/`--link`, bolder, for Switch's checked track only — a filled control, not a hover wash, so it needs more saturation               |
| `--secondary`, `--muted` + foregrounds  | neutral gray panels and secondary text                                                                                                                          |
| `--border` / `--input`                  | hairline gray borders — thin lines, not boxy chrome                                                                                                             |
| `--ring`                                | focus ring — same blue interaction-accent hue as `--link`                                                                                                       |
| `--radius`                              | `0.5rem` base — modest corners, not sharp/brutalist and not bubbly                                                                                              |

Fonts (wired in `layout.tsx` / `globals.css`):

- `font-sans` → Geist Sans — body copy, UI labels, **and headings**. There is
  no separate display face; don't reintroduce one without updating this doc.
- `font-mono` → Geist Mono — code, catalog numbers, metadata labels.

### Type scale

Small and tight, not the 16px-body/36px-heading defaults Tailwind's named
steps assume. Defined once
as `@theme` font-size tokens in `globals.css` (same pattern as the color
tokens above), each its own named utility — `text-display`, `text-title`,
etc. — rather than repeated `text-[13.5px]` one-offs scattered across
components. Sizes that always carry a fixed weight/tracking (headings,
uppercase labels) bake that into the token via `--text-*--font-weight` /
`--text-*--letter-spacing`, Tailwind v4's companion-variable mechanism, so
the utility alone applies the full treatment. Headings are **medium weight,
never bold/semibold**; negative tracking does the work weight would
otherwise do.

| Use                                               | Utility                | Size    |
| ------------------------------------------------- | ---------------------- | ------- |
| Landing headline                                  | `text-display`         | 32–52px |
| Page title (docs `<h1>`)                          | `text-title`           | 27px    |
| Lede (intro paragraph under a page title)         | `text-lede`            | 15px    |
| Body / panel copy                                 | `text-body`            | 13.5px  |
| Card title, row name, control label               | `text-control`         | 13.5px  |
| Secondary copy, inline code, links                | `text-caption`         | 13px    |
| Sidebar row, breadcrumb                           | `text-minor`           | 12.5px  |
| Section label / column header (uppercase eyebrow) | `text-label uppercase` | 11px    |
| Plain small mono/status line                      | `text-2xs`             | 11px    |
| Metadata, source paths                            | `text-meta`            | 10.5px  |
| Catalog numbers, tabular badges                   | `text-micro`           | 9.5px   |

Reach for one of these tokens rather than a nearest named Tailwind step
(`text-sm`, `text-lg`, …) or a fresh `text-[…px]` arbitrary value — the
whole point of this scale is that it doesn't line up with Tailwind's
defaults, and a new one-off value defeats the point of it being a shared
scale at all. If nothing here fits, add a new `--text-*` token to
`globals.css` and a row to this table rather than reaching for `text-[…]`
inline.

## Visual language

Concrete rules, not vibes — these are what separates "restrained" from
"looks unfinished":

- **Left-align editorial content.** Headlines, paragraphs, and multi-line
  copy are left-aligned. Centered paragraph text is what makes a page read
  as a template someone filled in rather than a page someone laid out. Full
  centering is reserved for isolated single elements (a lone icon, a
  spinner) — never a headline or a block of body copy — with exactly one
  deliberate exception: the homepage hero (see "Landing vs. docs alignment"
  below). Nothing else gets this exception; a second centered block anywhere
  else reopens the "looks like a template" problem this rule exists to
  prevent.
- **Surfaces must visibly step.** `--card` / `--popover` need to read as a
  distinct plane from `--background` at a glance, especially in dark mode —
  not a background that's 3% lighter with a border nobody notices. If you
  can't tell a card has a border/fill without zooming into a screenshot,
  push the contrast further.
- **One signature mark, reused everywhere.** The wordmark is always
  `trove/cn` — `trove` sits in `font-sans` / `--foreground` (the house
  weight/tracking, same as any other text) and `/cn` sits in `font-mono` /
  `--muted-foreground`, echoing the CLI install command. No accent hue and no
  separate display face — the sans/mono pairing plus the slash is the whole
  mark. Both pieces appear exactly once per instance (header, footer,
  anywhere else it shows up). Don't invent additional flourishes or logo
  variants; consistency of the one mark is the point.
- **Catalog numbering on component pages.** Each component detail page shows
  its position in the collection next to its category, e.g.
  `Hero & Marketing · 03`. It signals a curated, ordered set rather than an
  arbitrary list — small effort, disproportionate effect on how intentional
  the collection feels.

### Landing vs. docs alignment

The homepage hero (badge, headline, one subhead line, CTA row — see
`src/components/site/hero.tsx`) is centered as one composition; the
component-preview grid below it (`src/components/site/landing-showcase.tsx`)
is centered _as a block_ on the page (`mx-auto max-w-6xl`), but each tile's
own title/caption stays left-aligned inside the tile, not centered text.
Docs pages stay fully left-aligned editorial content, unchanged. The line is
drawn at "one hero moment, centered, once" — a centered _paragraph_, a
centered _list of captions_, or a second centered section anywhere on the
site reopens the "looks like a template" problem the left-align rule above
exists to prevent. When in doubt, left-align; centering needs to earn its
place as a one-time marketing beat, not a default.

### Preview-grid tile pattern

`LandingTile` (inside `landing-showcase.tsx`) reuses `ComponentPreview`'s
visual recipe — a lifted `shadow-card` frame around a recessed `shadow-well`
stage — but drops its footer/replay-button strip and moves the caption
below the tile instead. The two aren't the same component because they do
different jobs: `ComponentPreview` is a _reference_ affordance on a
component's own doc page (replay the demo, read the label, flip to Code);
`LandingTile` links into `/docs/components/[slug]` too, but only the caption
below the stage is the `<Link>` — there's no tile-wide overlay anchor. An
earlier version covered the whole tile with an absolutely-positioned `<Link>`
and tried to punch `pointer-events-auto` holes back through it for the demo's
own interactive elements; that fought event bubbling and stacking contexts
per primitive (Base UI's switch renders as `<span role="switch">` rather than
a `<button>`, for one) and a click could still leak through to the overlay
even after landing on the control underneath. transitions.dev, the reference
this pattern is modeled on, doesn't wrap its cards in a link at all — each
card is the destination, with its own small controls layered by z-index, not
a navigation affordance. `LandingTile` follows that: the stage is normally
interactive (no `pointer-events-none`, no z-index games), and the caption
alone carries the click-through into the docs page.

## Motion & interaction principles

Motion is part of a component's behaviour, not decoration. It should make an
action, state change, or spatial relationship easier to understand. Choose
the component's motion story before choosing a token.

### Motion playbook

Before writing a transition, answer these questions in the component header
comment or PR description:

1. **What changed?** Name the event: input was received, a surface opened,
   content was replaced, or an object changed footprint.
2. **What stays anchored?** Keep the user's point of reference still; move a
   new surface from its trigger or spatial origin.
3. **What moves first?** A surface makes room before its label appears. Old
   content leaves before new content claims the same space.
4. **How often is this seen?** Repeated feedback is nearly instant. Larger,
   rarer spatial changes can take a deliberate beat.
5. **What remains with reduced motion?** Preserve opacity, colour, and the
   final state; remove travel, scale, parallax, and bounce.

If the answer is only "to make it feel nicer," do not animate it.

### Quality recipes

| Situation         | Choreography                                                                                           | Avoid                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Press feedback    | Acknowledge input immediately with a tiny scale or depth change.                                       | Large compression, delayed rebound, or animating every child.            |
| Tooltip / popover | Fade and travel a few pixels from the trigger side; the surface arrives as one stable plane.           | A generic bounce or a long reveal that delays reading.                   |
| Menu / select     | The popup arrives quickly; the selected-row highlight follows continuously.                            | Making pointer tracking feel like a discrete, lagging animation.         |
| Dialog / drawer   | Fade the backdrop, then introduce the surface from its spatial origin; dismiss faster than it entered. | A modal that simply scales from nowhere, or a sluggish reverse entrance. |
| Content swap      | Let outgoing content leave faster; bring its replacement in a few pixels from the direction of change. | Page-like travel for tabs, filters, or frequent swaps.                   |
| Expand / collapse | Preserve the surface's identity as its footprint changes, then reveal supporting content.              | Text appearing before its containing surface has made room.              |

Use one focal movement per component. Child motion supports that movement; it
does not compete with it. Gesture-triggered motion must be interruptible:
reversing a hover, close, or drag continues from its current position.

**Spring tokens (`@/lib/springs`).** Four tiers, each an enter spring paired
with a faster, bounce-free exit tween:

| Token             | Enter                       | Exit           | Use for                                                                                                                                                   |
| ----------------- | --------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spring.fast`     | duration 0.08s, bounce 0    | duration 0.06s | Continuous, pointer-tracked motion only — proximity-hover pills, live highlight rects that follow the cursor. Never a discrete click/open, however small. |
| `spring.quick`    | duration 0.14s, bounce 0.1  | duration 0.1s  | One-shot feedback that isn't continuously tracked: tooltips, preview cards, icon crossfades, small entrance staggers.                                     |
| `spring.moderate` | duration 0.2s, bounce 0.12  | duration 0.15s | Short travel / small expansion (dropdown & tab indicators, switch thumb, accordions) and panels that must land exactly (selection merge/split)            |
| `spring.slow`     | duration 0.32s, bounce 0.18 | duration 0.22s | Large surfaces: dialogs, side panels/drawers, stepped flows                                                                                               |

**Rule:** the bigger the thing that moves, the slower the tier. No component
invents its own duration — always import the token from `@/lib/springs`.
`fast` is reserved for motion that tracks the pointer in real time; if it's
triggered by a discrete click or open, it belongs on `quick` or above even
if it's visually small — a tooltip is not the same category as a hover wash.

**Exits are faster than enters.** A dismissal should read crisp and final,
not like the entrance playing in reverse — that's why each tier's exit is a
quicker, bounce-free tween rather than the same spring run backward. Every
tier's exit also rides a strong custom ease-out (`cubic-bezier(0.23, 1,
0.32, 1)`), never a bare `ease`/`easeOut` keyword — built-in easings are too
weak to read as deliberate.

**Springs respond to interruption.** If a user reverses mid-transition
(closes a panel they just opened, hovers off before a highlight finishes
landing), the animation should adapt from its current position and velocity,
not restart or snap. This is what spring physics buys over fixed-duration
tweens — use it deliberately, not as an aesthetic default.

**Delight is rationed, not sprinkled evenly.** Motion intensity should track
how often a user sees it, not how good it could theoretically look:

- Seen constantly (hover, selection indicators, tab switches) — `fast`,
  stays almost invisible. If a reviewer _notices_ a hover animation, it's
  already too much.
- Seen occasionally (dialogs, dropdowns, drawer, switch) — `moderate`/`slow`,
  full spring polish, no restraint needed.
- Seen rarely or once (first successful copy, completing an install flow,
  the homepage Hero) — this is the one place a component is allowed a beat
  more personality than the tier table strictly requires. Don't spend this
  budget on anything a user sees twice a session.

**Transform/opacity only.** Animate `transform` and `opacity`, never `top` /
`left` / `width` / `height`. Keeps motion on the GPU compositor and is what
makes automatic reduced-motion handling (below) possible in the first place.

**Reduced motion — fewer and gentler, not none.** Wire
`<MotionConfig reducedMotion="user">` at the root (`src/app/layout.tsx`).
This automatically disables `transform`/`layout` animation while leaving
opacity and color transitions running — a dialog fades in instead of
scaling, a drawer appears in place instead of sliding. Only works for
components that follow the transform/opacity-only rule above; a component
that animates `top`/`left`/`width`/`height` directly must gate its own
movement on `useReducedMotion()`. `<ViewTransition>` motion is a separate
mechanism `MotionConfig` doesn't reach — directional slides get their own
`prefers-reduced-motion` rule that drops `animation-duration` to `0s` on
`::view-transition-*` pseudo-elements, same reasoning as `toast.tsx`'s
standalone reduced-motion rule for its non-Motion transitions.

**Ghost-span for animated font-weight.** State changes (selected / checked /
active / open) that make text heavier will reflow the layout if animated on
a bare text node, because a heavier weight is wider. Use an invisible copy
of the label at the heaviest weight to reserve the width, and animate
`font-variation-settings` on the visible copy on top of it. Requires a
variable font (Geist Sans already is one).

**Label content morphs, never teleports.** When a label's _text_ changes
(not just its weight) — "Copy" → "Copied", a tab's active language label, a
toast's status line — crossfade the old and new content on `spring.quick`
rather than swapping instantly. Same underlying idea as the ghost-span rule
above (an in-place state change should never read as a cut), just for
content instead of weight.

**One well-orchestrated entrance per component** (a staggered reveal) beats
animating everything at once — still true regardless of tier.

## Site structure

This is a multi-page docs site, not a single scrolling showcase:

```
/                              — marketing landing page, links into /docs
/docs                          — the manifesto: why craft matters, not a
                                  feature/install checklist. This is what
                                  the homepage's "Browse components" CTA
                                  lands on, not /docs/components directly.
/docs/components               — index of all components, grouped by category
/docs/components/[slug]        — one page per component (named examples,
                                  each with Preview/Code tabs, plus API
                                  reference tables)
```

The docs layout's right-pane navbar (`src/app/docs/layout.tsx`) shows a
breadcrumb trail (`src/components/site/breadcrumbs.tsx`) on the left —
Docs / Components / [name] — and the theme toggle on the right. `/docs`
itself isn't listed in the left sidebar (`DocsSidebar`); it's reached via
the homepage CTA or the breadcrumb root, not as a persistent nav item.

`src/lib/components-registry.ts` is the single source of truth for site
metadata (title, description, category, dependencies, the named `examples`
and their demo files, the `api` reference tables). When you add a component,
add an entry there — the sidebar, the components index, and the detail page
all read from it. `registry.json` is the separate shadcn-build manifest
(`npm run registry:build`) and needs the same entry added independently; the
two are intentionally not derived from each other.

No "observed on"/"source site" attribution and no install-command section on
the detail page — a component's real-world inspiration (if any) belongs in
conversation/commit history, not in `RegistryItem` or the rendered page.

## Shell architecture

Landing and docs use two different shells, on purpose — they're different
kinds of page, not two skins on one mechanism.

**Landing** (`src/app/page.tsx`) is full-bleed, normal document scroll.
`SiteHeader` (`src/components/site/site-header.tsx`) is a `sticky top-0`
header — `border-b` + `bg-background/85 backdrop-blur-md` — with a
`max-w-6xl` inner container. Content just starts below it in normal flow;
no gradient-fade overlay is needed to mask content passing under the nav,
because content never passes _under_ it — the header sits ahead of the
content in document order, not layered on top of it.

**Docs** (`src/app/docs/layout.tsx`) is a fixed, edge-to-edge 3-pane shell —
sidebar | content | info card — each pane scrolling independently, at
`lg`/`xl` breakpoints. Flush panes with plain `border` seams, no rounded
corners, no canvas gutter, no floating/overlapping chrome — a deliberately
different visual language from the removed `AppFrame` mechanism: flush
panes reading as one continuous surface, split by hairline borders, is a
different shape than rounded panels floating with margin around them (the
thing that actually converged on a competing site's look). Below `lg`, the
sidebar and info-card panes disappear entirely and
the content pane becomes the whole shell, with its own compact top strip
(`Brand` + `DocsMobileSidebar`'s drawer trigger) standing in for the
sidebar's branding.

Each pane is its own `flex flex-col` with a `shrink-0` header strip above a
`flex-1 overflow-y-auto` scroll box — no absolute positioning, no backdrop
blur, because no pane's content ever passes under another pane's chrome.
`DocsSidebar` and `DocsPageTransition` are unchanged from before; both were
always agnostic to what container scrolls them.

**Right-rail info card** (`src/components/site/docs-info-card.tsx`,
`xl:` and up): a single floating card, not a persistent nav surface — a
GitHub link with a live star count (fetched server-side in
`docs/layout.tsx`, `next: { revalidate: 3600 }`, `src/lib/site-config.ts`
holds the repo/owner/X-profile constants) and a "Created by" credit. The
theme toggle deliberately does _not_ live here — it's pinned in the content
pane's own top strip at every breakpoint, so it isn't gated on whether the
`xl:`-only info card happens to be visible.

## Two tiers: primitives, then patterns

`src/components/ui/` (primitives) and `registry/trovecn/` (patterns) are
different tiers, not the same kind of thing at different maturity:

- **Primitives** (`src/components/ui/<name>.tsx`) are structural —
  Dialog, Popover, Menu, Tooltip, Accordion, Switch, Tabs. Scaffold each via
  `npx shadcn add <name>` (style `base-nova`, per `components.json`) rather
  than hand-writing a Base UI wrapper — the CLI generates the correct
  Base UI binding, focus/portal/positioning behavior included. Once
  scaffolded, apply the house motion system on top: the right
  `@/lib/springs` tier for what the primitive does, its elevation step,
  proximity hover if it's a list/grid of interactive items. A primitive
  should look and move identically no matter which pattern below embeds it.
- **Patterns** (`registry/trovecn/<name>/`) are what actually gets
  browsed/installed — a specific interface moment observed on a real site
  (blur navbar, command palette, bento grid). Built by composing primitives
  plus whatever's specific to that one observed pattern; a pattern file
  should very rarely need to reach past a primitive into raw Base UI itself.

See `docs/ideas.md` for the current primitive checklist and the reasoning
for building it before the pattern backlog.

## Component conventions

Each pattern piece lives at:

```
registry/trovecn/<kebab-name>/<kebab-name>.tsx        — the component itself
```

- `<kebab-name>.tsx` exports the reusable component(s) with real props (no
  hardcoded demo content baked into the primitive). Primitives instead live
  at `src/components/ui/<kebab-name>.tsx` (scaffolded via `npx shadcn add`,
  see "Two tiers" above) — either way, this is the file that ships through
  the registry and gets read verbatim for a Code tab, so treat its API and
  formatting as something a stranger will both `npx shadcn add` and read.
- Use `"use client"` where needed (anything with Framer Motion, state, or
  browser APIs).
- Dependencies: `framer-motion`, `lucide-react`, `clsx`/`tailwind-merge`
  (via `cn()`), and `class-variance-authority` are already installed — use
  them rather than adding new packages. If a component genuinely needs a
  new dependency, note it clearly at the top of the file instead of
  installing it yourself.

### Motion review checklist

Before considering an interactive component complete:

- [ ] Name the component's motion purpose and use the Motion playbook above
      to choose its choreography before choosing a spring token.
- [ ] Define the entry, active-state, exit, and interruption behaviour. A
      fast repeated interaction should feel nearly instant.
- [ ] Keep one focal movement; sequence supporting elements instead of
      starting every child animation at once.
- [ ] Test reduced motion: useful opacity/colour feedback remains, while
      travel, scale, layout movement, and bounce are removed where needed.
- [ ] Replay the demo several times. Judge whether the motion clarifies the
      interaction and settles cleanly, not merely whether it runs.

### Component pages: named examples, not one generic demo

A component detail page (`/docs/components/[slug]`) is a reference, not a
screenshot. Each `RegistryItem` (`src/lib/components-registry.ts`) declares
an `examples: ComponentExample[]` array instead of a single `Demo` — every
example gets its own heading, one-sentence description, and its own
Preview/Code tabs, e.g. Accordion's "Standalone" / "Single expand" / "Multi
expand". This is what actually demonstrates the API surface (props,
variants, edge cases) instead of one component instance doing everything at
once.

```
registry/trovecn/<kebab-name>/examples/<example-slug>.tsx   — one worked example, default export
```

- Each example file is self-contained (no required props, no page-level
  context) and is read verbatim via `readFileSync` for its own Code tab —
  same "file is the single source of truth for both the demo and the
  displayed code" principle as a primitive/pattern file, just scoped to one
  example instead of the whole component.
- `RegistryItem.api: ApiSection[]` supplies one `Prop | Type | Default |
Description` table per exported piece (e.g. separate tables for
  `Accordion`, `AccordionItem`, `AccordionTrigger`,
  `AccordionContent`) — write these by hand from the component's actual
  prop types, don't skip them for "obvious" props.
- The page shell also renders Previous/Next links between components
  (`getAdjacentComponents` in `components-registry.ts`), derived from
  registry order — nothing to add per-component beyond registering it.

## Demoing scroll-driven effects

The component detail page renders each demo inside a bounded preview box
(`min-h-96`, `overflow-hidden`), not the full page. If your component reacts
to scroll (a navbar that changes on scroll, a scroll-triggered reveal), your
**demo** file must create its own internal scrollable container (e.g. a
`div` with fixed height and `overflow-y-auto`) and scope the effect to that
container — either by attaching scroll listeners to a ref instead of
`window`, or, for Framer Motion's `whileInView`, passing
`viewport={{ root: containerRef }}`. The reusable component in
`<kebab-name>.tsx` should still default to `window`/global scroll (that's
the real-world usage), but accept an optional container ref/prop so the demo
can override it.

That scrollable container is real surface, not scaffolding — see the next
section for how to style it.

## Presentation shell (site-level, not per-component)

`src/app/docs/components/[slug]/page.tsx` wraps the whole page (category
label, title, description, Previous/Next nav) and wraps each example in
`item.examples` with a `ComponentPreview` card
(`src/components/site/component-preview.tsx`) plus its own Preview/Code tabs
(`src/components/ui/tabs.tsx`, a Base UI `Tabs` wrapper). Components and
examples themselves should not try to replicate this framing — just build
the piece; the page shell is provided centrally.

The Preview tab's stage uses `bg-background`, recessed one level down from
the card's own `bg-card` frame via `shadow-well` — the frame steps _up_ to
`--card`, the stage steps back _down_ to `--background`, so demo content
that already sits on `--card`/`--popover` (most of the registry) pops
against the recessed stage automatically, for free. Don't second-guess this
and add a `bg-card` wrapper div around a demo "to give it a background" —
that recreates the exact bug this fixed: a card-toned box against a
card-toned stage reads as one flat shape with a nearly-invisible seam, no
matter how crisp the border is (this happened for real — the first
`blur-navbar` and `scroll-text-reveal` demos each wrapped their own
`overflow-y-auto` scroll container in `border-border bg-card`, identical to
the stage they sat on).

`src/components/site/landing-showcase.tsx`'s `LandingTile` reuses this same
frame/stage recipe for the homepage preview grid (see "Preview-grid tile
pattern" above) — same elevation logic, no footer strip.

If your demo needs its own bounded scroll container (see "Demoing
scroll-driven effects" above), give _that_ container real elevation instead
of just a border: `rounded-lg border border-border bg-background
shadow-panel`. Put the shadow/clipping on an outer, non-scrolling wrapper
and the `overflow-y-auto`/ref on an inner div — `shadow-panel`'s inset
highlight gets clipped if it lives on the same element that scrolls.
