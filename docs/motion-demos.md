# Motion demos

A backlog of small, standalone motion builds. These are not registry
components and don't need to compose from house primitives or earn a
behavioural purpose the way [planned components](ideas.md) do — the entire
point is the opposite: one interaction, zero context, a single wow moment
that lands before anyone reads a caption.

The bar for each is simple: would a stranger with no idea what trovecn is
stop scrolling and watch it twice.

## Staging notes

- **Light mode wins.** Demo clips read cleaner and more shareable in light
  mode than dark — this is the opposite bias from the shipped registry,
  where dark is often the default preview. Build and record these in light
  mode first; only add a dark variant if the effect specifically needs
  contrast to read.
- Crop tight to the interacting element only — no browser chrome, no
  surrounding nav.
- Loop anything under ~3 seconds instead of ending on a hard cut.
- Let the motion carry it. No caption should be required to understand what
  happened.

## Ideas

### Clip-path comparison slider

Drag a divider between two states of the same UI (a plain button next to its
motion-polished version, or two color themes) and watch the top layer reveal
the one underneath in real time. The wow moment is that it feels like one
image, not two swapped on drag — entirely `clip-path: inset()`, no extra DOM
per frame.

### Hold-to-delete button

Press and hold; a fill creeps across the button over ~2s, linear. Release
early and it snaps back in ~200ms. The wow moment is the asymmetry itself —
slow while you're deciding, instant the moment you let go. Get this pairing
wrong (same speed both ways) and the whole effect disappears.

### Magnetic button

The button subtly pulls toward the cursor within a small radius, using a
spring on the offset, and snaps back the instant the cursor leaves. Purely
decorative — no functional payload — which is exactly why it works as a demo
clip. The wow moment is that it feels alive before you've clicked anything.

### Duplicate-layer tab underline

Two copies of the same tab list stacked; the top copy is clipped to only
reveal the active tab, styled in the "selected" palette. Switching tabs
animates the clip boundary instead of transitioning a background-color. The
wow moment is a color swap with a crispness no property transition can
match — it reads as one shape sliding, not a color fading.

### Drag-to-reorder list with real momentum

Reordering a list responds to velocity, not just drop position — a fast flick
commits before the item even reaches its slot, dragging slowly lets you
hover between two spots indefinitely. The wow moment is interrupting a drag
mid-flight and having it reverse smoothly from wherever it currently is,
instead of snapping back to a start point.

### 3D flip / orbit card

A stat or profile card flips on `rotateY` with `preserve-3d` to reveal a
back face, or a small satellite element orbits a central one using
`translateZ` for real depth. The wow moment is depth that a 2D scale/opacity
trick can't fake — it has to be seen in motion to register as 3D at all.

### Stagger reveal on scroll

A list or grid reveals item by item as it enters the viewport, each one
clip-path-revealing from the bottom with a 40-60ms cascade between items,
firing once via `IntersectionObserver`. The wow moment is the rhythm of the
cascade itself — too synced feels robotic, this should feel like a ripple.

### Blurred crossfade number ticker

A number or stat swaps to a new value through a quick blur-mask crossfade
instead of a hard cut or a slot-machine roll. The wow moment is that it
shouldn't be readable mid-transition and yet feels completely smooth — the
blur is doing the work of hiding two objects overlapping.

### Elastic drag-dismiss card

Drag a card off-screen; resistance increases the further it goes near the
edges (damping, not a hard wall), and it only dismisses past a velocity
threshold — a slow drag can be released and it springs back home. The wow
moment is the card feeling weighted, like it has real resistance instead of
just following the cursor 1:1.

### Segmented control with an overshooting pill

A sliding pill background jumps between segments with a spring that
slightly overshoots (bounce ~0.15-0.2) before settling. The wow moment is in
the overshoot specifically — a pill that stops dead the instant it arrives
reads as digital; the tiny overcorrection reads as physical.

### Command item → detail view morph

Clicking a compact row expands it in place into a full detail view — same
element growing and reflowing its content, not a separate panel opening on
top of it. The wow moment is the illusion that it's literally the same
object, just bigger, which is what shared-layout / FLIP-style techniques are
built to sell.

## Build order

Lead with whichever has the shortest path from idea to a clean 3-second
loop, not necessarily the most technically interesting — a shippable clip
beats a half-finished spring simulation. Hold-to-delete and the comparison
slider are the cheapest builds on this list; the drag-to-reorder and
command-item morph are the most involved.
