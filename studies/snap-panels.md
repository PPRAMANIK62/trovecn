# snap-panels

Resizable panels with a divider that leans toward its snap points instead of
clamping to them.

## The test

**1. Would someone reach for this while building a product?**

Yes. IDE layouts, dashboards, editors, mail clients, anything with a sidebar.
This is furniture, not a showreel piece.

**2. How it behaves under the hand.**

> **Theirs.** You drag the divider and the panels resize. A collapse threshold
> snaps it shut at the very end.

> **Ours.** You drag the divider and it leans toward the nearest snap point as
> you get close, parks there while your pointer keeps moving, then breaks free
> when you pull past it. Let go in between and it settles into the nearer one
> carrying the speed you released at, and you can catch it mid-settle.

**3. Better than the best version anywhere?**

Unusually, yes against both web and native.

`react-resizable-panels` is the incumbent and every registry Resizable wraps it,
including shadcn's and ReUI's. Snap points there are an open feature request,
`bvaughn/react-resizable-panels#304`, not a feature. Native is no better.
macOS split views, Xcode, and Figma clamp at a threshold and jump the divider
the rest of the way.

It is rare for the answer to question 3 not to be a native app. That is the
reason to build this one.

## Placement

```
src/components/trovecn/layout/snap-panels.tsx
registry/trovecn/snap-panels/meta.ts
registry/trovecn/snap-panels/registry.ts
registry/trovecn/snap-panels/examples/*.tsx
```

New `layout` collection, new category `Layout`. No new dependencies: `motion`
and `cn()` only. Base UI has no resizable primitive, so this is hand-written.
That does not violate the rule against hand-writing Base UI wrappers, which is
about primitives the shadcn CLI can scaffold.

## The mechanism

The motion is the component, so this states the derivation rather than running
the playbook.

The divider's rendered position is not the pointer position. For a raw offset
`d` from the nearest snap point, within capture radius `R`:

```
rendered(d) = d · (1 − s · w(|d| / R))        w(t) = (1 − t²)²,  s = 0.85
```

`w` is 1 at the snap and 0 at the radius edge, **with zero slope at the edge**.
That second property is the one that matters: it makes the boundary of the
magnetic field invisible, so entering and leaving it has no felt step. Without
it the field has walls and reads as a dead zone rather than an attraction.

Measured at `R = 24`, `s = 0.85`:

```
 pointer px from snap  →  divider px from snap
        0.5            →       0.08
        1              →       0.15
        2              →       0.32
        4              →       0.79
        8              →       2.63
       12              →       6.26
       16              →      11.80
       20              →      18.41
       24              →      24.00   ← exactly R, continuous with free tracking
```

Three properties, all confirmed numerically before any code was written:

- **Monotonic.** The divider never moves backwards while the pointer moves
  forwards. The obvious alternative, subtracting a gaussian correction
  (`d − A·e^(−d²)`), is not monotonic for useful values of `A`, and produces a
  divider that reverses mid-drag. That reads as a bug, and it is the reason to
  derive this curve rather than reach for the familiar one.
- **Gain 0.15× at the snap point.** Parked, not frozen. Tracking never stops,
  which is the difference between magnetism and a dead zone. A
  strength of exactly 1 would pin the divider and break the house rule that
  input is tracked while it is happening.
- **Peak gain 1.68× at 78% of R.** The break-free acceleration falls out of the
  curve. No separate animation, no threshold, no extra state. Swept across
  `s = 0.70…0.95` the peak stays between 1.56 and 1.76 and always sits at the
  same 78%, so `s` tunes the parked stiffness and nothing else. One knob, one
  effect.

### Overlapping fields

Per-snap capture radius is `min(R, half the distance to the nearest
neighbouring snap)`.

Without this, two snap points closer together than `2R` produce a midpoint
where the nearest-snap target flips, and the divider jumps across the gap
between the two fields. Nothing warns about this. It only appears once a
component ships with two snaps close together, which is exactly what a sidebar
with a collapsed state and a narrow state has.

### Velocity carried into the settle

The settle spring is seeded with the **rendered** velocity
(`gain × pointer velocity`), not the pointer's.

Near a snap the divider is already moving at 0.15× the pointer. Seeding the
spring with raw pointer velocity would fling it straight through the point it
was parked on, which is the opposite of what the release is supposed to
express.

### Re-grab

On grab, anchor the raw position to the current rendered position and stop any
running animation. The map is monotonic so no numerical inversion is needed,
and re-grabbing while parked on a snap puts the pointer back inside that snap's
field.

This is the part no existing library can do, and the reason the gesture loop
has to be ours rather than layered on top of one.

