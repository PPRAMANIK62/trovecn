# Component Ideas

Running list of components to recreate for the showcase/registry, grouped by
interaction pattern (the same effect often shows up on multiple sites, so
grouping by pattern keeps the registry from having near-duplicate entries).

Status legend: `[ ]` not started · `[~]` in progress · `[x]` shipped

## Scroll & reveal

- [x] Word-by-word / line-by-line text reveal on scroll — masked fade-up (Apple) → shipped as `scroll-text-reveal`
- [ ] Scroll-scrubbed video/frame sequence — canvas frame stepping tied to scroll progress (Apple: AirPods Pro, Vision Pro product pages)
- [ ] Sticky pinned section with content swap — section stays pinned while image/text changes (Apple product pages)
- [ ] Horizontal scroll-jacking gallery (Apple product feature carousels)

## Navigation & chrome

- [x] Blur/glass navbar that shrinks and gains a background on scroll (Apple, Linear) → shipped as `blur-navbar`
- [x] Command palette / Cmd+K search (Linear, Raycast) → shipped as `command-palette`
- [ ] Mega-menu dropdown with preview panels (Apple nav)
- [ ] Docked sidebar with active-route indicator animation (Linear app shell)

## Hero & marketing sections

- [x] Bento grid feature showcase (Linear, Vercel) → shipped as `bento-grid`
- [ ] Spotlight/glow hover cards (Linear pricing/feature cards) — removed, didn't fit
- [x] Border-beam / animated-border cards (Vercel-style glowing cards) → shipped as `animated-border-card`
- [ ] Animated gradient mesh / noise background (Linear, Stripe)
- [ ] Infinite logo marquee (Framer, Stripe customer walls)

## Data & interaction

- [ ] Pricing table with monthly/yearly toggle + animated price transition (Linear)
- [ ] Animated changelog/roadmap timeline (Linear)
- [ ] Kanban "issues flying into columns" demo animation (Linear homepage)
- [ ] Code block with tabbed language switcher + syntax highlighting (Stripe/Vercel docs)
- [ ] Draggable card stack (Framer)

## Micro-interactions

- [ ] Magnetic / cursor-follow buttons
- [ ] Keyboard shortcut badge components (⌘K style, Raycast/Linear)
- [ ] Animated tab switcher with sliding indicator (Apple feature tabs, Arc)

## First batch — shipped

Chosen for visual impact + reusability as primitives. Live in `registry/trovecn/`,
wired into the homepage, and installable via `npx shadcn add`:

1. Blur navbar
2. Bento grid
3. Command palette
4. Animated border card
5. Scroll text reveal
