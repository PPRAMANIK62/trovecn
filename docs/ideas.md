# Component Ideas

Running list of components to recreate for the showcase/registry, grouped by
interaction pattern (the same effect often shows up on multiple sites, so
grouping by pattern keeps the registry from having near-duplicate entries).

Status legend: `[ ]` not started · `[~]` in progress · `[x]` shipped

## Primitives — the skeleton layer

Build these before the patterns below. Every pattern in this backlog is
really one of these primitives plus a site-specific skin — a command
palette is a Dialog/Combobox, a mega-menu is a Popover/Menu, a pricing
toggle is a Switch. Solve structural correctness (focus trap, portal,
positioning, keyboard nav) and house motion (spring tier, elevation step,
proximity hover, ghost-span) once per primitive here, and every pattern
built on top inherits both for free instead of re-deriving them per file.

Workflow: `npx shadcn add <name>` scaffolds the Base UI wrapper into
`src/components/ui/` (style `base-nova`, per `components.json`) — don't
hand-write Base UI bindings. Then apply the house motion system from
`docs/design-system.md` on top of what the CLI generates: swap in the
correct `@/lib/springs` tier, wire the elevation step, add proximity hover
where the primitive is a list/grid of interactive items.

Priority ordered by how many backlog patterns below depend on it:

- [x] Popover — command palette, mega-menu, hover/preview panels
- [ ] Dialog — command palette container, any future modal
- [ ] Menu (dropdown) — mega-menu, sidebar row actions
- [ ] Combobox / Autocomplete — command palette search-as-you-type
- [ ] Tooltip — keyboard shortcut badges, hover previews
- [x] Accordion — changelog/roadmap timeline
- [ ] Switch — pricing toggle
- [~] Tabs — already scaffolded (`src/components/ui/tabs.tsx`); needs the
  sliding-indicator motion pass (`spring.moderate`) before "animated tab
  switcher" ships as a pattern

## Scroll & reveal

- [ ] Word-by-word / line-by-line text reveal on scroll — masked fade-up (Apple)
- [ ] Scroll-scrubbed video/frame sequence — canvas frame stepping tied to scroll progress (Apple: AirPods Pro, Vision Pro product pages)
- [ ] Sticky pinned section with content swap — section stays pinned while image/text changes (Apple product pages)
- [ ] Horizontal scroll-jacking gallery (Apple product feature carousels)

## Navigation & chrome

- [ ] Blur/glass navbar that shrinks and gains a background on scroll (Apple, Linear)
- [ ] Command palette / Cmd+K search (Linear, Raycast)
- [ ] Mega-menu dropdown with preview panels (Apple nav)
- [ ] Docked sidebar with active-route indicator animation (Linear app shell)

## Hero & marketing sections

- [ ] Bento grid feature showcase (Linear, Vercel)
- [ ] Spotlight/glow hover cards (Linear pricing/feature cards) — removed, didn't fit
- [ ] Border-beam / animated-border cards (Vercel-style glowing cards)
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