## Interaction

|                        |                                                                                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grab                   | `setPointerCapture` on the handle. `touch-action: none`, or touch drags scroll the page. `user-select: none` on the group and the resize cursor on `document.body`, so both survive the pointer leaving the handle.                                                               |
| Drag                   | 1:1 through the magnetic map. No smoothing and no spring. Smoothing puts lag between the pointer and the divider, which is the thing this component exists to remove.                                                                                                             |
| Release inside a field | Settle spring to the snap, seeded with rendered velocity.                                                                                                                                                                                                                         |
| Release outside        | Stays where you left it. A snap point is a preferred position, not a clamp.                                                                                                                                                                                                       |
| Catch mid-settle       | Stops the animation, resumes tracking from the current value and velocity.                                                                                                                                                                                                        |
| `pointercancel`        | Ends the drag. Otherwise it hangs held.                                                                                                                                                                                                                                           |
| Double-click handle    | Cycles to the next snap point through the same spring. Free, and it is what people try.                                                                                                                                                                                           |
| Keyboard               | `role="separator"`, `tabIndex=0`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, `aria-orientation`, `aria-controls` on the panel it sizes. Arrows nudge by a fixed step, `PageUp` / `PageDown` jump snap to snap, `Home` / `End` to min and max, `Enter` toggles collapse. |
| Container resize       | `ResizeObserver` on the group re-clamps against min sizes.                                                                                                                                                                                                                        |

**Magnetism is pointer-only.** Keyboard input is already discrete and precise,
so bending it toward snaps would fight the user rather than help them. Departure
from the component's own signature behaviour, named here and in the header.

## Motion

Everything below is under the gesture-and-physics exemption in `@/lib/springs`,
so the curves are bespoke and each one carries its reason.

- **Settle.** `{ type: "spring", duration: 0.3, bounce: 0.12 }`. Much less
  bounce than `elastic-slider`'s 0.35, and the gap between them is the point. A
  4px overshoot is visible along the panel's entire height. The same 4px on a
  24px band is not. A panel that springs past its snap and comes back reads as
  sloppy rather than elastic.
- **Snap ticks.** Invisible at rest. Faded in on grab and out on release with
  `spring.quick`, whose exit is already the faster half. The captured one
  brightens. A divider is seen constantly, and the chrome around a signature
  detail is not exempt from the constant tier, so the guides exist only while
  you are doing the thing they guide.
- **Handle hover.** Colour only, `--border` to a step warmer. No 1px to 2px
  width change: two pixels of movement does not get clearer by lasting longer,
  and here it cannot be made bigger without the handle becoming furniture.
- **One focal movement.** The divider. The panels are consequence and the ticks
  are support.

### Reduced motion

Magnetism **stays on**. It is feedback about where the snap is, not decoration,
and the component would lose its point without it. Releasing near a snap still
lands you on it.

The settle becomes an instant set, because it animates size and every size
animation is gated. Tick fades are opacity, so they survive untouched.

## Performance

The drag writes to a CSS custom property on the group element
(`--tcn-panel-0`), and panels are sized by `flex-basis: var(--tcn-panel-0)`.
React re-renders once on commit, not once per frame.

Driving `flex-basis` through React state reflows the whole subtree every frame.
It is fine at two panels and janks at four, which is late enough to be missed
in a demo and early enough to be hit in real use.

## API

```tsx
<SnapPanelGroup direction="horizontal" onLayoutChange={persist}>
  <SnapPanel
    id="sidebar"
    defaultSize="280px"
    minSize="200px"
    snapPoints={[0, "280px", "380px"]}
    collapsible
  />
  <SnapPanelHandle />
  <SnapPanel id="main" minSize="30%" />
</SnapPanelGroup>
```

A `Size` is a `number`, meaning a percentage, or a pixel string typed as
`` `${number}px` ``. The template literal type means `"280px"` checks while
`"280"` does not. Sidebars are sized in pixels and content panes in percentages.
Forcing either unit on both makes half of real layouts wrong.

Snap points are declared **on the panel, in that panel's own size terms**,
because that is how people think about them. The sidebar snaps at 280. The
handle unions the constraints of the two panels it sits between.

### SnapPanelGroup

| Prop                       | Type                         | Notes                                                   |
| -------------------------- | ---------------------------- | ------------------------------------------------------- |
| `direction`                | `"horizontal" \| "vertical"` | Required.                                               |
| `layout` / `defaultLayout` | `Size[]`                     | Controlled and uncontrolled.                            |
| `onLayoutChange`           | `(sizes: Size[]) => void`    | Fires on commit. Persist here.                          |
| `onLayoutChanging`         | `(sizes: Size[]) => void`    | Fires continuously through the drag.                    |
| `captureRadius`            | `number`                     | Default 24. Clamped per snap to half the neighbour gap. |

