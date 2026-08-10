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

Sourced from `docs/research/selection-inputs-motion-research.md` — the same
"find real precedent, cite it, adapt the values" pass as the overlay/menu
research, this time against fluidfunctionalism.com's own `checkbox-group`,
`radio-group`, `select`, and `slider` source (Radix/Ariakit/React Aria
Components cross-checked for prior art Base UI's docs don't cover).

- [x] Select — registered in `registry.json` and on the docs site. Two
      distinct tiers per the research: popup open/close and the selected-row
      background both on `spring.moderate` (a discrete open, not continuous
      pointer-tracked motion, so one tier up from Combobox's `spring.fast`
      hover pill), a 300ms selection-acknowledgment delay holding the popup
      open on item-press so the checkmark draw is actually seen, and a
      bespoke `pathLength` checkmark draw-on (0.08s/0.04s tween on
      `easeOutStrong`, not a spring — a stroke draw doesn't tolerate
      overshoot the way a scale does)
- [x] Checkbox / CheckboxGroup — registered in `registry.json` and on the
      docs site, as two items sharing one file (`checkbox.tsx`): a standalone
      `Checkbox` for lone use, and `CheckboxGroup`/`CheckboxGroupItem`
      layering proximity hover plus a new shared `useMergeSplit` hook
      (`src/hooks/use-merge-split.ts`) on top — contiguous checked rows merge
      into one spring-tracked background block and split apart again on
      `spring.moderate`, the literal precedent this repo's own
      `spring.moderate` doc comment ("selection merge/split") already named
- [x] Radio / RadioGroup — registered in `registry.json` and on the docs
      site. No merge/split needed (a radio group's 0-or-1 selection
      invariant means there's never more than one contiguous run) — a single
      continuously-tracked selected background on `spring.moderate`, ported
      from this repo's own `Tabs` indicator technique rather than
      fluidfunctionalism's, plus a genuine spring-based dot scale-in
      (`spring.fast`) unlike Checkbox's tween-based draw
- [x] Toggle / ToggleGroup — registered in `registry.json` and on the docs
      site, as two files matching Base UI's own separate `toggle`/
      `toggle-group` packages. Standalone `Toggle`'s pressed-state fill is a
      plain CSS transition, deliberately not a spring, per Rauno Freiberg's
      "toggles should immediately take effect" guidance. `ToggleGroup`'s
      single-select mode reuses `Tabs`' moving-indicator recipe; multi-select
      mode gives each pressed item an independent persistent tint rather
      than CheckboxGroup's merge/split geometry — a deliberate scope call,
      not an oversight
- [x] Slider — registered in `registry.json` and on the docs site. Confirmed
      by direct inspection that fluidfunctionalism's own Slider does **not**
      share Switch's hover-stretch/press-squish thumb physics (that
      technique is Switch-specific), so this repo's Slider doesn't invent
      one either — thumb stays fixed-size, `spring.moderate` on
      click-to-position/release-to-snap, no spring at all while actively
      dragging (`useMotionValue.set()` direct, same "don't animate mid-drag"
      rule Switch already establishes), and the track fill is derived via
      `useTransform` off the same motion value driving the thumb so it can
      never desync mid-spring

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
