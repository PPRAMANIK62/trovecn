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
- [x] Menu (dropdown) — registered in `registry.json` and on the docs site.
      Submenus, checkbox/radio items; each popup (including every submenu,
      independently) owns a `useProximityHover` pill sliding behind its rows,
      auto-indexed via a recursive child walk that reaches into
      MenuGroup/MenuRadioGroup — same wash every other consumer uses. Base
      UI's own `data-highlighted` still drives per-row text/icon color
      (muted → foreground), split the same way Accordion separates its pill
      (background) from its trigger (text color)
- [x] Combobox / Autocomplete — registered in `registry.json` and on the
      docs site. Hand-built directly on `@base-ui/react/combobox` instead of
      `npx shadcn add combobox` — the stock scaffold overwrites Button and
      drops the house `elevated`/`2xs` variants; see the comment atop
      `combobox.tsx`. Popup matches the input's width (`w-(--anchor-width)`),
      unlike Menu's content-sized popup — a combobox's results are "for this
      field," a menu's actions aren't. ComboboxList owns the same
      `useProximityHover` pill Menu's popups do; ComboboxItem takes its index
      as an explicit prop (the flat case gets it free from Base UI's own
      `(item, index) =>` render callback, the grouped case threads a running
      counter across groups — see the "Grouped" example)
- [x] Switch — registered in `registry.json` and on the docs site. Squishy,
      draggable thumb (hover-stretch, press-squish, drag-to-toggle) adapted
      from fluidfunctionalism.com's Base UI switch (MIT,
      github.com/mickadesign/fluid-functionalism) onto this repo's neutral
      palette and `sm`/`default` sizes, replacing the CLI scaffold's plain
      CSS `transition-transform` slide

### Overlays & menus

- [x] Context Menu — registered in `registry.json` and on the docs site.
      Same popup, motion, and `useProximityHover` pill as the dropdown Menu,
      anchored at the pointer instead of a trigger element — Base UI's
      `ContextMenu` handles the click-point virtual anchor and touch
      long-press internally, so this file only re-applies the house motion
      layer, same as every other Menu-family primitive
- [x] Menubar — registered in `registry.json` and on the docs site. Every
      top-level menu is the dropdown Menu primitive nested in Base UI's
      `Menubar` container, which wires the macOS/Windows gated hover-switch
      behavior in natively — no dropdown-menu.tsx duplicate, just aliases
      onto `menu.tsx`
- [x] Navigation Menu — registered in `registry.json` and on the docs site.
      One shared, resizing `Viewport` crossfades between whichever
      top-level item is active (Base UI's own architecture, not a Radix or
      fluidfunctionalism precedent — neither ships this shape), retuned
      from the stock 350ms/208px slide down to this repo's `spring.moderate`
      velocity and a few-px directional travel; the top-level trigger row
      gets the same `useProximityHover` wash every other interactive list
      here uses
- [x] Preview Card (hover card) — registered in `registry.json` and on the
      docs site. Same popup shape/motion as Tooltip (`spring.fast`, slide +
      fade), 700ms/300ms open/close delay instead of Tooltip's 200/300 —
      richer content shouldn't commit on every incidental pass-over
- [ ] Toast — transient notifications
- [x] Drawer — registered in `registry.json` and on the docs site. Edge-
      anchored, built on Base UI's `Dialog` rather than its dedicated
      `Drawer` (same call fluidfunctionalism's `mobile-drawer.tsx` made,
      for the same reason — Drawer's own CSS-var swipe choreography fights
      framer-motion's transform ownership), framer-motion end to end on
      `spring.moderate`. Top/bottom sides get real drag-to-dismiss ported
      from vaul — velocity-first/distance-second release, rubber-band
      resistance past the open position via Framer's native per-edge
      `dragElastic` — confined to a handle so it never hijacks clicks on
      content inside; left/right stay scripted-only. First primitive in the
      repo with real drag/gesture physics. Supersedes and replaces the
      earlier hand-rolled Sheet primitive (strictly more capable: same
      edge-anchored shape, plus real spring tokens and gesture dismissal),
      which has been removed — `DocsMobileSidebar` and all former Sheet
      examples now run on Drawer

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
