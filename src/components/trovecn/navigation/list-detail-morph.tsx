"use client";

/**
 * ListDetailMorph — list to detail navigation where the row you pressed
 * *becomes* the detail view, and turns around from wherever it is if you leave
 * early.
 *
 * The motion is the component, so per `docs/design-system.md` this states the
 * choreography instead of running the playbook. There is one focal movement,
 * the row growing into the detail, and everything else waits for it.
 *
 * The signature detail is interruption. Press back before the open has landed
 * and the surface reverses from its current position and velocity rather than
 * snapping to the end state and playing the close from rest. Every View
 * Transitions demo of this pattern cuts on interruption, because that API
 * cannot do otherwise; Motion's projection can, which is the whole reason this
 * exists as a component instead of a CSS recipe.
 *
 * How it is built, and why each piece is the way it is:
 *
 * - The list never unmounts. The detail is an overlay over the same container
 *   and the row stays mounted underneath it. That is what makes scroll position
 *   free (nothing is destroyed, so nothing has to be restored) and what gives
 *   the return morph a live target to fly back to.
 * - The shell is the only element that changes size. It carries the `layoutId`,
 *   so Motion pairs the row's shell with the detail's shell and projects one
 *   into the other.
 * - Content sits in a fixed-size `layout` child of the shell. Without that the
 *   shell's projection scale reaches the content and stretches it: a circular
 *   avatar renders as a 2.5:1 ellipse partway through. `layout` gives the child
 *   its own projection, which cancels the parent's.
 * - The detail's body waits the shell's whole travel, not part of it. It is
 *   laid out at its final size throughout, so a shell still growing clips it
 *   and the cut falls mid-glyph. Text arriving before its container has made
 *   room is in the Avoid column of the house recipes, and here it is not a
 *   matter of taste: it is a visible slice through a word. See `CONTENT_LEAD`.
 *
 * The list stays mounted but does not stay visible. The rows fade out the
 * moment something opens, because while the shell is still travelling its edge
 * cuts across whatever rows it has not reached yet, and a row's rounded corner
 * sitting a few pixels off the shell's own reads as two stacked cards rather
 * than one surface growing. Measured opening the fifth row of six: the top
 * row's 12px corner and the shell's 16px corner were both on screen, fifteen
 * pixels apart, for about a third of the travel. Out quickly so the rows are
 * gone before the shell is halfway, back a notch slower so they have landed
 * before the shell returns to row size. Nothing else changes: the rows are
 * still mounted, still measured, still the target the return morph flies to.
 *
 * Every row but the one that opened. That exclusion is the whole reason this is
 * a fade per row instead of one fade on the list, which is what it was first
 * and which is subtly wrong in a way nothing warns about. Motion crossfades the
 * `layoutId` pair, holding the row's own content at full opacity through the
 * first half of the morph and clearing it at 95% of it, and the detail's body
 * is timed to arrive as that clears. Dimming the whole list multiplies the
 * opening row down to nothing in the first 50ms, which erases the near side of
 * that handover: the shell then spends most of its travel as an empty card
 * inflating, which is the generic version of this transition and the thing the
 * component exists to beat. The rows around it were the measured problem. The
 * one growing never was.
 *
 * The gesture. Drag the open detail down and it tracks your finger one to one,
 * shrinking as it goes so it reads as receding toward the row rather than
 * sliding off a screen edge. Release past `DISMISS_TRAVEL`, or flick faster
 * than `DISMISS_VELOCITY` from anywhere, and it commits: the close runs from
 * wherever your finger left it, because Motion snapshots the shell's rendered
 * position and that already carries the drag transform. Release short of both
 * and it springs back open under its own release velocity. Dragging *up* has
 * nowhere to go, so it gets the house saturating rubber band instead of a hard
 * stop, the same curve `elastic-slider` and `notification-stack` use.
 *
 * Scroll arbitration, which is the part that makes or breaks a gesture like
 * this. The detail's body scrolls, so a downward drag is almost always a
 * scroll and only sometimes a dismissal. The rule: a drag starting inside the
 * body engages only if the body was already at `scrollTop === 0` when the
 * pointer went down *and* the first `ENGAGE_SLOP` pixels of movement are
 * downward and more vertical than horizontal. Anything else releases the
 * gesture and lets the browser scroll normally, and the decision is made once
 * per press and never revisited. `ListDetailMorph.Handle` is the escape hatch:
 * a press there engages immediately whatever the scroll position, which is the
 * only way to dismiss from halfway down a long detail.
 *
 * The release velocity is measured across `VELOCITY_WINDOW`, not from the last
 * `pointermove` delta. Two moves are about 4ms apart on a 240Hz screen, so a
 * single delta turns three pixels of lift-off jitter into 750px/s and throws
 * the detail away on a gesture that was a tap. A window also lets a held drag
 * decay to nothing, so pulling halfway, stopping to read, and letting go does
 * not commit on a number taken before the pause. See `VELOCITY_STALE`.
 *
 * Bespoke constants, under the gesture-and-physics exemption in `@/lib/springs`.
 * A drag that tracks a pointer one to one and a release that carries velocity
 * are exactly what that exemption is for, and none of the four tiers can
 * express either. `LIFT_DECAY` and the `resist` shape are deliberately the same
 * as the other two components' so the collection keeps one physical vocabulary.
 * The shrink is not among them: it is a pure function of travel, so it is
 * derived from the drag rather than animated alongside it, which is what keeps
 * position and scale from arriving at different times on a fast release.
 *
 * Four departures from the house rules, each named where the rules ask:
 *
 * 1. `borderRadius` is an inline style value rather than a `rounded-*` class.
 *    Motion only scale-corrects properties it tracks, and an uncorrected radius
 *    bows into a barrel shape as the box grows. Measured, not assumed.
 * 2. The hairline is an inset `box-shadow` spread rather than a `border`.
 *    `border-width` is not in Motion's correction table
 *    (`motion-dom/.../scale-correction.mjs` registers only the radii and
 *    `box-shadow`), so a real 1px border thickens non-uniformly as the shell
 *    grows. `RING` below is exactly five parsed tokens, which is the most
 *    `correctBoxShadow` accepts before it gives up and returns the value
 *    untouched. It also costs the shell a pixel of padding: an inset shadow
 *    paints under any descendant's background, so an opaque child at the edge
 *    covers the hairline. See `RING_INSET`.
 * 3. The shell therefore cannot also carry `shadow-panel` or `shadow-card`.
 *    Those are three-shadow recipes, and adding one puts the parsed value over
 *    that five-token limit, which would silently drop the ring correction too.
 *    Separation comes from `--card` against `--background` instead, which is
 *    the house mechanism for it.
 * 4. The scroll fades are built from `black` rather than a token. A mask reads
 *    its gradient as an alpha channel, not as a colour, and it has to stay
 *    fully opaque in both themes, so a themed value would be wrong here rather
 *    than merely unnecessary.
 *
 * Both scroll containers fade the edge that has content past it. Without that a
 * boundary slices a row or a line of body text through the middle of its
 * glyphs, and in the detail the shell's corner curve then crosses the sliced
 * line, which is what makes it read as broken rather than merely cut off. The
 * fade is per edge and only where there is something beyond it, so a list that
 * fits its content carries no mask at all.
 *
 * The detail's body suppresses its *top* fade whenever a `Handle` is mounted.
 * A mask cannot fade content sliding under a pinned header while sparing the
 * header, because the two are the same pixels: measured, the header's text
 * washed from 18 to 75 out of 255 across the band. A pinned opaque header is
 * already the reason nothing shows at the top, so the fade has no work to do
 * when one is present, and it returns when there is none.
 *
 * Reduced motion: `MotionConfig reducedMotion="user"` at the root already stops
 * transform and layout animation, so the morph degrades to a crossfade between
 * row and detail on its own. The body's fade stays, since opacity is what the
 * house keeps.
 *
 * The gesture is not disabled by it. Dragging is direct manipulation, and a
 * surface that ignores a finger reads as broken rather than as calm; the house
 * rule is keep the feedback, drop the decoration. So the one-to-one downward
 * tracking stays and the flourishes around it go: no shrink, and the upward
 * rubber band becomes a hard clamp at zero. The commit itself is then a
 * crossfade rather than a morph, which is what the root config already does to
 * every other transition here.
 *
 * The list scrolls, the detail overlays it, and the root is the viewport both
 * of them fill. Two things follow from that, and both are the component's job
 * rather than the caller's.
 *
 * The root reserves a height while the detail is open. The overlay is
 * positioned, so it contributes nothing to flow, and the root is otherwise
 * only as tall as its list. Open the detail over a list that has since emptied
 * (a filter clearing, rows still loading) and the root falls to zero with the
 * visible detail inside it. Measured: an open detail over an empty list
 * rendered as a blank gap. So the list's last non-zero height is held as a
 * floor for as long as something is open, backed by `MIN_VIEWPORT` for the case
 * where there was never a row to measure. Callers can still size the root
 * themselves and usually should; this is the floor under them, not a policy.
 *
 * The return trip brings its row back into view first. The list scrolls
 * independently, so the row that opened the detail can be well outside the
 * viewport by the time you come back, and morphing toward a box that is off
 * screen reads as the card being thrown away rather than put back. `revealRow`
 * corrects the list's own `scrollTop` before the close is committed, so Motion
 * measures the row where it will actually be. It is invisible by construction,
 * because the detail is covering the list while it happens, which is also why
 * it can be instant: there is no second animation to run alongside the morph
 * and therefore nothing for the morph to fight. A row already in view is left
 * alone, and an interrupted dismissal is unaffected, since the scroll has
 * already happened and does not run again.
 *
 * Keyboard and screen readers. Rows are real buttons, so they are tabbable and
 * respond to Enter and Space for free, and each one carries `aria-expanded`
 * and `aria-controls` naming the region it opens. Escape closes from anywhere.
 * Opening moves focus to the detail region; closing returns it to the row that
 * opened it, so a keyboard user is never dropped at the top of the document.
 *
 * Focus goes to the region itself rather than to the first control inside it.
 * The region carries the accessible name, so landing there announces what you
 * just opened, and it makes the body's arrow-key scrolling work immediately.
 * `Close` is one Tab away and Escape works without it.
 *
 * The open detail does not trap focus, and the list is `inert` instead. The
 * detail covers the list completely, so nothing behind it should be reachable,
 * but this is not a modal dialog and content elsewhere on the page should stay
 * reachable. `inert` gives exactly that: the covered subtree leaves both the
 * tab order and the accessibility tree, while tabbing past the component still
 * works normally. A trap would have to be justified by modality this component
 * does not have.
 *
 * There is deliberately no live region. The morph is silent, but the focus move
 * that accompanies it is not: opening announces the region's name, closing
 * announces the row. A polite announcement on top of that would double-speak
 * every transition, which is worse than the silence it fixes.
 */

