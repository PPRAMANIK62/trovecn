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

"Warm Ink & Brass" palette — near-white/near-black surfaces carry a faint
warm tint (paper/ink, not screen-gray), gray text hierarchy, **brass is the
only accent color** (`--link`), reserved for links, active nav state, and
focus rings. Never use it as a background wash. Light is the default theme;
dark is toggled via a `.dark` class on `<html>` (see
`ThemeToggle`, `src/components/site/theme-toggle.tsx`) — always reach for
the CSS variables below via Tailwind's `bg-*`/`text-*`/`border-*` utilities,
never hardcode hex/rgb, so both themes stay correct automatically.

| Token                                  | Role                                                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--background`                         | page background                                                                                                                                       |
| `--foreground`                         | primary text                                                                                                                                          |
| `--card` / `--card-foreground`         | panel surface one step off background (code blocks, install command pill)                                                                             |
| `--popover` / `--popover-foreground`   | floating surfaces (menus, command palette)                                                                                                            |
| `--primary` / `--primary-foreground`   | near-black/near-white — default button fill. Not a "brand color," just ink.                                                                           |
| `--link`                               | the one accent — brass/bronze. Active sidebar item, inline links, focus rings. Exposed as `text-link` / `border-link` / `bg-link` via `--color-link`. |
| `--accent` / `--accent-foreground`     | hover fill for ghost / nav items                                                                                                                      |
| `--secondary`, `--muted` + foregrounds | neutral gray panels and secondary text                                                                                                                |
| `--border` / `--input`                 | hairline gray borders — thin lines, not boxy chrome                                                                                                   |
| `--ring`                               | focus ring                                                                                                                                            |
| `--radius`                             | `0.5rem` base — modest corners, not sharp/brutalist and not bubbly                                                                                    |

Fonts (wired in `layout.tsx` / `globals.css`):

- `font-sans` → Geist Sans — body copy, UI labels, **and headings**. There is
  no separate display face; don't reintroduce one without updating this doc.
- `font-mono` → Geist Mono — install commands, code, provenance labels.

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
  `Trovecn[.]dev` — the bracket `[.]` sits in `--link` (the one accent
  color, the same flourish the brand has always used) and the trailing
  `dev` sits in `--muted-foreground` (subdued, echoing the domain without
  competing with the accent). Both appear exactly once per instance of the
  wordmark (header, footer, anywhere else it shows up). Don't invent
  additional flourishes or logo variants; consistency of the one mark is
  the point.
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
/docs                          — introduction
/docs/components               — index of all components, grouped by category
/docs/components/[slug]        — one page per component (Preview/Code tabs,
                                  install command, dependencies)
```

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
