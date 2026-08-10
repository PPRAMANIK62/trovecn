# Selection inputs — motion research

Research pass for the five "Selection inputs" primitives in
`docs/primitives.md` (Select, Checkbox / CheckboxGroup, Radio / RadioGroup,
Toggle / ToggleGroup, Slider) — Toast is explicitly out of scope for this
pass. Same "find real precedent, cite it, adapt the values" model used for
Switch (see the header comment in `src/components/ui/switch.tsx`, adapted
from fluidfunctionalism.com's Base UI switch) and for the six overlay/menu
primitives in `docs/research/overlay-menu-motion-research.md`. Every
duration/easing/spring/technique below is sourced from a primary file —
repo source, not a blog paraphrase — with a link. Where a named
practitioner's commentary is cited, it's a real, findable URL; sections
with none say so rather than padding.

**Correction to the reminder table in the existing overlay-menu doc:** that
doc's 3-tier table predates a retune. The current system
(`src/lib/springs.ts`, `docs/design-system.md` lines ~201–209) has **four**
tiers:

| Token             | Enter                       | Exit           | Use case                                                                                                                                                  |
| ----------------- | --------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spring.fast`     | duration 0.08s, bounce 0    | duration 0.06s | Continuous, pointer-tracked motion only — proximity-hover pills, live highlight rects that follow the cursor. Never a discrete click/open, however small. |
| `spring.quick`    | duration 0.14s, bounce 0.1  | duration 0.1s  | One-shot feedback that isn't continuously tracked: tooltips, preview cards, icon crossfades, small entrance staggers.                                     |
| `spring.moderate` | duration 0.2s, bounce 0.12  | duration 0.15s | Short travel / small expansion (dropdown & tab indicators, switch thumb, accordions) and panels that must land exactly (selection merge/split).           |
| `spring.slow`     | duration 0.32s, bounce 0.18 | duration 0.22s | Large surfaces: dialogs, side panels/drawers, stepped flows.                                                                                              |

For reference, fluidfunctionalism.com's own tiers
([`registry/default/lib/springs.ts`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/lib/springs.ts#L12-L34))
are the un-retuned 3-tier ancestor of this table — `fast` 0.08/bounce 0,
`moderate` 0.16/bounce 0 (critically damped), `slow` 0.24/bounce 0.12 — so
every `spring.moderate` citation from their source below is one tier
looser today (0.2s/bounce 0.12 vs. their 0.16s/bounce 0) and every
`spring.fast` citation lines up exactly (this repo's `fast` "is not part of
the retune"). Their own `animation-guidelines.md` explicitly assigns
Checkboxes/Radio Buttons/Toggles to their `spring-fast` tier
([`animation-guidelines.md` line 7](https://github.com/mickadesign/fluid-functionalism/blob/main/animation-guidelines.md#L7)).

---

## Select

### fluidfunctionalism.com implementation

Present: [`registry/base/select.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx)
(Base UI `Select` primitive). No header docblock the way `switch.tsx` has
one, but the architecture comment at the top spells out the split of
responsibility
([lines 27–36](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L27-L36)):
Base UI owns positioning/dismissal/keyboard nav/ARIA/hidden form input; this
file only layers proximity-hover overlays, the open/close spring, and the
animated checkmark on top.

- **Popup open/close** — `SelectContent`
  ([lines 413–420](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L413-L420)):
  ```tsx
  initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
  animate={open ? { opacity: 1, y: 0, scaleY: 1 } : { opacity: 0, y: -4, scaleY: 0.96 }}
  transition={open ? spring.fast : spring.fast.exit}
  ```
  Identical shape/tier to their dropdown Menu popup (cited in the overlay-menu
  doc) — `opacity`+`y`+`scaleY` only, their fastest tier.