No built-in `localStorage`. Where layout is persisted is the caller's decision
and the wrong thing for a copy-paste component to assume.

### SnapPanel

| Prop                                  | Type               | Notes                                                |
| ------------------------------------- | ------------------ | ---------------------------------------------------- |
| `id`                                  | `string`           | Used for `aria-controls` and layout callbacks.       |
| `defaultSize` / `minSize` / `maxSize` | `Size`             |                                                      |
| `snapPoints`                          | `Size[]`           | Positions this panel's edge is drawn to.             |
| `collapsible` / `collapsedSize`       | `boolean` / `Size` | Adds an implicit snap at `collapsedSize`, default 0. |
| `onCollapse` / `onExpand`             | `() => void`       |                                                      |

### SnapPanelHandle

| Prop                     | Type      | Notes                             |
| ------------------------ | --------- | --------------------------------- |
| `disabled`               | `boolean` |                                   |
| `aria-label`             | `string`  |                                   |
| `className` / `children` |           | Hit area is wider than the paint. |

### Scope decision: no push-through cascade

A handle resizes only its two adjacent panels, clamped by their min sizes.
Dragging handle 1 does not shove panel 2 into panel 3.

VS Code cascades. It roughly doubles the constraint solver, and it is reached
for rarely enough that the complexity is not obviously bought. Shipping local
only, named in the header as a departure. Revisit if a real layout needs it.

## Examples

1. **With and without.** Two identical two-panel groups stacked, one with
   `snapPoints` and one without. A direct A/B. This is the strongest thing on
   the page, and it is honest, because you feel the difference instead of
   reading a claim about it.
2. **Basic.** Sidebar and content, snapping at collapsed, 280, and 380. The
   description carries the capture radius and the break-free.
3. **IDE layout.** Nested groups. A horizontal sidebar and main, with main
   split vertically into editor and terminal snapping at 0, 30%, and 60%.
   Proves nesting and both axes.
4. **Collapsible sidebar.** A header button that collapses and restores through
   the same spring as the drag, so the button and the gesture produce identical
   motion. Shows `collapsible`, `onCollapse`, and imperative control by ref.

## Selling points

1. **Magnetic, not sticky.** It bends toward the snap and parks there while your
   pointer wanders, then breaks free when you mean it. No jump, no dead zone,
   and tracking never stops.
2. **Catchable mid-settle.** Grab it before it lands and it picks up from where
   it is at the speed it was going. No library does this, because they all
   resize on events and an event has already finished by the time you want to
   interrupt it.
3. **You never rest on a broken width.** The magnet turns the range where
   content clips into a place you pass through rather than a place you can stop.
   Snap points are what lets the component refuse to render an unusable panel.
4. **No dependencies.**

### The silent clip

Drag the divider toward a tick. The cursor keeps moving and the divider holds,
then breaks and races to catch up. Release between two snaps and grab it again
mid-flight.

Both read cropped and muted, because the cursor is in frame and the whole point
is the gap that opens between the cursor and the divider.

## Traps

- The settle animates size, so it is gated on `useReducedMotion()`.
- No hardcoded hex. If the tick colour needs a token it goes in `globals.css`
  with a comment at the definition.
- `--duration-*` is not a Tailwind namespace. Springs and bespoke curves only,
  never a raw duration utility.
- `new DOMRect()` at module scope returns a 500, because a `"use client"` file
  still runs on the server and Node has no `DOMRect`. Object literal cast for the
  fallback rect.
- Measure the group in a layout effect and keep the last value as a fallback. A
  new child has one blind frame before any observer fires, and a zero reaching
  the geometry divides by the container width.
- The demos reserve the group's height in a fixed box. Otherwise the vertical
  example resizes the stage and everything below it on the page moves.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing, per
  `AGENTS.md`.

## Build order

1. `snap-panels.tsx`. Group, panel, handle, the magnetic map, the
   CSS-variable drag loop. Horizontal, two panels, one snap point.
2. Interruption and velocity carry. Verify by screenshotting a mid-settle
   re-grab, not by typechecking.
3. Keyboard, ARIA, `ResizeObserver`, `pointercancel`.
4. Vertical, N panels, nesting.
5. Tick indicators.
6. Reduced-motion pass.
7. `meta.ts`, `registry.ts`, and the four examples.
8. The file header, covering everything `docs/design-system.md` asks for.
9. Delete the backlog entry in `docs/what-to-build.md`. Add nothing to `docs/`.