import {
  createContext,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

/** Corner radius of a collapsed row, in px. */
const ROW_RADIUS = 12;
/** Corner radius of the open detail. A larger surface carries a larger radius,
 *  and Motion interpolates between the two as the box grows. */
const DETAIL_RADIUS = 16;
/**
 * The hairline, as an inset shadow spread. Departure 2 in the header.
 *
 * Token order matters: `correctBoxShadow` parses this to
 * `[0, 0, 0, 1, "var(--border)"]` and bails at more than five entries. The
 * `var()` survives as one opaque token, so this stays theme-driven rather than
 * a hardcoded colour, and the `1px` spread is what gets divided by the scale.
 */
const RING = "inset 0 0 0 1px var(--border)";
/**
 * The ring's spread, repeated as padding on the shell.
 *
 * An inset shadow paints above the element's own background but *below* any
 * descendant's, so an opaque child at the shell's edge covers the hairline. The
 * sticky `Handle` did exactly that: the ring vanished down both sides for the
 * height of the pinned header and reappeared under it. Insetting every child by
 * the ring's own width is the fix that holds for whatever the caller renders,
 * rather than only for the header this component happens to ship.
 *
 * It is applied inline and therefore beats a padding class passed through
 * `className`, which is deliberate: this padding is structural, and a caller
 * who removed it would get a broken hairline with no obvious cause. Pad the
 * content you render inside a row, not the row itself.
 */
const RING_INSET = 1;
/**
 * Height of the fade over a scroll boundary, in px. Deep enough that a line of
 * body text dissolves rather than being sliced, shallow enough that it never
 * eats a whole row.
 */
const EDGE_FADE = 24;
/**
 * Clearance under the last line of the detail's body. At the end of the scroll
 * there is no fade left to hide behind, and the shell's corner curve reaches
 * exactly `DETAIL_RADIUS` inwards, so that is how much room the final line
 * needs to clear it.
 */
const BODY_TAIL = DETAIL_RADIUS;
/** Slack on the scroll-edge comparisons. Fractional scroll offsets and
 *  device-pixel rounding both land a pixel either side of a true edge. */
const EDGE_EPSILON = 1;
/**
 * How long the detail's body waits before it fades in, in seconds.
 *
 * The body is laid out at its final size for the whole morph, which is what
 * keeps its text undistorted, so a shell that has not finished growing clips
 * content that is already full size and the cut falls through the middle of a
 * glyph. Any overlap at all shows it.
 *
 * A fade at the boundary cannot rescue this. Projection is a paint transform,
 * so every descendant lays out at the settled size and a mask on one of them
 * fades at the settled edge, nowhere near where the shell is visibly cutting.
 * Tried it, and it changed nothing.
 *
 * The window is not empty, which is what makes the wait affordable. Motion
 * crossfades the `layoutId` pair: the row's content holds at full opacity for
 * the first half of the morph and clears at 95% of it
 * (`easeCrossfadeOut = compress(0.5, 0.95)` in `motion-dom`), so the row is
 * still painted inside the growing shell almost the whole way and hands over
 * as it goes. Keeping that handover intact is why the list dims per row rather
 * than as a whole — see `Item`.
 *
 * Half of `spring.slow.enter`'s duration, which is where that handover starts
 * rather than where it ends. Waiting the tier's full duration is the obvious
 * reading and it is too late by a wide margin: a spring quotes the time it
 * takes to settle, and this one is within three pixels of its final height at
 * about 190ms, so a body scheduled at 320ms arrives long after there is
 * anything left to clip.
 *
 * Instrumented per frame, opening the fifth row of six, measuring the row's
 * effective opacity and the body's against the shell's height:
 *
 *     lead    empty shell    body legible while clipped    readable at
 *     0.13          0ms                          9ms            192ms
 *     0.145        17ms                         none            213ms
 *     0.16         33ms                         none            225ms
 *     0.19         67ms                         none            252ms
 *     0.24        108ms                         none            308ms
 *
 * 0.13 buys its seamlessness by reintroducing the exact slice this constant
 * exists to prevent. 0.16 is the first value clear of it with margin, at a cost
 * of two frames where the shell holds nothing, and it is the one anchored to
 * something — retune the tier and this still means "as the handover begins".
 */
const CONTENT_LEAD = 0.16;
/**
 * Floor for the reserved viewport, in px. Only reached when the detail is
 * opened over a list that is itself empty, which is a real state: filter to no
 * results, or open from a deep link before the rows have loaded. Without a
 * floor the root is zero tall, the overlay has nothing to fill, and the detail
 * renders as a blank gap. Measured that failure before fixing it.
 */
const MIN_VIEWPORT = 280;

/**
 * Downward travel that commits the dismissal on release. Roughly a thumb's
 * comfortable reach, and far enough that a stray drag while reading does not
 * throw the detail away.
 */
const DISMISS_TRAVEL = 96;
/**
 * A flick this fast (px/s) commits from anywhere, including two pixels in.
 * Distance answers "did you mean it", velocity answers "did you mean it
 * quickly"; a gesture needs both or a fast confident throw feels ignored.
 */
const DISMISS_VELOCITY = 520;
/**
 * Movement before the press is classified as a drag or a scroll. Small enough
 * that the dismissal still feels immediate, large enough that a tap on a link
 * inside the body is never stolen.
 */
const ENGAGE_SLOP = 6;
/**
 * Upward travel ceiling. Pull the open detail up with your whole arm and it
 * still only lifts 32px, because there is nothing above it to reach.
 */
const MAX_LIFT = 32;
/** Pointer travel that buys the first half of `MAX_LIFT`. Same figure as
 *  `elastic-slider`'s band, so the two resist identically under the hand. */
const LIFT_DECAY = 90;
/** Scale lost at the far end of a dismissal drag. The detail recedes toward
 *  its row rather than sliding away, which is what makes the close read as a
 *  return rather than a discard. */
const MAX_SHRINK = 0.08;
/** Travel that buys the first half of `MAX_SHRINK`. Slower than the lift, so
 *  the shrink stays a hint under the finger and never a collapse. */
const SHRINK_DECAY = 260;
/**
 * Window the release velocity is measured over, in ms.
 *
 * A single `pointermove` delta is not a velocity. At 240Hz two consecutive
 * moves are ~4ms apart, so three pixels of lift-off jitter reads as 750px/s and
 * commits a dismissal nobody asked for — `DISMISS_VELOCITY` is 520. Averaging
 * across a window is what makes the number mean "how fast was the hand
 * moving" rather than "what did the last frame happen to catch".
 */
const VELOCITY_WINDOW = 80;
/**
 * A pointer that has not moved for this long has no velocity, whatever the last
 * sample said. Without it a drag pulled halfway, held while reading, and then
 * released commits on a reading taken before the pause.
 */
const VELOCITY_STALE = 100;
/** Release short of the threshold. Bespoke because it is seeded with the
 *  pointer's own velocity, which no tier carries. Less bounce than
 *  `elastic-slider`'s snap: this is a whole surface returning, not a bar. Kept
 *  near `spring.slow.enter`'s duration rather than above it — this is the
 *  system answering "you did not mean it", and a response that outlasts the
 *  open it is undoing reads as reluctance. */
const SNAP_BACK = { type: "spring", duration: 0.28, bounce: 0.2 } as const;

/**
 * Saturating resistance. `x / (x + decay)` approaches 1 without reaching it, so
 * the band never runs out and never stops. Same shape as `elastic-slider` and
 * `notification-stack`, deliberately.
 */
function resist(excess: number) {
  const magnitude = Math.abs(excess);
  return Math.sign(excess) * MAX_LIFT * (magnitude / (magnitude + LIFT_DECAY));
}

/** Travel to scale. Saturating for the same reason the lift is. */
function shrinkFor(travel: number) {
  if (travel <= 0) return 1;
  return 1 - MAX_SHRINK * (travel / (travel + SHRINK_DECAY));
}

interface ScrollEdges {
  /** Content exists above the visible box. */
  top: boolean;
  /** Content exists below it. */
  bottom: boolean;
}

/** Stable identity, so settling on "no edges" twice does not re-render. */
const NO_EDGES: ScrollEdges = { top: false, bottom: false };

/**
 * Which edges of a scroll container have content past them.
 *
 * Booleans rather than offsets, and state is written only when one of them
 * flips, so scrolling through the middle of a list re-renders nothing. The
 * handler itself is three property reads.
 *
 * Resize catches the box changing shape. Mutation catches rows or paragraphs
 * arriving, which moves `scrollHeight` without resizing the box, and is the
 * case a ResizeObserver alone silently misses.
 *
 * Every one of those sources is coalesced into a single frame. `measure` reads
 * three layout properties, and the mutation observer is subtree-wide, so an
 * uncoalesced version forces a layout on every DOM change anywhere in the
 * caller's rows or body — interleaved with the transform writes Motion is
 * making on the same frames during a morph. One read per frame at most, and
 * only the first measure is synchronous, because that one has to beat the
 * first paint.
 */
function useScrollEdges(node: HTMLElement | null): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>(NO_EDGES);

  useLayoutEffect(() => {
    if (!node) {
      setEdges(NO_EDGES);
      return;
    }
    let current = NO_EDGES;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = node.scrollTop > EDGE_EPSILON;
      const bottom = node.scrollTop + node.clientHeight < node.scrollHeight - EDGE_EPSILON;
      if (top === current.top && bottom === current.bottom) return;
      current = { top, bottom };
      setEdges(current);
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    measure();
    node.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    const mutation = new MutationObserver(schedule);
    mutation.observe(node, { childList: true, subtree: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("scroll", schedule);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [node]);

  return edges;
}

/**
 * The fade over a scroll boundary, or `undefined` when the content fits and
 * there is nothing to hide.
 *
 * `black` is an alpha channel here rather than a surface colour. A mask needs a
 * fully opaque stop and it has to stay opaque in both themes, which is why this
 * is not a token. Departure 4 in the header.
 */
function edgeMask({ top, bottom }: ScrollEdges) {
  if (!top && !bottom) return undefined;
  const head = top ? `transparent 0, black ${EDGE_FADE}px` : "black 0";
  const tail = bottom ? `black calc(100% - ${EDGE_FADE}px), transparent 100%` : "black 100%";
  return `linear-gradient(to bottom, ${head}, ${tail})`;
}

interface Sample {
  y: number;
  /** `performance.now()` when it was taken. */
  t: number;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  /** Recent positions, oldest first, trimmed to `VELOCITY_WINDOW`. */
  samples: Sample[];
  /** Classified as a dismissal rather than a scroll. */
  engaged: boolean;
  /** The body's scroll offset when the pointer went down. Read once, because a
   *  gesture that re-checks mid-drag flips mode under the finger. */
  scrollAtStart: number;
}

/** Record a position and drop everything that has aged out of the window. One
 *  sample is kept beyond it, so the buffer always spans the whole window rather
 *  than whatever fraction of it happens to have landed inside. */
function track(gesture: Gesture, y: number, t: number) {
  gesture.samples.push({ y, t });
  while (gesture.samples.length > 2 && t - gesture.samples[1]!.t > VELOCITY_WINDOW) {
    gesture.samples.shift();
  }
}

/** px/s, signed. Positive is downward. Zero when the buffer is too short to
 *  measure or the hand has already stopped. */
function velocityOf(gesture: Gesture, now: number) {
  const first = gesture.samples[0];
  const last = gesture.samples[gesture.samples.length - 1];
  if (!first || !last || now - last.t > VELOCITY_STALE) return 0;
  const elapsed = last.t - first.t;
  if (elapsed <= 0) return 0;
  return ((last.y - first.y) / elapsed) * 1000;
}

interface DetailContextValue {
  /** Engages the drag immediately, whatever the body's scroll position. */
  beginHandleDrag: (event: ReactPointerEvent) => void;
  /** Tells the body a pinned header is present, which suppresses its top fade.
   *  See `Detail` for why the two cannot coexist. */
  registerHandle: (node: HTMLElement | null) => void;
}

const DetailContext = createContext<DetailContextValue | null>(null);

interface MorphContextValue {
  activeValue: string | null;
  select: (value: string | null) => void;
  shellIdFor: (value: string) => string;
  registerRow: (value: string, node: HTMLButtonElement | null) => void;
  registerList: (node: HTMLUListElement | null) => void;
  /** Ties each row to the region it opens, for `aria-controls`. */
  detailId: string;
  reduceMotion: boolean;
}

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(part: string) {
  const context = useContext(MorphContext);
  if (!context) {
    throw new Error(`<ListDetailMorph.${part}> must be rendered inside <ListDetailMorph>.`);
  }
  return context;
}

interface ListDetailMorphProps {
  /** Active row, controlled. `null` closes the detail. */
  value?: string | null;
  /** Active row for the uncontrolled case. */
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  children: ReactNode;
  className?: string;
}

function ListDetailMorph({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  children,
  className,
}: ListDetailMorphProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const activeValue = valueProp !== undefined ? valueProp : uncontrolledValue;
  const reduceMotion = useReducedMotion() ?? false;

  // Scopes the layoutId to this instance, so two stacks on one page whose items
  // share ids don't pair a row from one with a detail from the other.
  const instanceId = useId();
  const detailId = `${instanceId}-detail`;
  const rowNodes = useRef(new Map<string, HTMLButtonElement>());
  // State rather than a ref, so the measuring effect below has something real
  // to depend on. As a ref it had to run every render to stay current, which
  // rebuilt the ResizeObserver each time.
  const [listEl, setListEl] = useState<HTMLUListElement | null>(null);

  // Last non-zero list height. Reserved as the root's floor while the detail is
  // open, so a list that empties underneath the overlay (a filter clearing, a
  // refetch) cannot drag the root to zero and take the visible detail with it.
  const listHeight = useRef(0);
  const [reserved, setReserved] = useState(0);

  const registerRow = useCallback((value: string, node: HTMLButtonElement | null) => {
    if (node) rowNodes.current.set(value, node);
    else rowNodes.current.delete(value);
  }, []);

  const registerList = setListEl;

  // Measure synchronously before paint, then keep it current. Deriving layout
  // from a measured child has one committed frame before any observer fires,
  // and a zero reaching the geometry is the whole failure this guards.
  // `offsetHeight` rather than a rect, since a row inside may be mid-projection
  // and a rect would inherit that transform.
  useLayoutEffect(() => {
    if (!listEl) return;
    const record = (height: number) => {
      if (height > 0) listHeight.current = height;
    };
    record(listEl.offsetHeight);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) record(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(listEl);
    return () => observer.disconnect();
  }, [listEl]);

  /**
   * Bring a row back inside the list's scroll viewport, instantly and without
   * touching any ancestor scroll. Runs before the close is committed so that
   * Motion measures the row where it will actually be, rather than projecting
   * the detail toward a box that is off screen.
   *
   * Invisible by construction: the detail covers the list completely while this
   * happens, so there is nothing to animate and nothing to see. `nearest`
   * semantics, so a row already in view is left alone. Offsets are walked
   * rather than read from a rect, for the reason above.
   */
  const revealRow = useCallback(
    (value: string) => {
      const row = rowNodes.current.get(value);
      if (!listEl || !row) return;
      let top = 0;
      let node: HTMLElement | null = row;
      while (node && node !== listEl) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const bottom = top + row.offsetHeight;
      if (top < listEl.scrollTop) listEl.scrollTop = top;
      else if (bottom > listEl.scrollTop + listEl.clientHeight) {
        listEl.scrollTop = bottom - listEl.clientHeight;
      }
    },
    [listEl],
  );

  const select = useCallback(
    (next: string | null) => {
      if (next === null && activeValue !== null) revealRow(activeValue);
      if (next !== null) setReserved(listHeight.current || MIN_VIEWPORT);
      if (valueProp === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange, activeValue, revealRow],
  );

  // A controlled caller can open without going through `select`, so the
  // reservation is confirmed here too rather than only on the click path.
  useLayoutEffect(() => {
    if (activeValue === null) setReserved(0);
    else if (reserved === 0) setReserved(listHeight.current || MIN_VIEWPORT);
  }, [activeValue, reserved]);

  const shellIdFor = useCallback((value: string) => `${instanceId}-shell-${value}`, [instanceId]);

  // Return focus to the row that opened the detail. Read on the way out rather
  // than tracked as state, so an interrupted close still lands somewhere real.
  const lastOpened = useRef<string | null>(null);
  useEffect(() => {
    if (activeValue !== null) {
      lastOpened.current = activeValue;
      return;
    }
    const previous = lastOpened.current;
    if (previous === null) return;
    lastOpened.current = null;
    rowNodes.current.get(previous)?.focus();
  }, [activeValue]);

  useEffect(() => {
    if (activeValue === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      select(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeValue, select]);

  const context = useMemo<MorphContextValue>(
    () => ({
      activeValue,
      select,
      shellIdFor,
      registerRow,
      registerList,
      detailId,
      reduceMotion,
    }),
    [activeValue, select, shellIdFor, registerRow, registerList, detailId, reduceMotion],
  );

  return (
    <MorphContext.Provider value={context}>
      <div
        data-slot="list-detail-morph"
        className={cn("relative isolate", className)}
        style={activeValue !== null ? { minHeight: reserved } : undefined}
      >
        {children}
      </div>
    </MorphContext.Provider>
  );
}

interface ListProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the list. */
  label?: string;
}

function List({ children, className, label }: ListProps) {
  const { activeValue, registerList } = useMorphContext("List");
  // The root wants this node to measure and to scroll; this component wants it
  // to read its own scroll edges. One callback ref feeds both.
  const [node, setNode] = useState<HTMLUListElement | null>(null);
  const edges = useScrollEdges(node);
  const ref = useCallback(
    (element: HTMLUListElement | null) => {
      setNode(element);
      registerList(element);
    },
    [registerList],
  );
  return (
    <motion.ul
      // Projection reads scroll offsets from ancestors that declare themselves
      // scrollable. Without this a row morphs from where it would be at
      // scrollTop 0, so opening anything below the fold flies in from off box.
      layoutScroll
      ref={ref}
      data-slot="list-detail-morph-list"
      aria-label={label}
      // The detail covers the list completely, so nothing in here should be
      // reachable while it is open. `inert` removes the whole subtree from the
      // tab order and the accessibility tree in one attribute, which is both
      // more correct and less to get wrong than per-row `aria-hidden`. See the
      // header for why this is not a focus trap.
      inert={activeValue !== null}
      // The rows that are not opening dim themselves; see `Item`. Deliberately
      // not a fade on this element, because that would take the opening row
      // down with it and the morph relies on the row still being painted.
      //
      // Fades whichever edge has rows past it, so the boundary dissolves a row
      // instead of slicing one through the middle. Both edges off means no mask
      // at all, so a list that fits is untouched.
      style={{ maskImage: edgeMask(edges) }}
      className={cn("flex max-h-full flex-col gap-2 overflow-y-auto", className)}
    >
      {children}
    </motion.ul>
  );
}

interface ItemProps {
  /** Identity of this row. Pass the same string to open it. */
  value: string;
  children: ReactNode;
  className?: string;
}

function Item({ value, children, className }: ItemProps) {
  const { activeValue, select, shellIdFor, registerRow, detailId, reduceMotion } =
    useMorphContext("Item");
  const isActive = activeValue === value;
  // Every row but the one that is opening. The shell grows over the list, so
  // until it lands there are rows either side of its edge, and their corners
  // against its own read as stacked cards rather than one growing surface.
  // Measured opening the fifth row of six: the top row's 12px corner and the
  // shell's 16px corner were both on screen, fifteen pixels apart, for about a
  // third of the travel.
  //
  // The opening row is excluded, and that exclusion is the whole point of doing
  // this per row rather than once on the list. Motion crossfades the `layoutId`
  // pair, holding this row's content at full opacity through the first half of
  // the morph and clearing it at 95%; dimming it would erase the one thing
  // painted inside the growing shell before the detail's own body arrives, and
  // leave an empty card inflating for most of the travel. See `CONTENT_LEAD`.
  const dimmed = activeValue !== null && !isActive;

  return (
    <li
      data-slot="list-detail-morph-item"
      // Asymmetric on purpose: out quickly, so the rows clear before the shell
      // is halfway; back a notch slower, which still lands well inside the
      // close. A plain CSS fade rather than an `animate` prop, so a long list
      // does not pay for a motion component per row to move one number.
      className={cn(
        "transition-opacity ease-out-strong",
        dimmed ? "opacity-0 duration-quick" : "opacity-100 duration-moderate",
      )}
    >
      <button
        type="button"
        ref={(node) => registerRow(value, node)}
        onClick={() => select(value)}
        // Names the region this row opens, so a screen reader user can tell
        // these are disclosures rather than links to somewhere else. The list
        // as a whole goes `inert` while open, so no per-row hiding is needed.
        aria-expanded={isActive}
        aria-controls={detailId}
        className={cn(
          "block w-full cursor-pointer text-left outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
        // `scrollMarginBlock` keeps the focus ring out of the fade. Tabbing to a
        // partly hidden row scrolls it only just into view, which lands it in
        // exactly the band the mask is fading, so the indicator would arrive
        // dimmed. Tied to `EDGE_FADE` rather than a number of its own, since it
        // is that band it has to clear.
        style={{ borderRadius: ROW_RADIUS, scrollMarginBlock: EDGE_FADE }}
      >
        <motion.div
          layoutId={shellIdFor(value)}
          layout={!reduceMotion}
          // `padding` holds every child off the inset ring. See `RING_INSET`.
          style={{ borderRadius: ROW_RADIUS, boxShadow: RING, padding: RING_INSET }}
          transition={spring.slow.enter}
          // Press feedback is a wash rather than the usual `active:scale`, and
          // that is a constraint rather than a preference. This element is the
          // one Motion measures to start the morph from, and `getBoundingClientRect`
          // reports the transform: a press scale still easing back when the
          // click lands hands projection a start box a few pixels short on
          // every side, which shows as a flinch at the top of the morph. A
          // colour cannot reach the geometry. Constant-tier, so both washes are
          // the near-invisible house ones.
          className={cn(
            "overflow-hidden bg-card transition-colors duration-quick ease-out-strong",
            "hover:bg-hover active:bg-active",
            className,
          )}
        >
          {/* Fixed-size `layout` child. Cancels the shell's projection scale so
              the row's own content keeps its proportions mid-morph. Its radius
              is the shell's less the ring, which keeps the two concentric: the
              padding alone would not stop a child's square corner painting over
              the ring where the curve cuts in. */}
          <motion.div
            layout={!reduceMotion}
            transition={spring.slow.enter}
            style={{ borderRadius: ROW_RADIUS - RING_INSET }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        </motion.div>
      </button>
    </li>
  );
}

interface DetailProps {
  /** Receives the active row's value. Only called while something is open. */
  children: (value: string) => ReactNode;
  className?: string;
  /** Accessible name for the detail region. */
  label?: string;
}

function Detail({ children, className, label }: DetailProps) {
  const { activeValue, select, shellIdFor, detailId, reduceMotion } = useMorphContext("Detail");
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // The gesture reads the body through the ref; the mask needs it as state to
  // hang an effect on. One callback ref writes both.
  const [bodyNode, setBodyNode] = useState<HTMLDivElement | null>(null);
  const bodyEdges = useScrollEdges(bodyNode);
  const setBody = useCallback((node: HTMLDivElement | null) => {
    bodyRef.current = node;
    setBodyNode(node);
  }, []);
  /**
   * Whether a `Handle` is pinned at the top of the body.
   *
   * A mask cannot fade content sliding under a sticky header while leaving the
   * header itself alone: they are the same pixels, so the gradient hits both.
   * Measured it doing exactly that, the header's text washing from 18 to 75 out
   * of 255 across the band. But a pinned opaque header is already the reason
   * there is nothing to see at the top, so the fade has no work to do when one
   * is present. Absent a handle it comes back, because then the cut is real.
   */
  const [hasHandle, setHasHandle] = useState(false);
  const registerHandle = useCallback((node: HTMLElement | null) => {
    setHasHandle(node !== null);
  }, []);

  // The drag writes straight onto the shell, the element that carries the
  // `layoutId`. That is the whole mechanic: Motion snapshots the shell's
  // *rendered* box when the close starts, and a rendered box already includes
  // whatever transform the finger left on it, so the morph departs from under
  // the pointer instead of teleporting back to the settled position first.
  const dragY = useMotionValue(0);
  // Derived, not animated. The shrink is a pure function of travel, so making
  // it a second motion value meant a second `animate` call on release — and
  // only one of the two could be seeded with the pointer's velocity, so at a
  // fast release the surface arrived in place while still small and then grew.
  // As a transform of `dragY` the coupling is exact by construction: during the
  // drag, through the snap back, and through an interruption of either.
  const dragScale = useTransform(dragY, (travel) => (reduceMotion ? 1 : shrinkFor(travel)));
  const gestureRef = useRef<Gesture | null>(null);
  const detachRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (activeValue === null) return;
    panelRef.current?.focus({ preventScroll: true });
  }, [activeValue]);

  // Any close that did not come from the gesture still has to clear it, or the
  // next open inherits the last drag's offset. One value to clear, since the
  // scale follows it.
  const resetDrag = useCallback(() => {
    dragY.set(0);
  }, [dragY]);

  const endGesture = useCallback(() => {
    detachRef.current?.();
    detachRef.current = null;
    gestureRef.current = null;
  }, []);

  const beginGesture = useCallback(
    (event: ReactPointerEvent, forced: boolean) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (gestureRef.current) return;

      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        samples: [{ y: event.clientY, t: performance.now() }],
        engaged: forced,
        scrollAtStart: bodyRef.current?.scrollTop ?? 0,
      };

      const onMove = (moveEvent: PointerEvent) => {
        const gesture = gestureRef.current;
        if (!gesture || moveEvent.pointerId !== gesture.pointerId) return;

        const travel = moveEvent.clientY - gesture.startY;

        if (!gesture.engaged) {
          const sideways = Math.abs(moveEvent.clientX - gesture.startX);
          if (Math.abs(travel) < ENGAGE_SLOP && sideways < ENGAGE_SLOP) return;
          // One decision, taken once. A gesture that re-arbitrates mid-drag
          // changes mode under the finger, which is the exact failure this rule
          // exists to prevent.
          const dismissing =
            gesture.scrollAtStart === 0 && travel > 0 && Math.abs(travel) > sideways;
          if (!dismissing) {
            endGesture();
            return;
          }
          gesture.engaged = true;
        }

        track(gesture, moveEvent.clientY, performance.now());

        // Down tracks the pointer exactly. Up has nowhere to go, so it saturates
        // rather than stopping dead. Reduced motion keeps the tracking, which is
        // the feedback, and drops the band and the shrink, which are not — the
        // shrink drops itself, since `dragScale` reads `reduceMotion`.
        if (travel >= 0) dragY.set(travel);
        else dragY.set(reduceMotion ? 0 : resist(travel));
      };

      const onUp = (upEvent: PointerEvent) => {
        const gesture = gestureRef.current;
        if (!gesture || upEvent.pointerId !== gesture.pointerId) return;
        const now = performance.now();
        // The release position is the last thing the hand did, so it counts
        // towards the velocity like any other sample.
        track(gesture, upEvent.clientY, now);
        const { engaged } = gesture;
        const velocity = velocityOf(gesture, now);
        const travel = upEvent.clientY - gesture.startY;
        endGesture();
        if (!engaged) return;

        // Distance or speed, either alone. A slow deliberate pull and a fast
        // flick are both people meaning it.
        if (travel > DISMISS_TRAVEL || velocity > DISMISS_VELOCITY) {
          // Close first, then clear the transform, and the order is load
          // bearing. `select` schedules a React update that React flushes at
          // the end of this handler; `dragY.set` schedules a style write on
          // Motion's frame loop, which runs later still. So projection reads
          // the shell's box while the drag transform is on it, and the close
          // departs from under the pointer. Reset first and it would measure
          // the settled box and teleport there before travelling.
          select(null);
          resetDrag();
          return;
        }

        // Short of both, so it returns. The pointer's own velocity seeds the
        // spring, or the surface would appear to stop dead and restart. The
        // shrink comes back with it, being a function of the same value.
        animate(dragY, 0, { ...SNAP_BACK, velocity });
      };

      const onCancel = () => {
        if (!gestureRef.current) return;
        endGesture();
        animate(dragY, 0, SNAP_BACK);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      detachRef.current = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
      };
    },
    [dragY, endGesture, reduceMotion, resetDrag, select],
  );

  useEffect(() => endGesture, [endGesture]);

  const detailContext = useMemo<DetailContextValue>(
    () => ({ beginHandleDrag: (event) => beginGesture(event, true), registerHandle }),
    [beginGesture, registerHandle],
  );

  return (
    <DetailContext.Provider value={detailContext}>
      <AnimatePresence onExitComplete={resetDrag}>
        {activeValue !== null && (
          <motion.div
            key={activeValue}
            id={detailId}
            data-slot="list-detail-morph-detail"
            layoutId={shellIdFor(activeValue)}
            layout={!reduceMotion}
            ref={panelRef}
            role="region"
            aria-label={label}
            tabIndex={-1}
            style={{
              borderRadius: DETAIL_RADIUS,
              boxShadow: RING,
              // Holds the body, and the sticky `Handle` inside it, off the
              // inset ring. See `RING_INSET`.
              padding: RING_INSET,
              y: dragY,
              scale: dragScale,
            }}
            transition={spring.slow.enter}
            className={cn("absolute inset-0 z-10 overflow-hidden bg-card outline-none", className)}
          >
            {/* Same correction as the row's, for the same reason, and the same
                concentric radius so nothing inside can reach the ring. */}
            <motion.div
              layout={!reduceMotion}
              transition={spring.slow.enter}
              style={{ borderRadius: DETAIL_RADIUS - RING_INSET }}
              className="flex h-full flex-col overflow-hidden"
            >
              <motion.div
                ref={setBody}
                onPointerDown={(event) => beginGesture(event, false)}
                initial={{ opacity: 0 }}
                // The lead is carried on the target rather than on a shared
                // `transition` prop, because `animateTarget` falls back to that
                // prop for any target that has none — so a delay parked there
                // is also applied on the way out. It was: the body sat at full
                // opacity inside a shrinking shell for the whole lead, which is
                // the mid-glyph cut this delay exists to prevent, arriving in
                // reverse. The close has the opposite problem to the open and
                // wants the opposite treatment: leave first, promptly, so the
                // shell is empty before it is small.
                animate={{
                  opacity: 1,
                  transition: {
                    ...spring.moderate.exit,
                    delay: reduceMotion ? 0 : CONTENT_LEAD,
                  },
                }}
                exit={{ opacity: 0, transition: spring.quick.exit }}
                // The fade dissolves a line at whichever boundary has content
                // past it. `BODY_TAIL` handles the case the fade cannot: at the
                // very end of the scroll there is no fade, and the last line
                // would otherwise sit under the shell's corner curve.
                style={{
                  maskImage: edgeMask({
                    top: bodyEdges.top && !hasHandle,
                    bottom: bodyEdges.bottom,
                  }),
                  paddingBottom: BODY_TAIL,
                }}
                // `overscroll-none`, not `contain`. Contain stops the drag
                // chaining to the page but still lets this element bounce on
                // its own, so on iOS a dismissal from the top rubber-bands the
                // body while the shell is already tracking the finger: two
                // things moving under one hand. None leaves the whole downward
                // gesture to us, which is what the arbitration above assumes.
                className="min-h-0 flex-1 overflow-y-auto overscroll-none"
              >
                {children(activeValue)}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DetailContext.Provider>
  );
}

interface HandleProps {
  children?: ReactNode;
  className?: string;
  /** Accessible name. Defaults to describing the gesture. */
  label?: string;
}

/**
 * A grab area that starts the dismissal whatever the body's scroll position.
 * Without it a long detail can only be dismissed from the very top, since the
 * body's own scroll owns every other downward drag.
 *
 * Sticky by default, and that is the whole point rather than a styling choice.
 * Everything the caller renders lives inside the one scroll container, so a
 * static handle scrolls out of reach and takes the only always-available
 * dismissal with it. It carries `bg-card` for the same reason: pinned content
 * with a transparent background has the body sliding visibly under it.
 *
 * Not a button. It has no click behaviour to expose, and `Close` already gives
 * the keyboard and assistive tech a labelled route to the same outcome, so this
 * is `aria-hidden` rather than a control nobody can operate.
 */
function Handle({ children, className, label }: HandleProps) {
  const context = useContext(DetailContext);
  if (!context) {
    throw new Error("<ListDetailMorph.Handle> must be rendered inside <ListDetailMorph.Detail>.");
  }
  return (
    <div
      data-slot="list-detail-morph-handle"
      aria-hidden
      title={label}
      ref={context.registerHandle}
      onPointerDown={context.beginHandleDrag}
      // `touch-action: none` so a touch drag here is ours rather than the
      // browser's scroll, which is the one place we can claim it outright.
      className={cn(
        "sticky top-0 z-10 shrink-0 cursor-grab touch-none bg-card active:cursor-grabbing",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CloseProps {
  children: ReactNode;
  className?: string;
  /** Accessible name when the trigger is an icon. */
  label?: string;
}

function Close({ children, className, label }: CloseProps) {
  const { select } = useMorphContext("Close");
  return (
    <button
      type="button"
      data-slot="list-detail-morph-close"
      aria-label={label}
      onClick={() => select(null)}
      className={cn("cursor-pointer outline-none", className)}
    >
      {children}
    </button>
  );
}

ListDetailMorph.List = List;
ListDetailMorph.Item = Item;
ListDetailMorph.Detail = Detail;
ListDetailMorph.Handle = Handle;
ListDetailMorph.Close = Close;

export {
  ListDetailMorph,
  type ListDetailMorphProps,
  type ListProps as ListDetailMorphListProps,
  type ItemProps as ListDetailMorphItemProps,
  type DetailProps as ListDetailMorphDetailProps,
  type HandleProps as ListDetailMorphHandleProps,
  type CloseProps as ListDetailMorphCloseProps,
};