- **Deferred unmount fallback**
  ([lines 327–334](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L327-L334)):
  Base UI keeps the popup mounted via `actionsRef` until told to unmount;
  a `setTimeout(..., exitFallbackMs(spring.fast))` force-unmounts if
  `onAnimationComplete` never fires (throttled/background tab).
  `exitFallbackMs` itself
  ([`registry/default/lib/springs.ts` lines 41–42](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/lib/springs.ts#L41-L42))
  is `Math.round(tier.exit.duration * 1000) + 100`.
- **Selection-acknowledgment delay** — the single most transferable idea
  in this file
  ([lines 38–42](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L38-L42)
  and [lines 148–162](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L148-L162)):
  ```tsx
  const selectionAckMs = 300;
  // ...
  if (!nextOpen && eventDetails.reason === "item-press") {
    ackTimeoutRef.current = window.setTimeout(() => setOpen(false), selectionAckMs);
    return;
  }
  setOpen(nextOpen); // Escape / outside-press / trigger-toggle close immediately
  ```
  Picking an item holds the popup open 300ms before closing so the
  checkmark draw and the selected-row background spring are actually seen,
  instead of being cut off by the popup's own ~60ms close fade. Every other
  close reason closes immediately.
- **Selected-row background springs to the newly-picked row while the
  popup stays open**
  ([lines 486–513](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L486-L513)),
  on `spring.moderate` — deliberately one tier slower/heavier than the
  popup's own `spring.fast`, and than the hover pill directly below it
  (`spring.fast`,
  [lines 516–544](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L516-L544)).
  The code comment is explicit about why: position lives in `animate` (not
  reset via a key/`initial`) specifically so an in-session value change
  _springs_ the marker from the old row to the new one rather than
  unmounting and snapping.
- **Checkmark draw-on** — `SelectItem`
  ([lines 703–714](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/select.tsx#L703-L714)):
  ```tsx
  <motion.path
    d="M4 12L9 17L20 6"
    initial={{ pathLength: skipAnimation ? 1 : 0 }}
    animate={{ pathLength: 1, transition: { duration: 0.08, ease: "easeOut" } }}
    exit={{ pathLength: 0, transition: { duration: 0.04, ease: "easeIn" } }}
  />
  ```
  A bespoke `pathLength` tween, **not** one of their spring tiers — 80ms
  draw-in / 40ms draw-out, bare `easeOut`/`easeIn` keywords. `skipAnimation`
  (a `hasMounted` ref) suppresses the draw on first mount so an
  already-selected item doesn't draw itself in on initial paint.

### Other motion-forward open-source prior art

**Radix UI Select** —
[`packages/react/select/src/select.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx):

- **Re-namespaced CSS custom properties for consumer-driven animation**
  ([lines 1183–1187](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx#L1183-L1187)):
  `--radix-select-content-transform-origin` (mirrors
  `--radix-popper-transform-origin`), `-available-width/height`,
  `--radix-select-trigger-width/height` — the same collision-aware
  transform-origin hook already noted for Context Menu/Navigation Menu in
  the overlay-menu doc, applied to Select's popup.
- **`data-state="open"|"closed"`** on the trigger
  ([line 356](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx#L356))
  and **`data-state="checked"|"unchecked"`** per item
  ([line 1400](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx#L1400))
  are the only animation hooks Radix ships itself — no built-in duration,
  easing, or transition; fully consumer-supplied, same as every other Radix
  primitive already surveyed.
- `scrollIntoView({ block: "nearest" })` on the highlighted item
  ([lines 695](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx#L695),
  [1687](https://github.com/radix-ui/primitives/blob/main/packages/react/select/src/select.tsx#L1687)) —
  a structural technique, not a motion one, but worth porting: it re-runs on
  every highlight change so a keyboard-navigated long list stays in view.

**Ariakit** —
[`select-popover.tsx`](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/select/select-popover.tsx):
the entire `SelectPopover`/`useSelectPopover` API is marked `@deprecated`
in favor of `ComboboxPopover`
([lines 16](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/select/select-popover.tsx#L16),
[42–44](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/select/select-popover.tsx#L42-L44),
[56](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/select/select-popover.tsx#L56),
[64](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/select/select-popover.tsx#L64)).
Ariakit itself ships no animation values on either API — same
headless-only posture as Radix, with the added note that its own team no
longer considers standalone Select the primary pattern (Combobox is).

**React Aria Components** —
[`Select.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Select.tsx):
`data-open`
([line 284](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Select.tsx#L284))
is the only state hook exposed; the popup is a `Popover` under the hood
([line 43](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Select.tsx#L43)),
which (like Radix/Ariakit) carries no built-in transition durations.

### Design commentary from named practitioners

**Emil Kowalski**,
[emilkowal.ski/ui/7-practical-animation-tips](https://emilkowal.ski/ui/7-practical-animation-tips):
"A 180ms select animation feels more responsive than a 400ms one" — direct
justification for keeping Select's popup on the fast end (`spring.fast`,
80ms enter) rather than reaching for `spring.moderate` or slower.

**Rauno Freiberg**,
[github.com/raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces)
— no Select-specific bullet, but the general dropdown-trigger guidance
already cited for Context Menu in the overlay-menu doc ("dropdown menus
should trigger on `mousedown`, not `click`," line 73) applies identically
to a Select trigger. No separate citation invented here to avoid padding.

### Synthesis

Two distinct motion moments, two different tiers — matching what
fluidfunctionalism's source already does:

- **Popup open/close**: `spring.moderate` (this repo's tier, not
  fluidfunctionalism's `fast` verbatim — their `fast` is the one tier this
  repo kept unchanged, but a popup is a discrete open, not "continuous,
  pointer-tracked motion," so per `springs.ts`'s own doc comment it belongs
  one tier up from `fast`). Port the `opacity`+`y`+`scaleY` shape verbatim;
  this already matches the house Menu/Combobox popup recipe.
- **Selected-row background (selection acknowledgment)**: `spring.moderate`
  — port verbatim, this is exactly the "panels that must land exactly"
  half of this repo's own `spring.moderate` definition. Port the
  selection-ack delay technique (hold-open-N-ms on item-press, close
  immediately on every other reason) verbatim; 300ms is fluidfunctionalism's
  own tuned value and there's no reason to retune it independently of
  testing it in the browser.
- **Hover pill**: `spring.fast` — verbatim, this is genuinely continuous
  pointer-tracked motion, textbook `spring.fast` per this repo's own
  definition.
- **Checkmark draw-on**: adapt, don't port verbatim. The bare `easeOut`/
  `easeIn` keyword violates this repo's own rule ("built-in easings are too
  weak to read as deliberate," `docs/design-system.md`) — swap in
  `easeOutStrong` (`springs.ts`'s cubic-bezier) for the draw-in tween and
  keep the 80ms/40ms durations, since spring physics on a `pathLength`
  draw would either overshoot past 1 (visually meaningless past full draw)
  or need `bounce: 0`, at which point it's just a spring-flavored tween
  anyway — a plain tween with the house strong ease-out is the more honest
  choice here, same as this repo's own Checkbox check-mark should do (see
  below).

---

## Checkbox / CheckboxGroup

### fluidfunctionalism.com implementation

Present: [`registry/base/checkbox-group.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx)
(Base UI `Checkbox` primitive per-item, no standalone single-checkbox file
in either registry variant — checkbox only ships as part of the group
component).

- **Hover pill + focus ring**: identical recipe to their Menu/Tabs family —
  `spring.fast` for both, opacity split to a flat `{ duration: 0.08 }`
  ([hover pill, lines 172–198](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L172-L198);
  [focus ring, lines 201–219](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L201-L219)).
- **Selected-background merge/split** — the standout piece of prior art
  here. `CheckboxGroup` groups contiguous checked indices into stable-ID
  "runs"
  ([lines 63–94](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L63-L94))
  and feeds them to
  [`useMergeSplitBlocks`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/hooks/use-merge-split.tsx)
  ([import, line 19](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L19);
  call, [line 104](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L104)),
  rendered via `<SelectionBackgrounds>`
  ([line 169](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L169)).
  Inside the hook:
  - `mergeSpring = spring.moderate`
    ([`use-merge-split.tsx` line 16](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/hooks/use-merge-split.tsx#L16))
    — chosen specifically because it's their critically-damped tier
    (bounce 0 in their system), so converging edges meet exactly instead of
    overshooting past each other.
  - A single unchecked row bridging two checked runs animates as: inner
    edges glide to the bridging row's midpoint with a `cornerDelay` of
    0.07s trailing the corner-straightening
    ([lines 13–24](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/hooks/use-merge-split.tsx#L13-L24)),
    then an **instant, invisible swap** to a single full-height block once
    the edges have met — never a spring-grow over the whole union
    ([the "commit" phase, lines 222–241](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/hooks/use-merge-split.tsx#L222-L241)).
    Deselecting a middle row plays the inverse: an instant snap into two
    abutting halves at the seam, then the halves spring apart
    ([lines 270–283](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/default/hooks/use-merge-split.tsx#L270-L283)).
  - This is exactly the "selection merge/split" case-study this repo's own
    `spring.moderate` doc comment in `springs.ts` already names as a
    canonical use — i.e. fluidfunctionalism's source is the direct
    ancestor of that line in this repo's own tier documentation, not a
    coincidence.
- **Checkmark draw-on**: same bespoke technique as Select's item checkmark,
  same non-spring `duration: 0.08` (`easeOut`) / `duration: 0.04` (`easeIn`)
  tween on `pathLength`
  ([lines 349–361](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L349-L361)).
- **Row keyboard nav** scopes to `[data-proximity-index]` row wrappers
  rather than the inner `role="checkbox"` element, to avoid double-matching
  and arrow keys dead-zoning onto the hidden primitive
  ([lines 135–158](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/checkbox-group.tsx#L135-L158)) —
  a structural technique worth porting alongside the motion, not a motion
  value itself.

### Other motion-forward open-source prior art

**Does Radix or Ariakit expose a first-class `CheckboxGroup`? No — in both
libraries, `Checkbox` is single-item only, and any group is consumer-composed
state over multiple `Checkbox` instances.**

- Radix UI: [`packages/react/checkbox/src/checkbox.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/checkbox/src/checkbox.tsx)
  has no `checkbox-group` package anywhere in the repo tree — confirmed
  against the live file listing
  (`packages/react/{checkbox,radio-group,select,slider,toggle,toggle-group}`
  are the only selection-input packages that exist). `CheckboxIndicator`
  wraps `Presence` and exposes `forceMount` explicitly "for animation
  control" by a consumer library like Framer Motion
  ([lines 279–303](https://github.com/radix-ui/primitives/blob/main/packages/react/checkbox/src/checkbox.tsx#L279-L303)).
- Ariakit: `packages/ariakit-react-components/src/checkbox/` has
  `checkbox.tsx`, `checkbox-check.tsx`, `checkbox-provider.tsx` — no
  `checkbox-group.tsx`, confirmed against the repo's live file tree. Its
  `Form` package likewise ships `form-radio-group.tsx` but no
  `form-checkbox-group.tsx`
  ([`packages/ariakit-react-components/src/form/`](https://github.com/ariakit/ariakit/tree/main/packages/ariakit-react-components/src/form)).
  `CheckboxCheck`
  ([`checkbox-check.tsx` lines 11–32](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/checkbox/checkbox-check.tsx#L11-L32))
  renders a checkmark only when `checked`, with the icon fully overridable
  via `children` — no built-in draw or fade, purely presence-based.
- **React Aria Components is the outlier: it does ship a first-class
  `CheckboxGroup`.** It's defined inline in
  [`Checkbox.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Checkbox.tsx)
  (not a separate file, which is why a `CheckboxGroup.tsx` filename search
  turns up nothing) — `CheckboxGroupContext`
  ([line 268](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Checkbox.tsx#L268))
  and the `CheckboxGroup` component itself
  ([lines 275–320](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Checkbox.tsx#L275-L320)),
  built on `@react-aria/checkbox`'s `useCheckboxGroup`
  ([import, lines 13–16](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Checkbox.tsx#L13-L16)).
  Notably it is **not** wrapped in their own `SharedElementTransition` (see
  ToggleGroup/RadioGroup below) — there's no single moving "selected"
  indicator to animate since multiple items can be checked independently,
  same structural reason fluidfunctionalism needs the merge/split hook
  instead of one simple tracked rect.

### Design commentary from named practitioners

**Emil Kowalski**,
[emilkowal.ski/ui/you-dont-need-animations](https://emilkowal.ski/ui/you-dont-need-animations):
high-frequency controls "may be repeated hundreds of times a day, an
animation would make them feel slow, delayed, and disconnected from the
user's actions. You should _never_ animate them" — directly names toggles
and checkboxes as the class of control this applies to. This argues for
keeping the checkmark draw and hover/focus rings fast and unobtrusive
(which fluidfunctionalism's source already does — 80ms/40ms, `spring.fast`)
rather than reaching for anything in `spring.moderate` or slower for
per-item feedback.

**Rauno Freiberg**,
[github.com/raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces):
"Actions that are frequent and low in novelty should avoid extraneous
animations" (line 41), naming "Deleting or adding items from a list" as an
example (line 43) — same principle, applies to toggling a row in a
CheckboxGroup. Also: "Don't scale buttons on press from 1 → 0.8, but ~0.96,
~0.9, or so" (line 40) — relevant if a press-state scale is added to the
row background (not currently present in fluidfunctionalism's source,
which uses no press-scale at all on checkbox rows).

### Synthesis

- **Check-mark draw-on**: adapt the same way as Select's — keep the
  80ms/40ms `pathLength` tween shape, swap the bare `easeOut`/`easeIn`
  keywords for this repo's `easeOutStrong` cubic-bezier. Not a spring;
  `spring.quick`'s "icon crossfades" use-case is the closest tier
  conceptually but a spring on `pathLength` risks visually meaningless
  overshoot past full draw, so a tween stays the better fit here too.
- **Hover pill / focus ring**: `spring.fast`, verbatim — continuous,
  pointer-tracked, textbook case.
- **Selected-background merge/split**: `spring.moderate`, and port
  `useMergeSplitBlocks`'s technique close to verbatim (the corner-delay
  trail, the instant zero-shift swap on merge-commit, the pinned-then-
  diverge snap on split) — this is the single richest, most
  repo-specific-motion-language piece of prior art surveyed across either
  research pass, and it's already the literal precedent for this repo's
  own `spring.moderate` doc comment. The 0.07s `cornerDelay` and the
  `convergeMs`/`splitMs` resolve-timers (duration-derived, not
  `onAnimationComplete`-derived, specifically to survive rapid re-toggling)
  should port as close to verbatim as this repo's slightly different
  `spring.moderate` numbers (0.2s/bounce 0.12 vs. their 0.16s/bounce 0)
  allow — re-derive `cornerDelay`/`convergeMs`/`splitMs` from _this_ repo's
  `spring.moderate.enter.duration`, don't hardcode fluidfunctionalism's
  0.16s-derived constants.
- **CheckboxGroup vs. individual Checkbox as two files**: because neither
  Radix nor Ariakit exposes a first-class CheckboxGroup, and
  fluidfunctionalism's own source doesn't ship a standalone single
  Checkbox at all (only the group file), this repo should decide
  deliberately whether `checkbox.tsx` (single) is a real primitive in its
  own right or whether `CheckboxGroup`/`CheckboxItem` is the only shape
  shipped — matching React Aria Components' precedent (the one library
  that treats grouped-checkbox state as a first-class, separately-testable
  concern) argues for keeping both: a plain `Checkbox` for lone use, and
  `CheckboxGroup` layering the proximity-hover + merge/split treatment on
  top when there's more than one.

---

## Radio / RadioGroup

### fluidfunctionalism.com implementation

Present: [`registry/base/radio-group.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx)
(Base UI `RadioGroup`/`Radio` primitives).

- **Selected background**: a single continuously-tracked rect on
  `spring.moderate`
  ([lines 160–177](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L160-L177)) —
  no merge/split geometry at all, because at most one radio is ever
  selected, so there's never more than one contiguous run to reconcile.
  This is the direct point of contrast with CheckboxGroup: same tier, far
  simpler code, precisely because a radio group's selection-count
  invariant (0 or 1) removes the entire class of problem the merge/split
  hook exists to solve.
- **Hover pill + focus ring**: identical `spring.fast` recipe to
  CheckboxGroup, same file structure
  ([hover, lines 179–206](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L179-L206);
  [focus, lines 208–227](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L208-L227)).
- **Dot scale-in** — `RadioItem`
  ([lines 379–393](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L379-L393)):
  ```tsx
  initial={{ opacity: skipAnimation ? 1 : 0, scale: skipAnimation ? 1 : 0.3 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.04 } }}
  transition={spring.fast}
  ```
  Unlike the checkmark, this one _is_ a real spring tier (`spring.fast`) on
  `scale`+`opacity` — a scale property tolerates a touch of spring
  overshoot far better than a `pathLength` draw does, which is presumably
  why fluidfunctionalism treated the two check-adjacent affordances
  differently (checkbox = tween-on-path, radio = spring-on-scale).
- **Roving-tabindex fallback**: with no selection, the first item stays
  tabbable so the group remains keyboard-reachable
  ([lines 330–332](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L330-L332)) —
  structural, not motion, but a correctness detail worth porting alongside
  it.

### Other motion-forward open-source prior art

**Radix UI RadioGroup** — first-class, built on `RovingFocusGroup`:
[`packages/react/radio-group/src/radio-group.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/radio-group/src/radio-group.tsx)
wraps items in
[`RovingFocusGroup.Root`](https://github.com/radix-ui/primitives/blob/main/packages/react/radio-group/src/radio-group.tsx#L114-L130)
with `orientation`/`loop` (default `true`) props
([lines 57–77](https://github.com/radix-ui/primitives/blob/main/packages/react/radio-group/src/radio-group.tsx#L57-L77)).
[`radio.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/radio-group/src/radio.tsx)'s
`RadioIndicator` wraps `Presence` with `forceMount`, same "for animation
control" pattern as Checkbox
([lines 240–255](https://github.com/radix-ui/primitives/blob/main/packages/react/radio-group/src/radio.tsx#L240-L255)).
No built-in transitions — pure headless state + roving focus.

**Ariakit RadioGroup** — also first-class:
[`radio/radio-group.tsx`](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/radio/radio-group.tsx)
is built on Ariakit's shared `Composite` roving-focus primitive
([import, line 17](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-react-components/src/radio/radio-group.tsx#L17);
usage inside `useRadioGroup`), the same composite-navigation base Ariakit's
Menu/Tab/Toolbar share. No animation values shipped.

**React Aria Components RadioGroup** — also wraps its children in the same
[`SharedElementTransition`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/SharedElementTransition.tsx)
scope ToggleButtonGroup uses
([`RadioGroup.tsx` line 45 (import), line 331](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/RadioGroup.tsx#L331)) —
see the ToggleGroup section below for how that mechanism actually animates
a moving selected-indicator via native CSS transitions and a FLIP
(rect-snapshot + inverse-transform) technique, rather than a JS spring.
This is the one place in the survey where React Aria Components ships an
actual first-party motion mechanism rather than only `data-*` hooks.

### Design commentary from named practitioners

**Rauno Freiberg**,
[github.com/raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces):
same "frequent, low-novelty actions should avoid extraneous animation"
principle (line 41) and press-scale guidance (line 40) cited under
Checkbox apply equally here — no radio-specific bullet exists beyond that.

No component-specific post from Emil Kowalski on radio buttons turned up;
his general 180ms-select and sub-300ms-duration guidance
(`7-practical-animation-tips`) is the same guidance already cited for
Select and doesn't need re-quoting here to avoid padding.

### Synthesis

- **Selected background**: `spring.moderate`, verbatim — single-block
  tracking, no merge/split needed, this is squarely the "short travel...
  panels that must land exactly" half of this repo's tier definition, and
  fluidfunctionalism's own choice of a critically-damped tier for the same
  reason (land exactly, no overshoot past the newly-selected row) confirms
  it.
- **Dot scale-in**: `spring.fast`, verbatim — this is the one check-adjacent
  affordance across all five primitives that's a genuine spring rather
  than a tween, and it should stay one; scale tolerates the tier's small
  bounce far better than a stroke draw does.
- **Hover pill / focus ring**: `spring.fast`, verbatim, same as every
  other proximity-hover list in this repo.
- Port Radix's `RovingFocusGroup`-equivalent behavior (or Base UI's own
  `RadioGroup` composite nav, which this repo should already get for free
  from `@base-ui/react/radio-group`) rather than hand-rolling arrow-key
  wrap-around the way fluidfunctionalism's source does in
  [lines 116–152](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/radio-group.tsx#L116-L152) —
  that file predates a stable Base UI RadioGroup composite and works
  around it manually; this repo's direct-Base-UI-wrap methodology (per
  `docs/primitives.md`'s existing Menu/Accordion/Tabs entries) should lean
  on Base UI's native roving nav instead of re-deriving it.

---

## Toggle / ToggleGroup

### fluidfunctionalism.com implementation

**Not present.** The repo's file tree
([github.com/mickadesign/fluid-functionalism](https://github.com/mickadesign/fluid-functionalism),
both `registry/base/` and `registry/radix/`) has no `toggle.tsx` or
`toggle-group.tsx` in either variant — confirmed against the live listing
(`accordion, button, checkbox-group, dialog, dropdown, mobile-drawer,
radio-group, scroll-area, select, slider, switch, tabs, tabs-subtle,
thinking-steps, tooltip`).

Two architectural cousins exist, and this repo already has its own
even-closer cousin already shipped:

- **This repo's own `tabs.tsx`** (`src/components/ui/tabs.tsx`) already
  implements exactly the motion a segmented/pressed ToggleGroup needs: a
  moving "active segment indicator" rect on `spring.moderate.enter`
  (`src/components/ui/tabs.tsx` line 243), a separate hover pill on
  `spring.fast` (`src/components/ui/tabs.tsx` lines 260–261). This is a
  stronger, more directly reusable precedent than anything in
  fluidfunctionalism's tree for ToggleGroup's segmented-control shape,
  since it's already retuned onto this repo's own four tiers.
- **fluidfunctionalism's own `tabs.tsx`**
  ([`registry/base/tabs.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tabs.tsx),
  the direct ancestor of the file above) shows the same "Active segment
  indicator" pattern pre-retune
  ([lines 284–303](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tabs.tsx#L284-L303)):
  `spring.moderate` on `left/width/top/height/opacity`, a separate hover
  indicator layered underneath on `spring.fast`
  ([lines 306–346](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/tabs.tsx#L306-L346)).
- **Switch's press-squish** (`registry/base/switch.tsx`, already the
  precedent for this repo's shipped `switch.tsx`) is architecturally a
  _different_ moment — a single binary thumb that stretches/squishes and
  can be dragged between exactly two positions — not obviously the right
  metaphor for a toggle _button_ (no thumb, no track, no drag axis). It's
  the right precedent for a Switch-shaped on/off control, not for a
  press-state fill on a button-shaped Toggle.

### Other motion-forward open-source prior art

**Does Radix expose a first-class `ToggleGroup`? Yes — unlike Checkbox,
Toggle has a dedicated group package.**
[`packages/react/toggle-group/src/toggle-group.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle-group/src/toggle-group.tsx):

- `ToggleGroupType.Single | Multiple`
  ([lines 18–23](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle-group/src/toggle-group.tsx#L18-L23))
  — single-select (radio-like, exactly one pressed) or multi-select
  (checkbox-like, any number pressed) modes on the _same_ component,
  something neither Checkbox nor RadioGroup needs since they're
  single-purpose by construction.
- Built on the same `RovingFocusGroup`
  ([import, lines 4–5](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle-group/src/toggle-group.tsx#L4-L5))
  RadioGroup uses, wrapping individual
  [`Toggle`](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle/src/toggle.tsx)
  primitives
  ([`ToggleGroupItemImpl`, lines 290–299](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle-group/src/toggle-group.tsx#L290-L299)).
- The standalone `Toggle` primitive itself is the simplest primitive
  surveyed across either research pass — 67 lines total, `data-state="on"
|"off"` is its only styling hook
  ([`toggle.tsx` lines 44–47](https://github.com/radix-ui/primitives/blob/main/packages/react/toggle/src/toggle.tsx#L44-L47)),
  no `Presence`/`forceMount` at all (a toggle button doesn't mount/unmount
  on press, so there's nothing to defer-unmount).

**Ariakit ships neither a `Toggle` nor a `Slider` primitive at all** —
confirmed against the full `packages/` tree: no file matching
`toggle*`/`slider*` exists anywhere in
[github.com/ariakit/ariakit](https://github.com/ariakit/ariakit). This is a
genuine gap in Ariakit's surface relative to Radix and React Aria
Components, not an oversight in this research.

**React Aria Components** — also first-class, `ToggleButton` +
`ToggleButtonGroup`:
[`ToggleButtonGroup.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/ToggleButtonGroup.tsx)
wraps its children in
[`<SharedElementTransition>`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/ToggleButtonGroup.tsx#L99)
— the most motion-forward first-party mechanism found in either research
pass across all eleven primitives surveyed so far. Reading
[`SharedElementTransition.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/SharedElementTransition.tsx)
(2025-dated file, a genuinely recent addition):

- A consumer places a `<SharedElement name="...">` (e.g. a selected-pill
  background) inside each toggle button; on unmount it snapshots
  `getBoundingClientRect()` and the computed `transitionProperty` values
  into a shared scope keyed by `name`
  ([lines 160–174](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/SharedElementTransition.tsx#L160-L174)).
- On the _next_ mount under the same `name` (i.e. the pill "moving" to a
  newly-selected button), it applies the old rect as an inverse
  `translate` and the old computed style values, then releases them one
  `requestAnimationFrame` later so the browser's own CSS transition
  animates from the old position/style to the new one
  ([lines 100–130](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/SharedElementTransition.tsx#L100-L130)) —
  a textbook FLIP (First-Last-Invert-Play) implementation, driven by
  native CSS transitions rather than a JS animation library.
- This is real, working, first-party prior art for exactly the "moving
  highlight tracks the pressed segment" moment a ToggleGroup needs — an
  independent, DOM-measurement-based solution to the same problem this
  repo already solves with Motion + `useProximityHover` rects.

### Design commentary from named practitioners

**Rauno Freiberg**,
[github.com/raunofreiberg/interfaces](https://github.com/raunofreiberg/interfaces):
"Toggles should immediately take effect, not require confirmation"
(line 15) — the clearest primary-source guidance found for this primitive
across both practitioners: no confirm-on-toggle pattern, no animation
that delays the state actually flipping.

**Emil Kowalski**,
[emilkowal.ski/ui/you-dont-need-animations](https://emilkowal.ski/ui/you-dont-need-animations):
same high-frequency-control guidance cited under Checkbox — toggles are
named explicitly in that post's framing of controls that should "never"
carry elaborate animation. Not re-quoted verbatim here to avoid repeating
the same source twice; see the Checkbox section above for the exact
wording.

### Synthesis

- **Segmented ToggleGroup's moving indicator**: `spring.moderate`, ported
  from this repo's own already-shipped `tabs.tsx` active-segment-indicator
  recipe rather than reaching back to fluidfunctionalism's tabs.tsx
  ancestor — the in-repo version is already on the correct four-tier
  system and is a closer structural match (a row of mutually-exclusive
  segments) than anything Toggle-specific in either external source.
- **Individual Toggle's pressed-state fill**: not a spring-worthy moment
  at all per Rauno's "immediately take effect" guidance and Emil's
  high-frequency-control framing — a plain, fast color/background
  transition (CSS `transition-colors`, same treatment Switch already gives
  its track color) rather than a `spring.*` tier. If a press-scale is
  wanted, adopt Rauno's ~0.96–0.97 press-scale guidance (cited under
  Checkbox) rather than inventing a bespoke value.
- **Multi-select ToggleGroup (Radix's `type="multiple"` mode)**: reuses
  CheckboxGroup's selected-background merge/split treatment conceptually
  (contiguous pressed runs can merge/split exactly like contiguous checked
  rows) — same `spring.moderate` + `useMergeSplitBlocks`-style hook,
  parameterized over "pressed" instead of "checked."
- **Single-select ToggleGroup (Radix's `type="single"` mode)**: reuses
  RadioGroup's single continuously-tracked-rect treatment instead — no
  merge/split needed, exactly one segment highlighted at a time.
- **React Aria's `SharedElementTransition`/FLIP mechanism**: worth reading
  as an alternate _implementation strategy_ (CSS-transition-driven,
  DOM-measurement-based) but not worth porting over this repo's existing
  Motion + `useProximityHover` approach — the two solve the identical
  problem, and switching techniques primitive-by-primitive would fragment
  the house motion system for no behavioral gain.
- **Does Toggle share code with Switch?** No — architecturally distinct
  (button vs. thumb-on-track), confirmed by inspecting both Radix's
  `toggle.tsx` (`data-state` only, no drag/press-physics of any kind) and
  fluidfunctionalism's `switch.tsx` (all its physics is thumb-position/
  thumb-size specific). Don't reach for Switch's hover-stretch/press-squish
  constants here.

---

## Slider

### fluidfunctionalism.com implementation

Present, and unusually large: [`registry/base/slider.tsx`](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx),
1,662 lines, exporting **two** components —
`Slider` (thin 16↔20px-thumb range/single slider,
[lines 316–1104](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L316-L1104))
and `SliderComfortable` (a bigger touch/scrubber-style slider with
`pips`/`scrubber` variants,
[lines 1105–1661](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L1105-L1661)).

**Does Slider share Switch's hover-stretch/press-squish drag-to-toggle
physics? No — checked directly, and the answer is a clean no across both
exported components.** Switch's squish technique is driven by three named
deltas (`hoverExtend`/`pressExtend`/`pressShrink`, ported into this repo's
own `switch.tsx` as `hoverExtend`/`pressExtend`/`pressShrink`) that resize
the thumb itself on hover/press. Slider's thumb has no equivalent:

```tsx
// base-slider.tsx lines 796–812 — thumb visual, unconditional on isHovered/isPressed
animate={{ width: THUMB_SIZE_REST, height: THUMB_SIZE_REST }}
transition={spring.fast}
```

([lines 774–818](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L774-L818))
— the dot always animates to the same rest size regardless of hover/press
state; `THUMB_SIZE` (20) only sizes an invisible pointer hit-box wrapper
around it
([lines 69–75](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L69-L75)),
never the visible dot. `SliderComfortable`'s handle
([lines 1425–1433](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L1425-L1433))
carries no size-morph at all — just a focus outline. Neither export
resizes the thumb on `isHovered`/`isPressed`; the only piece of
hover-reactive thumb-adjacent geometry anywhere in the file is a
**step-dot** growing 1.25× on hover (`DOT_SIZE * 1.25`, `spring.moderate`,
[lines 1053–1061](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L1053-L1061)) —
a different element from the thumb entirely.

What Slider _does_ share with Switch: the same low-level primitives
(`useMotionValue` + `animate()` from Motion, direct `motionX.set()` during
an active drag rather than a spring re-target every pointermove, a
`dragging` ref gate) — the general Motion-usage _pattern_, not any actual
constant or code. Concretely:

- **Click-to-position and release-to-snap both animate on `spring.moderate`**
  ([click, line 607](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L607);
  [release settle, line 686](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L686);
  [resize-observer resync, lines 496–522](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L496-L522)) —
  clicking anywhere on the track springs the thumb there; step-snapping on
  release springs to the quantized value.
- **During an active drag, position is set directly, no spring** — Switch's
  drag handler does the same thing (`motionX.set(...)` in `onPointerMove`,
  only springing on release), confirming this "1:1 while dragging, spring
  only to settle" split is the house pattern already established by
  Switch, not something Slider needs to newly justify
  ([`handlePointerMove`, lines 626–673](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L626-L673)).
- **Track fill is derived, never separately animated**: `fillWidthSingle`/
  `fillLeft` are `useTransform(motionX0, ...)`
  ([lines 402–406](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L402-L406)) —
  because they're a pure function of the thumb's own (spring-animated)
  motion value, the fill rides whatever spring is currently driving the
  thumb with zero extra animation code, and can never desync from thumb
  position mid-transition. Worth porting as a technique regardless of
  which spring tier the thumb itself lands on.
- **Hover-value tooltip**: `spring.fast` enter/exit,
  `opacity`+`y` only, gated behind a 100ms hover delay before showing
  ([delay, lines 386–394](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L386-L394);
  render, [lines 957–979](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L957-L979)) —
  same shape as Preview Card/Tooltip's own recipe already surveyed in the
  overlay-menu doc.
- **Hover-preview bar** (the highlighted region between current value and
  cursor) fades in on a flat `{ duration: 0.15 }`, not a spring tier at all
  ([lines 1014–1024](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L1014-L1024)).
- **Focus ring on the thumb**: `spring.fast`, `opacity`+`width`+`height`
  ([lines 815–818](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L815-L818)).

### Other motion-forward open-source prior art

**Radix UI Slider** —
[`packages/react/slider/src/slider.tsx`](https://github.com/radix-ui/primitives/blob/main/packages/react/slider/src/slider.tsx):
purely headless positioning math, no motion values of any kind.
`data-orientation`/`data-disabled` are the only styling hooks
([lines 563–564](https://github.com/radix-ui/primitives/blob/main/packages/react/slider/src/slider.tsx#L563-L564),
[741–742](https://github.com/radix-ui/primitives/blob/main/packages/react/slider/src/slider.tsx#L741-L742)).
The one structural technique worth porting is `getThumbInBoundsOffset`
([line 908](https://github.com/radix-ui/primitives/blob/main/packages/react/slider/src/slider.tsx#L908),
used at [line 722](https://github.com/radix-ui/primitives/blob/main/packages/react/slider/src/slider.tsx#L722)) —
nudges the thumb's rendered position inward near the track ends so a
20px-wide thumb never renders center-clipped past the track edge; worth
checking this repo's own inset math (`TRACK_INSET` in fluidfunctionalism's
source) already handles the equivalent case.

**Ariakit ships no Slider at all** — see the ToggleGroup section above;
confirmed against the same full-tree search.

**React Aria Components** —
[`Slider.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Slider.tsx):
exposes `data-hovered`/`data-dragging`/`data-focused`/`data-focus-visible`
on the thumb as its only styling hooks
([lines 355–361](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Slider.tsx#L355-L361)) —
consistent with every other React Aria Components primitive surveyed:
`data-dragging` specifically is the documented hook for a consumer to
suppress CSS transitions during an active drag (the same "no spring while
actively dragging" rule fluidfunctionalism's source encodes procedurally
via its `dragging` ref).

### Design commentary from named practitioners

No component-specific post from Emil Kowalski or Rauno Freiberg turned up
for the form-range Slider specifically. (Emil's design-eng material has a
"Comparison sliders" technique —
[`emil-design-eng` skill, referenced via github.com/emilkowalski/skills](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) —
but that's an image-comparison `clip-path` slider, a different UI pattern
entirely from a form range-input Slider; not cited as commentary on this
primitive to avoid a misleading match.) Rauno's general momentum/damping
gesture guidance (`interfaces.md`, cited under Drawer in the overlay-menu
doc — velocity-based release, boundary damping) is drag-gesture guidance
in general, not Slider-specific, so it's not re-quoted here as a fresh
citation.

### Synthesis

Four distinct motion moments, matching the task's framing exactly:

- **Thumb drag**: no spring at all while the pointer is actually down —
  direct `motionX.set()`, confirmed as fluidfunctionalism's own technique
  and consistent with React Aria's `data-dragging` hook existing
  specifically so consumers suppress transitions during drag. This is a
  "don't animate" moment, not a tier-selection one.
- **Thumb press-squish**: **does not exist** in fluidfunctionalism's
  Slider — confirmed by direct code inspection, not merely absence of a
  citation. Don't invent one to mirror Switch; the source precedent
  explicitly doesn't carry that technique over from Switch to Slider, and
  a value-precision control arguably shouldn't squish its hit target the
  way a binary on/off thumb can afford to.
- **Thumb hover-stretch**: also absent on the thumb itself in
  fluidfunctionalism's source (present only on the _step dots_, a
  different element). If this repo wants a hover-affordance on the thumb,
  it isn't ported from an existing precedent — it'd be a novel addition,
  and should be flagged as such rather than presented as adapted.
- **Click-to-position / release-to-snap**: `spring.moderate`, verbatim —
  matches this repo's tier definition ("panels that must land exactly")
  precisely, and is directly comparable to Switch's own drag-release snap
  (also `spring.moderate` in this repo's `switch.tsx`), so it's a
  reinforcing precedent rather than a new one.
- **Track fill**: derive it via `useTransform` off the same motion value
  driving the thumb, verbatim technique — never a separately-animated
  property, so it can't desync from the thumb mid-spring.
- **Hover-value tooltip**: `spring.fast`, verbatim — same shape as Preview
  Card/Tooltip.
- **Step/tick snapping**: fluidfunctionalism's source doesn't animate a
  distinct "snap" moment beyond the release spring settling on the
  quantized value (`pixelToValue`/`valueToPixel` with a `stepValues` list,
  [lines 81–115](https://github.com/mickadesign/fluid-functionalism/blob/main/registry/base/slider.tsx#L81-L115)) —
  the settle _is_ the snap feedback; no separate tick-flash or
  haptic-style animation to port.
