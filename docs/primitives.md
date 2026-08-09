# Primitive Ideas

The skeleton layer. Every pattern in `docs/ideas.md` is really one of these
primitives plus a site-specific skin — a command palette is a
Dialog/Combobox, a mega-menu is a Popover/Menu, a pricing toggle is a
Switch. Solve structural correctness (focus trap, portal, positioning,
keyboard nav) and house motion (spring tier, elevation step, proximity
hover, ghost-span) once per primitive here, and every pattern built on top
inherits both for free instead of re-deriving them per file.

Workflow: `npx shadcn add <name>` scaffolds the Base UI wrapper into
`src/components/ui/` (style `base-nova`, per `components.json`) — don't
hand-write Base UI bindings. Then apply the house motion system from
`docs/design-system.md` on top of what the CLI generates: swap in the
correct `@/lib/springs` tier, wire the elevation step, add proximity hover
where the primitive is a list/grid of interactive items.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` shipped

## Backlog priority — Base UI, direct wrap

`@base-ui/react` already ships headless behavior for all of these. Same
build pattern as the shipped four: wrap the primitive, style with Tailwind,
apply house motion. No new dependency. Ordered roughly by how many
downstream patterns depend on it.

- [x] Popover — command palette, mega-menu, hover/preview panels
- [x] Dialog — command palette container, any future modal
- [x] Tooltip — keyboard shortcut badges, hover previews
- [x] Accordion — changelog/roadmap timeline
- [x] Tabs — registered in `registry.json` and on the docs site. Rebuilt
      on `useProximityHover` (same hook as Accordion/DocsSidebar) instead of
      Base UI's own `Tabs.Indicator`, so it gets a real `spring.moderate`
      indicator, a proximity hover preview pill, and ghost-span label weight
- [x] Button — registered in `registry.json` and on the docs site
- [x] Sheet — registered in `registry.json` and on the docs site, built
      on the Dialog primitive, edge-anchored — consider re-basing on Base
      UI's dedicated Drawer primitive at some point
- [ ] Menu (dropdown) — mega-menu, sidebar row actions
- [ ] Combobox / Autocomplete — command palette search-as-you-type
- [x] Switch — registered in `registry.json` and on the docs site. Squishy,
      draggable thumb (hover-stretch, press-squish, drag-to-toggle) adapted
      from fluidfunctionalism.com's Base UI switch (MIT,
      github.com/mickadesign/fluid-functionalism) onto this repo's neutral
      palette and `sm`/`default` sizes, replacing the CLI scaffold's plain
      CSS `transition-transform` slide

### Overlays & menus

- [ ] Context Menu — right-click actions
- [ ] Menubar — app-shell top menu
- [ ] Navigation Menu — mega-menu nav with preview panels
- [ ] Preview Card (hover card) — link/user previews
- [ ] Toast — transient notifications
- [ ] Drawer — dedicated gesture-driven edge panel (could replace the
      hand-rolled Sheet above)

### Selection inputs

- [ ] Select
- [ ] Checkbox / CheckboxGroup
- [ ] Radio / RadioGroup
- [ ] Toggle / ToggleGroup
- [ ] Slider

### Form structure

- [ ] Field / Fieldset — scaffolding other form primitives plug into,
      worth doing early
- [ ] Form
- [ ] Input
- [ ] NumberField
- [ ] OTP Field

### Disclosure & layout

- [ ] Collapsible
- [ ] Toolbar
- [ ] Separator
- [ ] ScrollArea

### Feedback

- [ ] Progress
- [ ] Meter

### Providers / utility

Not visual components, but worth wrapping/exporting once relevant.

- [ ] Direction Provider — RTL support
- [ ] CSP Provider — strict-CSP environments
- [ ] `useMediaQuery` hook

## Backlog priority — not in Base UI

No Base UI primitive to lean on; these need a custom headless build or a
second focused dependency. Cross-referenced against Radix UI, React Aria
Components, Ariakit, and single-purpose libraries (cmdk, vaul,
embla-carousel, react-resizable-panels, react-day-picker).

### Date & time

The biggest real gap — Base UI has nothing here. React Aria Components
(`DateField`, `DatePicker`, `Calendar`) is the closest prior art.

- [ ] Calendar
- [ ] Date Picker
- [ ] Date Range Picker
- [ ] Time Field

### Command & search

- [ ] Command Palette (`⌘K`-style filtered list) — layer on top of Base
      UI's Combobox internals, or bring in `cmdk`

### Data display

- [ ] Avatar — confirm against Base UI's list before building custom
- [ ] Table / DataList
- [ ] Card
- [ ] Badge / Chip
- [ ] Kbd
- [ ] Aspect Ratio

### Navigation

- [ ] Breadcrumb
- [ ] Pagination
- [ ] Stepper / Wizard

### Layout

Standards already exist in the ecosystem — pull in the dependency rather
than reimplement, same as leaning on `framer-motion` and `@base-ui/react`.

- [ ] Resizable Panels / Splitter — `react-resizable-panels`
- [ ] Carousel — `embla-carousel`
- [ ] Masonry

### Status / loading

Trivial, no dependency needed.

- [ ] Skeleton
- [ ] Spinner

### Advanced input

- [ ] Tags / multi-select input
- [ ] Rating
- [ ] Color Picker
- [ ] File Dropzone — React Aria has `FileTrigger` / `DropZone` as prior art

### Accessibility utility

- [ ] Visually Hidden — Radix ships this standalone
- [ ] Focus Trap wrapper
- [ ] Presence wrapper — thin Framer Motion wrapper matching `@/lib/springs`
      conventions, for exit animations outside a primitive's own transition
      state
