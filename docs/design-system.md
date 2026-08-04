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
- `font-mono` → Geist Mono — install commands, code, provenance labels.

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

## Motion principles

- Deliberate and weighted, not snappy/bouncy. Favor `ease: [0.16, 1, 0.3, 1]`
  or Framer's `easeOut` over spring unless a spring genuinely reads as
  premium (e.g. a magnetic button). Prefer duration 0.4–0.8s over the
  0.15–0.2s common in generic UI kits.
- One well-orchestrated entrance per component (staggered reveal) beats
  animating everything.
- Respect `prefers-reduced-motion`.

## Site structure

This is a multi-page docs site, not a single scrolling showcase:

```
/                              — marketing landing page, links into /docs
/docs                          — the manifesto: why craft matters, not a
                                  feature/install checklist. This is what
                                  the homepage's "Browse components" CTA
                                  lands on, not /docs/components directly.
/docs/components               — index of all components, grouped by category
/docs/components/[slug]        — one page per component (Preview/Code tabs,
                                  install command, dependencies)
```

The docs layout's right-pane navbar (`src/app/docs/layout.tsx`) shows a
breadcrumb trail (`src/components/site/breadcrumbs.tsx`) on the left —
Docs / Components / [name] — and the theme toggle on the right. `/docs`
itself isn't listed in the left sidebar (`DocsSidebar`); it's reached via
the homepage CTA or the breadcrumb root, not as a persistent nav item.

`src/lib/components-registry.ts` is the single source of truth for site
metadata (title, description, category, source sites, dependencies, which
file to read for the Code tab, which demo component to render). When you add
a component, add an entry there — the sidebar, the components index, and the
detail page all read from it. `registry.json` is the separate shadcn-build
manifest (`npm run registry:build`) and needs the same entry added
independently; the two are intentionally not derived from each other.

## Component conventions

Each first-batch piece lives at:

```
registry/trovecn/<kebab-name>/<kebab-name>.tsx        — the component itself
registry/trovecn/<kebab-name>/<kebab-name>-demo.tsx    — default-exported demo
```

- `<kebab-name>.tsx` exports the reusable component(s) with real props (no
  hardcoded demo content baked into the primitive). This is the file that
  ships through the registry, and the one read verbatim onto the component
  page's Code tab — treat its API and formatting as something a stranger
  will both `npx shadcn add` and read.
- `<kebab-name>-demo.tsx` default-exports a self-contained React component
  with no required props — this is what gets rendered inside the detail
  page's Preview tab. Keep it visually complete on its own (don't rely on
  page-level context).
- Use `"use client"` where needed (anything with Framer Motion, state, or
  browser APIs).
- Dependencies: `framer-motion`, `lucide-react`, `clsx`/`tailwind-merge`
  (via `cn()`), and `class-variance-authority` are already installed — use
  them rather than adding new packages. If a component genuinely needs a
  new dependency, note it clearly at the top of the file instead of
  installing it yourself.

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

`src/app/docs/components/[slug]/page.tsx` wraps each demo: category label,
title, description, provenance line, the Preview/Code tabs
(`src/components/ui/tabs.tsx`, a Base UI `Tabs` wrapper), and the install
command with a copy button. Components themselves should not try to
replicate this framing — just build the piece; the page shell is provided
centrally.

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
