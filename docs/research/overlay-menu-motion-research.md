# Overlays & menus — motion research

Research pass for the six "Overlays & menus" primitives in `docs/primitives.md`
(Context Menu, Menubar, Navigation Menu, Preview Card / Hover Card, Toast,
Drawer), following the same "find real precedent, cite it, adapt the values"
model used for Switch (see the header comment in
`src/components/ui/switch.tsx`, adapted from fluidfunctionalism.com's Base UI
switch). Every duration/easing/spring/technique below is sourced from a
primary file — repo source, not a blog paraphrase — with a link. Where a
named practitioner's commentary is cited, it's a real, findable URL; sections
with none say so rather than padding.

Reminder of this repo's spring tiers (`docs/design-system.md` /
`@/lib/springs`):

| Token             | Enter                       | Exit           |
| ----------------- | --------------------------- | -------------- |
| `spring.fast`     | duration 0.08s, bounce 0    | duration 0.06s |
| `spring.moderate` | duration 0.16s, bounce 0    | duration 0.12s |
| `spring.slow`     | duration 0.24s, bounce 0.12 | duration 0.16s |

---

## Context Menu

### fluidfunctionalism.com implementation

**Not present.** The repo's file tree (`registry/base/` and `registry/radix/`
via [github.com/mickadesign/fluid-functionalism](https://github.com/mickadesign/fluid-functionalism))
has no `context-menu.tsx` in either the Base UI or Radix variant — only
`accordion`, `button`, `checkbox-group`, `dialog`, `dropdown`, `mobile-drawer`,
`radio-group`, `scroll-area`, `select`, `slider`, `switch`, `tabs`,
`tabs-subtle`, `thinking-steps`, `tooltip`.

The closest architectural cousin is its click-triggered dropdown menu,
[`registry/base/dropdown.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/dropdown.tsx)
— same Base UI `Menu` primitive, same popup-positioning stack a Context Menu
would reuse. Its popup panel (`DropdownContent`,
[lines 463–477](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/dropdown.tsx#L463-L477))
animates:

```tsx
initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
animate={open ? { opacity: 1, y: 0, scaleY: 1 } : { opacity: 0, y: -4, scaleY: 0.96 }}
transition={open ? spring.fast : spring.fast.exit}
style={{ transformOrigin: "top center" }}
```

`opacity` + `y` + `scaleY` only (never top/left/width/height, same rule this
repo already enforces), on `spring.fast` — their fastest tier, equivalent to
this repo's `spring.fast`. No submenu support exists in this file (single
flat menu only), so it's not a precedent for nested context-menu submenus.

### Other motion-forward open-source prior art

**Radix UI Context Menu** —
[`packages/react/context-menu/src/context-menu.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/context-menu/src/context-menu.tsx):

- **Virtual-anchor positioning** ([lines 121–150](https://github.com/radix-ui/primitives/blob/main/packages/react/context-menu/src/context-menu.tsx#L121-L150)):
  on right-click, the pointer coordinates are captured into `point`, and a
  zero-size virtual element is built and handed to the same Popper-based
  `Anchor` the regular dropdown uses:
  ```ts
  const virtualRef = React.useMemo(
    () => ({ getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...point }) }),
    [point],
  );
  <MenuPrimitive.Anchor virtualRef={virtualRef} />
  ```
  This is the standard technique for "menu opens at the click point, not
  anchored to a trigger element" — Context Menu reuses the exact same
  collision-aware positioner as a normal dropdown, just with a synthetic
  anchor rect instead of a real DOM node.
- **Touch long-press** ([line 181](https://github.com/radix-ui/primitives/blob/main/packages/react/context-menu/src/context-menu.tsx#L181)):
  `longPressTimerRef.current = window.setTimeout(() => handleOpen(event), 700)`
  — 700ms long-press opens the menu on touch devices (native `contextmenu`
  already fires on right-click for mouse, so this timer is gated to
  non-mouse pointer types only).
- **CSS custom properties exposed for consumer animation**
  ([lines 271–275](https://github.com/radix-ui/primitives/blob/main/packages/react/context-menu/src/context-menu.tsx#L271-L275)):
  `--radix-context-menu-content-transform-origin` (mirrors
  `--radix-popper-transform-origin`, i.e. flips based on which side of the
  viewport the menu actually landed on after collision detection),
  `--radix-context-menu-content-available-width/height`, and
  `--radix-context-menu-trigger-width/height`. Radix ships unstyled — these
  vars are the hook a consumer's CSS/JS animation reads collision outcome
  from.

**Ariakit** — [ariakit.org/examples/menu-context-menu](https://ariakit.org/examples/menu-context-menu):
positions its `Menu` at the click point via a `getAnchorRect` prop that
returns the click coordinates — the same "synthetic anchor rect" idea as
Radix's `virtualRef`, different API surface (a prop function vs. a
`virtualRef` object).

**React Aria Components** — its `Menu`/`useLongPress`
(`@react-aria/interactions`) support a `trigger="longPress"` mode so the same
menu component serves both a normal press-trigger and a long-press
right-click-equivalent trigger, unifying mouse/touch instead of Radix's
separate `onContextMenu` + manual long-press-timer branches.

`cmdk` was checked and isn't relevant here — it's a filtered listbox for
command palettes, no right-click/anchor-at-point concept.

### Design commentary from named practitioners

No component-specific post from Emil Kowalski or Rauno Freiberg turned up on
context menus specifically. Two adjacent, real citations from Rauno
Freiberg's interface-guidelines collection,
[github.com/raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces)
(a maintained, sourced checklist, not a blog post, but a findable primary
source with exact wording):

- "To open immediately on press, dropdown menus should trigger on
  `mousedown`, not `click`."
- "When using nested menus, use a 'prediction cone' to prevent the pointer
  from accidentally closing the menu when moving across other elements."
  (Directly applicable to Context Menu submenus reached via hover.)
- "Animation duration should not be more than 200ms for interactions to feel
  immediate" — consistent with this repo's `spring.fast`/`spring.moderate`
  tiers already being well under 200ms.

Rauno also posted specifically about tooltip collision detection on X —
[twitter.com/raunofreiberg/status/1683883742664830986](https://twitter.com/raunofreiberg/status/1683883742664830986)
— not a context menu, but the same underlying Popper-style collision system
Radix's Context Menu content reuses from its regular Menu/Popper stack.

### Synthesis

`spring.fast` is the right tier — this is short-travel, small-surface motion
(same class as this repo's already-shipped dropdown Menu, which fluid­
functionalism's precedent above also puts on its fastest tier). Concretely:
reuse this repo's existing `Menu` popup transform (`opacity` + `y` +
`scaleY`, `spring.fast`/`spring.fast.exit`, `transformOrigin` set from the
resolved side) and layer Radix's virtual-anchor-at-pointer technique on top
via Base UI's `Menu.Positioner`/anchor equivalent — the menu should open at
the click point, not at a trigger element. Gate a 700ms long-press timer
behind `event.pointerType !== "mouse"` (Radix's exact technique) so touch
gets a long-press trigger without affecting desktop right-click. Adopt
Radix's `--*-content-transform-origin` pattern conceptually: derive
`transformOrigin` from Base UI's own collision/placement output the same way
Popover already should, so scale-in always originates from the resolved
corner rather than a hardcoded "top center."

---

## Menubar

### fluidfunctionalism.com implementation

**Not present.** No `menubar.tsx` in either registry variant of
[fluid-functionalism](https://github.com/mickadesign/fluid-functionalism).
The nearest building block is again
[`registry/base/dropdown.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/dropdown.tsx)
— a Menubar is essentially N of these dropdown triggers in a row with shared
"only one open at a time, hover switches instantly once one is open" state,
which this file doesn't model (it's a single independent dropdown). Its
per-popup motion values (`spring.fast` enter/exit, `opacity`+`y`+`scaleY`,
cited above under Context Menu) are still the right unit to repeat per
top-level menu.

### Other motion-forward open-source prior art

**Radix UI Menubar** —
[`packages/react/menubar/src/menubar.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/menubar/src/menubar.tsx):

- **Hover-to-switch-once-open** is the defining interaction and it's gated,
  not unconditional
  ([lines 255–261](https://github.com/radix-ui/primitives/blob/main/packages/react/menubar/src/menubar.tsx#L255-L261)):
  ```ts
  onPointerEnter={composeEventHandlers(props.onPointerEnter, () => {
    const menubarOpen = Boolean(context.value);
    if (menubarOpen && !open) {
      context.onMenuOpen(menuContext.value);
      ref.current?.focus();
    }
  })}
  ```
  Moving the pointer across a sibling trigger only opens it if _some_ menu in
  the bar is already open (from an explicit click) — otherwise hovering the
  menubar does nothing, exactly like macOS/Windows app menus. This is a
  state-machine detail, not a spring value, but it's the single most
  important interaction fact for this component.
- **Same CSS-var exposure pattern as Context Menu/Dropdown**
  ([lines 383–387 and 640–644](https://github.com/radix-ui/primitives/blob/main/packages/react/menubar/src/menubar.tsx#L383-L387)):
  `--radix-menubar-content-transform-origin` (from
  `--radix-popper-transform-origin`), `-available-width/height`,
  `-trigger-width/height` — each top-level `Menubar.Content` is Popper-
  positioned independently and exposes the same collision-outcome vars a
  consumer's CSS animation would key off of.
- `data-state="open"|"closed"` per trigger ([line 240](https://github.com/radix-ui/primitives/blob/main/packages/react/menubar/src/menubar.tsx#L240)) drives which trigger looks "pressed."

**Ariakit** — [ariakit.org/examples/menubar-navigation](https://ariakit.org/examples/menubar-navigation)
composes `Menubar` + `Menu` + `Portal` for a tabbable menu widget with links
and expand-on-hover/focus menu buttons; confirms the same hover-after-open
pattern as a cross-library convention, not a Radix-only choice.

`cmdk` and React Aria Components have no Menubar-specific technical
divergence worth calling out beyond what's covered above.

### Design commentary from named practitioners

None found specific to Menubar from Emil Kowalski or Rauno Freiberg. The
general `interfaces` guidance cited under Context Menu (mousedown-to-open,
sub-200ms interactions, prediction cone for nested menus) applies here too,
since a Menubar's submenus are the same nested-menu shape.

### Synthesis

`spring.fast` again — same short-travel popup class as Context Menu and the
already-shipped dropdown Menu; a Menubar's content panel is not visually
bigger or more consequential than a dropdown's, it just has N independent
triggers. The one non-negotiable technique to carry over is Radix's gated
hover-switch: track "is any top-level menu open" as shared state across
triggers, and only let `pointerEnter` on a sibling trigger call the same
open-transition used for click — never open on bare hover with nothing
already open. Reuse this repo's Menu popup transform per top-level content
panel (`opacity`+`y`+`scaleY`, `spring.fast`), with `transformOrigin` derived
from each trigger's own resolved placement so switching between two menus at
different horizontal positions doesn't look like it's scaling from a fixed
point.

---

## Navigation Menu

### fluidfunctionalism.com implementation

**Not present as a mega-menu.** There's no dedicated Radix-style
"NavigationMenu with hover-triggered preview panels" in
[fluid-functionalism](https://github.com/mickadesign/fluid-functionalism).
What exists is
[`registry/default/nav-menu.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/nav-menu.tsx)

- [`nav-item.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/nav-item.tsx)
  — a **sidebar nav list** (proximity-hover pill + active-route pill + focus
  ring, all layered `<motion.div>`s), structurally closer to this repo's own
  `DocsSidebar` than to a mega-menu with content panels. It is not a source for
  the "preview panel that resizes/slides based on which top-level item is
  active" behavior a Navigation Menu needs. Concretely, worth reusing from it
  is the three-layer animated-background pattern
  ([lines 153–223](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/nav-menu.tsx#L153-L223)):
  an active-route pill on `spring.moderate` (`opacity: { duration: 0.08 }`
  layered on top of the position spring), a hover pill on `spring.fast`, and a
  focus ring on `spring.fast` — same tier split this repo's own
  `useProximityHover` convention already uses.

### Other motion-forward open-source prior art

**Radix UI Navigation Menu** —
[`packages/react/navigation-menu/src/navigation-menu.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx)
is the actual mega-menu precedent and exposes the richest animation contract
of any of these six:

- **Direction-aware `data-motion`** ([lines 915, 991–993, 1009](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx#L991-L1009)):
  ```ts
  type MotionAttribute = "to-start" | "to-end" | "from-start" | "from-end";
  // ...
  if (isSelected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start";
  if (wasSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end";
  ```
  Each `NavigationMenu.Content` gets a `data-motion` attribute computed from
  whether it's becoming active/inactive and whether the newly-active item is
  to its left or right in the trigger list — so a consumer's CSS/motion
  values can slide the panel in from the correct side to match the user's
  left-to-right traversal, rather than every panel using one fixed
  direction.
- **Shared viewport sizing vars**
  ([lines 1156–1157](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx#L1156-L1157)):
  `--radix-navigation-menu-viewport-width`/`-height` are written onto the
  single shared `Viewport` element so it can animate its own size to match
  whichever content panel is currently active — the classic "one panel
  resizes/crossfades to become the next" mega-menu effect, without each
  panel owning its own popup.
- **Indicator translate vars**
  ([lines 803–809](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx#L803-L809)):
  `--radix-navigation-menu-indicator-translate-x/-y` position the little
  caret/underline under the active trigger — same "sliding indicator" shape
  as this repo's Tabs/Accordion proximity-hover pill, just Radix exposes it
  as raw px-offset custom properties instead of committing to a technique.
- `data-state="open"|"closed"`/`"visible"|"hidden"` on triggers/viewport
  ([lines 583, 792, 858, 1149](https://github.com/radix-ui/primitives/blob/main/packages/react/navigation-menu/src/navigation-menu.tsx#L792)).

### Design commentary from named practitioners

No Navigation-Menu-specific post found from Emil Kowalski or Rauno Freiberg.

### Synthesis

This is the one component in the set where Radix's actual architecture
(shared resizing `Viewport` + per-panel `data-motion` direction) is worth
adopting over anything in fluidfunctionalism, since fluidfunctionalism has
no mega-menu precedent at all. Use `spring.moderate` for the viewport
width/height resize (it's a "short travel, must land exactly" transform per
this repo's own tier table, not a large-surface `spring.slow` case — the
panel is resizing in place, not entering the screen), and `spring.fast` for
the indicator/underline under the active top-level trigger, matching the
existing Tabs indicator convention. Carry over Radix's `data-motion`
direction logic conceptually: compute `from-start`/`from-end` between the
previously- and newly-active trigger index and slide the incoming content a
few px from that side while cross-fading opacity, so left-to-right
navigation always reads directionally correct — this is the one specific
technique worth reimplementing rather than reinventing.

---

## Preview Card / Hover Card

### fluidfunctionalism.com implementation

**Not present as a distinct component**, but its
[`registry/base/tooltip.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tooltip.tsx)
is the closest thing to a hover-delay precedent in the repo and this repo's
own shipped `Tooltip` (`src/components/ui/tooltip.tsx`) already mirrors it —
worth restating because Preview Card is the same "hover, wait, show a
floating panel" shape at a larger size:

- Default open delay: `DEFAULT_DELAY = 200` ms
  ([line 40](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tooltip.tsx#L40)).
- Group skip-delay: once one tooltip in a `TooltipProvider` group has opened,
  adjacent tooltips opened within `skipDelayDuration = 300` ms skip the
  wait entirely
  ([lines 61–76](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tooltip.tsx#L61-L76)).
- Popup motion: 4px directional slide + opacity on `spring.fast`/
  `spring.fast.exit`
  ([lines 186–193](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tooltip.tsx#L186-L193)):
  `initial={{ opacity: 0, ...slideOffset }}` where `slideOffset` is `{ y: 4 }`
  for `side="top"`, etc.

### Other motion-forward open-source prior art

**Radix UI Hover Card** —
[`packages/react/hover-card/src/hover-card.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/hover-card/src/hover-card.tsx):

- Default delays are markedly longer than a tooltip's, which is the whole
  point of Hover Card being a distinct primitive rather than "big tooltip"
  ([lines 59–60](https://github.com/radix-ui/primitives/blob/main/packages/react/hover-card/src/hover-card.tsx#L59-L60)):
  ```ts
  openDelay = 700,
  closeDelay = 300,
  ```
  700ms open / 300ms close — roughly 3.5x a tooltip's typical ~200ms open
  delay, because a hover card's content (avatar, bio, link preview) takes
  longer to be worth committing to than a one-word tooltip label, and a
  premature open on every incidental mouse pass-over would be noisy.
- Same CSS-var exposure as the other Popper-based primitives
  ([lines 362–366](https://github.com/radix-ui/primitives/blob/main/packages/react/hover-card/src/hover-card.tsx#L362-L366)):
  `--radix-hover-card-content-transform-origin/-available-width/-available-height`,
  `--radix-hover-card-trigger-width/-height`.
- `data-state="open"|"closed"` on both trigger and content
  ([lines 135, 218](https://github.com/radix-ui/primitives/blob/main/packages/react/hover-card/src/hover-card.tsx#L135)).

`cmdk` isn't relevant. React Aria Components' `useHover`/tooltip primitives
use a similar dual-delay model but Radix's Hover Card is the clearer,
purpose-built source for the 700/300 split specifically.

### Design commentary from named practitioners

No hover-card-specific post found from Emil Kowalski or Rauno Freiberg (a
search for delay-tuning commentary from either did not surface a real,
citable post — noting the gap rather than padding it). The general
`interfaces` guidance about tooltips
(["Tooltips triggered by hover should not contain interactive content"](https://github.com/raunofreiberg/interfaces))
is adjacent but Preview Card content is explicitly interactive (a link
preview, a profile card with a follow button), which is precisely why Radix
splits Hover Card from Tooltip as a separate primitive with its own,
longer delay and its own bridging logic between trigger and content so the
pointer can travel from one to the other without closing.

### Synthesis

Reuse this repo's shipped `Tooltip` popup motion verbatim (`spring.fast`,
opacity + 4px directional slide, `transformOrigin` from side) since Preview
Card is the same visual shape, just larger content — `spring.fast` still
fits because the panel itself is small-to-moderate and short-travel even if
its content is richer. The one value that must change is the delay: adopt
Radix's 700ms open / 300ms close instead of the Tooltip's 200/300, and carry
over this repo's own `TooltipProvider` skip-delay-on-adjacent-trigger
grouping pattern (already built, see `TooltipGroupContext` in
`src/components/ui/tooltip.tsx`) so a row of avatar previews behaves like a
row of tooltips once the user starts hovering across them.

---

## Toast

### fluidfunctionalism.com implementation

**Not present.** No `toast.tsx` in either registry variant of
[fluid-functionalism](https://github.com/mickadesign/fluid-functionalism) —
confirmed against the full file listing (registry/base + registry/default +
registry/radix). Nothing to adapt from this source for Toast.

### Other motion-forward open-source prior art

**sonner** (by the same author, Emil Kowalski) —
[`src/index.tsx`](https://github.com/emilkowalski/sonner/blob/main/src/index.tsx)
and [`src/styles.css`](https://github.com/emilkowalski/sonner/blob/main/src/styles.css)
— this is the primary source for Toast:

- Core constants
  ([`src/index.tsx` lines 22–43](https://github.com/emilkowalski/sonner/blob/main/src/index.tsx#L22-L43)):
  ```ts
  const VISIBLE_TOASTS_AMOUNT = 3;
  const TOAST_WIDTH = 356;
  const GAP = 14;
  const SWIPE_THRESHOLD = 45;
  const TOAST_LIFETIME = 4000; // default auto-dismiss, ms
  const TIME_BEFORE_UNMOUNT = 200; // "equal to exit animation duration"
  ```
- Swipe-to-dismiss threshold is **either/or**, distance or velocity
  ([line 348](https://github.com/emilkowalski/sonner/blob/main/src/index.tsx#L348)):
  `Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11` — a fast
  short flick dismisses just as reliably as a slow long drag.
- **Stacking transform math**, in CSS custom properties
  ([`src/styles.css` lines 292–305](https://github.com/emilkowalski/sonner/blob/main/src/styles.css#L292-L305)):
  ```css
  [data-sonner-toast][data-expanded="false"][data-front="false"] {
    --scale: var(--toasts-before) * 0.05 + 1;
    --y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));
    height: var(--front-toast-height);
  }
  ```
  Each toast N positions back from the front scales down by 5% per position
  (`--toasts-before` × 0.05) and offsets by `--lift-amount` (`gap` px) times
  its position — the collapsed-stack "cards fanned behind the front card"
  look, computed entirely from custom properties rather than per-toast
  inline styles.
- Base transition, applied to every toast
  ([`src/styles.css` line 89](https://github.com/emilkowalski/sonner/blob/main/src/styles.css#L89)):
  `transition: transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms;`
  — note `box-shadow` gets its own quicker 200ms, separate from the
  400ms transform/opacity/height group.
- Removal/exit variants are per data-attribute combination (front vs. not
  front, swiped-out vs. not, expanded vs. collapsed) — e.g.
  ([lines 329–340](https://github.com/emilkowalski/sonner/blob/main/src/styles.css#L329-L340)):
  front-toast dismissal translates fully off (`translateY(var(--lift) * -100%)`)
  while a collapsed, non-front toast being removed only moves 40%
  (`translateY(40%)`) since it's mostly hidden behind others anyway.

**Radix UI Toast** — exists as a package
(`@radix-ui/react-toast`) but wasn't the deeper research target here since
sonner is explicitly named in the brief and is the far richer source for
stacking/swipe math; Radix's own default is unstyled with `data-state`/
`data-swipe-direction` attributes and no built-in stacking geometry.

`cmdk` isn't relevant to Toast.

### Design commentary from named practitioners

**Emil Kowalski**, [emilkowal.ski/ui/building-a-toast-component](https://emilkowal.ski/ui/building-a-toast-component)
(his own write-up on building sonner):

- He attributes sonner's traction specifically to the stacking animation,
  and to switching from CSS `@keyframes` to CSS transitions once toasts
  started arriving/leaving rapidly: keyframes restart from zero on
  interruption, while transitions "are interruptible and retargeted, even
  before the first transition has finished" — the same "springs/transitions
  must respond to interruption" principle this repo's `design-system.md`
  already states as a rule, independently arrived at.
- He describes an `:after` pseudo-element inserted between stacked toasts
  specifically to fill the visual gap so hovering across the stack doesn't
  flicker out of a "hovering" state between cards — a technique this repo
  should carry over if toasts collapse into a fanned stack with visible gaps
  between them.

### Synthesis

`spring.moderate` is the right tier for the per-toast enter/reflow motion —
sonner's own 400ms transform/opacity/height duration is slower than any tier
here, but that reflects a hand-tuned CSS-transition library, not a spring
system; `spring.moderate`'s "short travel, must land exactly" framing (this
repo's own description for panels that need precision, e.g. mobile drawer)
fits a toast sliding/resizing within its stack better than `spring.fast`
does, and using `spring.moderate.exit` on dismissal keeps exits crisp per
this repo's own exit-is-faster-than-enter rule (sonner's own `box-shadow`
being on a separate, quicker 200ms transition than everything else is the
same idea independently). Carry over three concrete techniques verbatim:
sonner's stack math (`scale = 1 - toastsBehind * 0.05`, `offset = gap *
toastsBehind`), its dual swipe-dismiss threshold (45px distance OR velocity

> 0.11, not just one), and its gap-filling pseudo-element for hover-stability
> across a collapsed stack.

---

## Drawer

### fluidfunctionalism.com implementation

**Not a gesture-driven Drawer, but a close and directly relevant precedent**
via [`registry/base/mobile-drawer.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/mobile-drawer.tsx)
— and its header comment is unusually load-bearing for this exact task,
because it explains _why_ they deliberately did **not** build on Base UI's
own Drawer primitive:

> "Built on Base UI Dialog rather than Base UI Drawer: Drawer's
> swipe-to-dismiss writes inline `transform` + `--drawer-swipe-movement-*`
> CSS vars onto its Popup and expects CSS-transition choreography (plus a
> mandatory `<Drawer.Viewport>`), which fights framer-motion's transform
> management on the same element."
> ([lines 10–17](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/mobile-drawer.tsx#L10-L17))

Concrete values from the file:

- Enter: `spring.moderate` (critically damped, no overshoot — the comment
  notes a bounce previously "briefly exposed the page background through the
  gap on the left edge")
  ([lines 111–116](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/mobile-drawer.tsx#L111-L116)):
  ```tsx
  initial={{ x: "-100%" }}
  animate={{ x: open ? 0 : "-100%" }}
  transition={open ? spring.moderate : spring.moderate.exit}
  ```
- Backdrop: opens on a plain `{ duration: 0.16 }` tween, closes on
  `spring.moderate.exit`
  ([lines 89–92](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/mobile-drawer.tsx#L89-L92)).
- Deferred-unmount pattern: Base UI's `actionsRef` keeps the portal mounted
  through the close animation; `onAnimationComplete` calls
  `actionsRef.current.unmount()`, with a `setTimeout` fallback (via
  `exitFallbackMs`, `src/lib/springs.ts` in that repo) in case the rAF
  callback stalls in a throttled/background tab
  ([lines 47–64](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/mobile-drawer.tsx#L47-L64)).
- No drag/swipe gesture at all — it's a scripted slide, not gesture-driven.
  This repo's existing hand-rolled `Sheet` (`src/components/ui/sheet.tsx`) is
  architecturally the same shape: Base UI `Dialog` + a scripted
  `transition-transform`, no drag physics.

### Other motion-forward open-source prior art

**vaul** (by Emil Kowalski) —
[`src/constants.ts`](https://github.com/emilkowalski/vaul/blob/main/src/constants.ts),
[`src/helpers.ts`](https://github.com/emilkowalski/vaul/blob/main/src/helpers.ts),
[`src/index.tsx`](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx):

- Full constant set
  ([`src/constants.ts`](https://github.com/emilkowalski/vaul/blob/main/src/constants.ts)):
  ```ts
  export const TRANSITIONS = { DURATION: 0.5, EASE: [0.32, 0.72, 0, 1] };
  export const VELOCITY_THRESHOLD = 0.4;
  export const CLOSE_THRESHOLD = 0.25;
  export const SCROLL_LOCK_TIMEOUT = 100;
  export const BORDER_RADIUS = 8;
  export const NESTED_DISPLACEMENT = 16;
  export const WINDOW_TOP_OFFSET = 26;
  ```
  `EASE = [0.32, 0.72, 0, 1]` is the well-known iOS-sheet-style cubic-bezier
  (fast out, gentle settle) — used for the scripted transform/opacity
  transitions in
  [`src/index.tsx` lines 558, 562, 583–584](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx#L558):
  `` `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(',')})` ``
  at 0.5s — notably slower than any tier in this repo's system, because
  vaul's default is a full CSS-transition-driven sheet, not a spring.
- **Rubber-band/overdrag damping formula**
  ([`src/helpers.ts` line 90](https://github.com/emilkowalski/vaul/blob/main/src/helpers.ts#L90)):
  ```ts
  export function dampenValue(v: number) {
    return 8 * (Math.log(v + 1) - 2);
  }
  ```
  applied when the user drags past the natural open position
  ([`src/index.tsx` lines 411–420](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx#L411-L420)):
  `const dampenedDraggedDistance = dampenValue(draggedDistance)` then used as
  the translate value — a logarithmic damper, not a linear-friction one, so
  resistance ramps up progressively the further past the boundary the user
  drags rather than applying a constant multiplier.
- **Close-on-release logic** is velocity-first, distance-second
  ([`src/index.tsx` lines 645–659](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx#L645-L659)):
  a flick faster than `VELOCITY_THRESHOLD` (0.4) closes immediately
  regardless of distance dragged; otherwise it closes only if the dragged
  distance is ≥ `closeThreshold` (default `CLOSE_THRESHOLD = 0.25`, i.e. 25%)
  of the drawer's visible height/width.
- **Background scale-down** while dragging (for the "scaled background"
  visual behind the drawer): scale interpolates from a base scale up to `1`
  as `percentageDragged` goes from 0→1, and `borderRadiusValue` shrinks from
  `8` toward `0` in lockstep
  ([`src/index.tsx` lines 438–456](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx#L438-L456)).
- **Nested-drawer displacement**: opening a second, nested drawer scales the
  first one down and pushes it back by exactly `NESTED_DISPLACEMENT = 16`px
  ([`src/index.tsx` lines 680–694](https://github.com/emilkowalski/vaul/blob/main/src/index.tsx#L680-L694)).

Base UI's own `Drawer` primitive (referenced in fluidfunctionalism's own
comment above) is the direct headless building block this repo would scaffold
via `npx shadcn add drawer` per `docs/design-system.md`'s convention — its
CSS-variable/CSS-transition choreography is the reason fluidfunctionalism
routed around it for framer-motion, a decision worth re-validating rather
than assuming still holds, since Base UI's Drawer API may have changed since
that comment was written.

`cmdk` isn't relevant to Drawer.

### Design commentary from named practitioners

**Emil Kowalski**, [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component)
(his own write-up on building vaul):

- States the explicit goal: replicate "an experience similar to Apple's
  Sheet component on iOS, but for the web."
- On rubber-banding: "the more you drag, the less the drawer will move" —
  the plain-English description of the `dampenValue` log-damping formula
  above.
- On the scroll-vs-drag conflict at the top of a scrollable drawer: a 100ms
  timeout after the content re-reaches scroll-top prevents a fast scroll
  flick from being misread as a drag-to-close gesture (`SCROLL_LOCK_TIMEOUT`
  in the constants above).

### Synthesis

This is the component where fluidfunctionalism's own file is most directly
prescriptive: keep building Drawer on Base UI's `Dialog` (not its `Drawer`
primitive) so framer-motion owns the transform, for the exact reason stated
in their comment — Base UI Drawer's own inline-transform/CSS-var swipe
choreography would fight framer-motion's `motion.div` transform ownership on
the same element. Use `spring.moderate` for the scripted (non-dragging)
slide-in, matching both fluidfunctionalism's mobile-drawer and this repo's
own tier table ("panels that must land exactly (mobile drawer)"). Layer
vaul's drag physics on top rather than inventing new ones: `dampenValue`'s
logarithmic overdrag formula for resistance past the open boundary, its
velocity-first/distance-second release logic (flick past `0.4` px/ms closes
outright; otherwise require ≥25% of the panel's dimension dragged), and its
paired background-scale/border-radius interpolation for the "page recedes
behind the drawer" effect if this repo wants that treatment. This would be
the first primitive in the repo with real drag/gesture physics, so vaul's
release-velocity math is the load-bearing piece to port faithfully rather
than approximate.
