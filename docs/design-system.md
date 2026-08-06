# Design System — "Trovecn"

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

Fully neutral, zero-chroma palette — no accent color anywhere, including
`--link`, active nav state, and focus rings. Deliberate: components in this
registry are distributed as source into other codebases that already ship
their own theme tokens, so a plain gray default (not a custom brand hue) is
what stays compatible with whatever palette a consumer overrides these
tokens with. `--destructive` is the sole exception — a semantic error state,
not a brand accent. Light is the default theme; dark is toggled via a
`.dark` class on `<html>` (see
`ThemeToggle`, `src/components/site/theme-toggle.tsx`) — always reach for
the CSS variables below via Tailwind's `bg-*`/`text-*`/`border-*` utilities,
never hardcode hex/rgb, so both themes stay correct automatically.

| Token                                  | Role                                                                                                                                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--background`                         | page background                                                                                                                                                                                                             |
| `--foreground`                         | primary text                                                                                                                                                                                                                |
| `--card` / `--card-foreground`         | panel surface one step off background (code blocks, install command pill)                                                                                                                                                   |
| `--popover` / `--popover-foreground`   | floating surfaces (menus, command palette)                                                                                                                                                                                  |
| `--primary` / `--primary-foreground`   | near-black/near-white — default button fill. Not a "brand color," just ink.                                                                                                                                                 |
| `--link`                               | same neutral as `--foreground` — no accent hue. Active sidebar item, inline links, and focus rings are carried by underline/weight instead of color. Exposed as `text-link` / `border-link` / `bg-link` via `--color-link`. |
| `--accent` / `--accent-foreground`     | hover fill for ghost / nav items                                                                                                                                                                                            |
| `--secondary`, `--muted` + foregrounds | neutral gray panels and secondary text                                                                                                                                                                                      |
| `--border` / `--input`                 | hairline gray borders — thin lines, not boxy chrome                                                                                                                                                                         |
| `--ring`                               | focus ring — neutral gray, not tinted                                                                                                                                                                                       |
| `--radius`                             | `0.5rem` base — modest corners, not sharp/brutalist and not bubbly                                                                                                                                                          |

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
  copy are left-aligned, including on the marketing homepage. Centered
  paragraph text is what makes a page read as a template someone filled in
  rather than a page someone laid out. Full centering is reserved for
  isolated single elements (a lone icon, a spinner) — never a headline or a
  block of body copy.
- **Surfaces must visibly step.** `--card` / `--popover` need to read as a
  distinct plane from `--background` at a glance, especially in dark mode —
  not a background that's 3% lighter with a border nobody notices. If you
  can't tell a card has a border/fill without zooming into a screenshot,
  push the contrast further.
- **One signature mark, reused everywhere.** The wordmark is always
  `Trovecn[.]dev` — the bracket `[.]` sits in `--link` (same neutral
  foreground, no accent hue) and the trailing `dev` sits in
  `--muted-foreground` (subdued, echoing the domain). Both appear exactly
  once per instance of the wordmark (header, footer, anywhere else it shows
  up). Don't invent additional flourishes or logo variants; consistency of
  the one mark is the point.
- **Catalog numbering on component pages.** Each component detail page shows
  its position in the collection next to its category, e.g.
  `Hero & Marketing · 03`. It signals a curated, ordered set rather than an
  arbitrary list — small effort, disproportionate effect on how intentional
  the collection feels.

## Motion & interaction principles

Motion and interaction are functional, not decorative. Supersedes the old
"deliberate and weighted, 0.4–0.8s, avoid springs" guidance — the whole
premise inverts to fast, spring-based, information-carrying motion.

**Motion as information.** An animation exists only to make a state change
legible — something opened, something is now selected, focus moved
somewhere. If a transition doesn't clarify a state change, cut it. This is
the test every other rule below serves.

**Spring tokens (`@/lib/springs`).** Three tiers, each an enter spring paired
with a faster, bounce-free exit tween:

| Token             | Enter                       | Exit           | Use for                                                                                                                                                       |
| ----------------- | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spring.fast`     | duration 0.08s, bounce 0    | duration 0.06s | Hover, focus rings, fades, tooltips, selection indicators                                                                                                     |
| `spring.moderate` | duration 0.16s, bounce 0    | duration 0.12s | Short travel / small expansion (dropdown & tab indicators, switch thumb, accordions) and panels that must land exactly (mobile drawer, selection merge/split) |
| `spring.slow`     | duration 0.24s, bounce 0.12 | duration 0.16s | Large surfaces: dialogs, side panels, stepped flows                                                                                                           |

**Rule:** the bigger the thing that moves, the slower the tier. No component
invents its own duration — always import the token from `@/lib/springs`.

**Exits are faster than enters.** A dismissal should read crisp and final,
not like the entrance playing in reverse — that's why each tier's exit is a
quicker, bounce-free tween rather than the same spring run backward.

**Springs respond to interruption.** If a user reverses mid-transition
(closes a panel they just opened, hovers off before a highlight finishes
landing), the animation should adapt from its current position and velocity,
not restart or snap. This is what spring physics buys over fixed-duration
tweens — use it deliberately, not as an aesthetic default.

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
movement on `useReducedMotion()`.

**Proximity hover.** In interactive lists/grids/nav (sidebar items, table
rows, card grids), highlight the item nearest the cursor before the user
clicks — it previews where an action will land and reduces targeting
errors. A subtle, non-decorative polish move, not a new visual language.

**Elevation is a system, not a per-component judgment call.** This project
already treats `--canvas` → `--background` → `--card` → `--popover` as
successive planes ("Surfaces must visibly step," above). Treat that ladder
as the formal elevation order: a component stacking on top of another
surface (a dropdown inside a dialog, a tooltip inside a popover) steps up
exactly one level from what it's layered on — never skip a level, never
reuse the level underneath it.

**Ghost-span for animated font-weight.** State changes (selected / checked /
active / open) that make text heavier will reflow the layout if animated on
a bare text node, because a heavier weight is wider. Use an invisible copy
of the label at the heaviest weight to reserve the width, and animate
`font-variation-settings` on the visible copy on top of it. Requires a
variable font (Geist Sans already is one).

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

The Preview tab's stage uses `bg-canvas` — one step _below_ `--background`,
the same relationship `AppFrame` uses between its gutter and `Panel`. Demo
content that already sits on `--card`/`--popover` (most of the registry)
pops against it automatically, for free. Don't second-guess this and add a
`bg-card` wrapper div around a demo "to give it a background" — that
recreates the exact bug this fixed: a card-toned box against a card-toned
stage reads as one flat shape with a nearly-invisible seam, no matter how
crisp the border is (this happened for real — the first `blur-navbar` and
`scroll-text-reveal` demos each wrapped their own `overflow-y-auto` scroll
container in `border-border bg-card`, identical to the stage they sat on).

If your demo needs its own bounded scroll container (see "Demoing
scroll-driven effects" above), give _that_ container real elevation instead
of just a border: `rounded-lg border border-border bg-background
shadow-panel`. Put the shadow/clipping on an outer, non-scrolling wrapper
and the `overflow-y-auto`/ref on an inner div — `shadow-panel`'s inset
highlight gets clipped if it lives on the same element that scrolls.
