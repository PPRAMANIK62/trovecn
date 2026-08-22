"use client";

/**
 * NotificationStack: a persistent notification centre. Items collapse into a
 * pile and fan out on demand. The iOS lock screen's job, which Sonner does not
 * do. Sonner owns transient toasts and stops there.
 *
 * The motion is the component, so per `docs/design-system.md` this states the
 * choreography instead of running the playbook. There is one focal movement,
 * the collapse and fan-out, and everything below is its physics.
 *
 * - Each rung down the pile sits `PEEK` lower, smaller, dimmer, and blurrier.
 *   Four properties at once. The blur ramp is what makes a pile read as depth
 *   instead of three offset rectangles, and it is the part cheaper versions
 *   skip.
 * - Buried cards clip to the front card's height and fade their content out,
 *   so every peek is the same size whatever the cards underneath hold. Uniform
 *   peeks are the whole illusion.
 * - Dragging down separates the cards with saturating resistance, the same
 *   rubber band `elastic-slider` uses, so the collection shares one physical
 *   vocabulary. Releasing past `PULL_TO_COMMIT` finishes the opening. Below it
 *   the pile springs shut.
 * - An arriving card drops from above, the pile compresses into the contact
 *   and rebounds out of it, and the rungs give way `ARRIVE_IMPACT` later. On
 *   contact rather than on the event, so the sequence reads as cause and
 *   effect. They overshoot, because that is the only thing that says one card
 *   just became the second one.
 * - Dismissal has two exits because it has two causes. A thrown card leaves
 *   sideways at the speed it was released at. A dismissed one falls backwards
 *   along the pile's depth axis, past where any rung sits, and blurs out there.
 * - Dismissal is three beats, never one. The card leaves, the gap closes
 *   `DEPART_LEAD_*` behind it, the rest re-take their depth `RESTACK_LEAD_*`
 *   behind that. In one window a close reads as a blink.
 * - Both events scale to the state they happen in. Collapsed, an arrival is
 *   otherwise a text swap plus twelve pixels, and a gesture tuned for the open
 *   list disappears.
 *
 * Four departures from the house rules, each named where the rules ask:
 *
 * 1. `filter`, `clipPath`, and the stack's `height` animate rather than
 *    `transform`. None has a transform equivalent. Blur is not expressible as
 *    one, a `scaleY` crop would squash the buried card's corner radii into
 *    ellipses, and the container has to reserve the room it opens into or it
 *    overlaps the content below. All three resolve instantly under
 *    `useReducedMotion()`. The values stay, since the depth ramp is state
 *    rather than decoration. Only the travel goes.
 * 2. `LAND` and `THROW` are bespoke curves rather than tiers, under the
 *    gesture-and-physics exemption in `@/lib/springs`. A landing squash and a
 *    throw carrying pointer velocity are what that exemption covers.
 * 3. `MAX_PULL` and `PULL_DECAY` are the same, for the same reason.
 * 4. A buried card animates `opacity` on a nested element while its parent
 *    animates `opacity` too. The slab dims as a whole and its content leaves,
 *    and separating them lets the content go first.
 *
 * Hover does not separate the pile. Sonner already owns that gesture on a stack
 * of cards, and borrowing it is what would make this read as a Sonner reskin
 * rather than the persistent centre Sonner is not. The pull is the affordance,
 * and it is the one this pattern has on the device it comes from.
 */

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  type MotionValue,
  type PanInfo,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { easeOutStrong, spring } from "@/lib/springs";

/** How far below the card in front each buried card peeks out. */
const PEEK = 12;
/** Scale removed per rung down the pile. */
const DEPTH_SCALE = 0.045;
/** Blur added per rung, in px. Under 1px on purpose. A peek is only `PEEK`
 *  tall, and a blur tuned against a whole card turns that strip into a smudge. */
const DEPTH_BLUR = 0.9;
/** Row gap once the stack is open. */
const GAP = 8;
/** Corner radius of a card. Synced with `rounded-xl` by hand, because
 *  `clipPath` cannot read a Tailwind radius. */
const RADIUS = 12;
/** Bleed on the clip rect so an *unclipped* card keeps its shadow. `inset(0 …)`
 *  cuts it off at the border box. Buried cards get the opposite treatment and
 *  clip flush, since a shadow spreading sideways from behind the front card is
 *  what makes a pile read as a smudge. */
const CLIP_BLEED = 32;

/** Per-card delay as the stack opens, front card leading. */
const STAGGER = 0.022;
/** Closing is an exit, so it staggers at half the rate. */
const CLOSE_STAGGER = STAGGER / 2;
/** How long the gap-close leads the restack by, after a dismissal. */
const RESTACK_LEAD_OPEN = 0.09;
const RESTACK_LEAD_PILE = 0.14;

/**
 * Bespoke gesture curves, departures 2 and 3 above.
 *
 * `MAX_PULL` is normalised separation, where 1.0 is a fully previewed open. The
 * pull saturates towards it and never arrives, so every extra pixel returns
 * less than the last and the pile never feels like it stopped tracking the
 * finger. `PULL_DECAY` is the travel that buys the first half.
 */
const MAX_PULL = 1;
const PULL_DECAY = 110;
/** Extra separation, in px per rung, at a full pull. */
const PULL_SPREAD = 26;
/** Pointer travel that commits to the other state on release. */
const PULL_TO_COMMIT = 54;
/**
 * An arrival is two different events depending on where it lands.
 *
 * Open, the cards below travel a full card height and the arrival reads on that
 * alone. Collapsed, it is a text swap in place plus `PEEK` of growth, which is
 * sub-perceptual and used to register as a blink. So the collapsed case gets a
 * bigger gesture rather than a longer one. Further to fall, deeper to compress,
 * a real overshoot on the rungs.
 */
const ARRIVE_DROP_OPEN = 10;
const ARRIVE_DROP_PILE = 22;
/** The card's own fall. Longer than any tier, on the playbook's reasoning for
 *  an arriving surface. This is occasional, not constant. */
const ARRIVE_PILE = { type: "spring", duration: 0.34, bounce: 0.2 } as const;
/**
 * Opacity finishes long before the transform. Sharing one curve leaves the
 * arriving card semi-transparent over the outgoing card's text for its first
 * frames, and two texts in one place is the artefact masked transitions exist
 * to avoid.
 */
const ARRIVE_FADE = { duration: 0.12, ease: easeOutStrong } as const;
/** How long after the card starts falling the pile feels it. The rungs give way
 *  on contact, not on the keystroke, which is what turns a simultaneous blur of
 *  movement into cause and effect. */
const ARRIVE_IMPACT = 0.11;
/** The rungs giving way. Bouncier than any tier on purpose, because the
 *  overshoot is the demotion. Without it the front card slides its 12px and
 *  nothing says it just became the second one. */
const ARRIVE_SETTLE = { type: "spring", duration: 0.26, bounce: 0.32 } as const;
/** A label waits for its container to make room. `docs/design-system.md` lists
 *  the reverse under Avoid, and the restack was doing it. */
const CONTENT_LEAD = 0.08;
/** Landing squash. Compresses *into* the contact and rebounds out of it rather
 *  than snapping to compressed and springing back. Something is falling onto
 *  the pile, so the load arrives over time. */
const LAND_DURATION = 0.42;
const LAND: Transition = {
  duration: LAND_DURATION,
  times: [0, 0.5, 1],
  ease: ["easeIn", easeOutStrong],
};
/** 2.5% of a collapsed pile is two pixels. The gesture scales to the object it
 *  happens to rather than sitting at one constant across both states. */
const SQUASH_OPEN = 0.975;
const SQUASH_PILE = 0.955;
/** A throw leaves at the speed it was released at, so it takes a velocity
 *  rather than a duration. The card used to go invisible at 180ms while the
 *  list waited until 400ms to notice, so this is shorter and the fade riding it
 *  out is longer. */
const THROW = { type: "spring", bounce: 0, duration: 0.32 } as const;
const THROW_FADE = 0.26;
/**
 * A card leaving under its own steam rather than under a thumb.
 *
 * `spring.quick.exit` used to do this at 100ms, the icon-crossfade tier. Four
 * sizes too small for a whole surface, and the reason a dismissal read as a pop
 * rather than as something leaving. Still quicker than the arrival, which is
 * the asymmetry the tiers encode.
 */
const DEPART = { duration: 0.22, ease: easeOutStrong } as const;
/**
 * How far back it falls. Scale and blur are already this component's depth axis,
 * so a receding card travels *along* it, past where rung two sits, and reads as
 * going backwards into the stack rather than shrinking in place.
 *
 * Deliberately no `y`. Three ways to leave need three directions. A throw goes
 * sideways, a dismissal goes backwards, an arrival comes down.
 */
const DEPART_SCALE = 0.86;
const DEPART_BLUR = 8;
/**
 * The gap waits for the card to be on its way out. Closing it in the same frame
 * puts both inside one window and makes neither legible.
 *
 * Scaled to the state, for the reason `SQUASH_OPEN` gives. Open, rung one
 * climbs a whole card plus `GAP`. Collapsed it climbs `PEEK` plus the scale
 * gap, about 15px, and leads that separate three beats across 80px let them
 * fuse back into one at 15. The arrival branches this way in three places. The
 * departure was the last event still running open-state timing in both.
 */
const DEPART_LEAD_OPEN = 0.07;
const DEPART_LEAD_PILE = 0.1;
/**
 * The promotion, collapsed only. Mirror of `ARRIVE_SETTLE`. If an overshoot is
 * what says one card just became the second one, the card becoming the *first*
 * one needs that signal at least as badly, and at 15px of travel it has nothing
 * else. Open, the rung climbs a whole card and reads on distance alone, so it
 * stays on the tier.
 */
const RESTACK_PILE = { type: "spring", duration: 0.24, bounce: 0.26 } as const;
/** Horizontal travel that uncovers the rung behind the front card. Small, but
 *  not zero: a few pixels of slop while deciding to swipe should not flash the
 *  card underneath. */
const UNCOVER_TRAVEL = 6;
/** Either of these dismisses: far enough, or fast enough. */
const THROW_FRACTION = 0.4;
const THROW_VELOCITY = 500;

/** What the pile is recovering from. Arrivals and dismissals move the same
 *  slots and want different beats, and neither wants the beat a plain
 *  open/close would give them. */
type Settle = "idle" | "arriving" | "restacking";

interface NotificationItem {
  id: string;
  title: ReactNode;
  body?: ReactNode;
  /** Trailing timestamp or source, right-aligned against the title. */
  meta?: ReactNode;
  icon?: ReactNode;
}

/**
 * Saturating resistance, shared in shape with `elastic-slider`'s band.
 * `x / (x + decay)` approaches the ceiling without reaching it.
 */
function resist(travel: number) {
  const magnitude = Math.abs(travel);
  return Math.sign(travel) * MAX_PULL * (magnitude / (magnitude + PULL_DECAY));
}

/**
 * Deliberately shallow. A buried card is the same material as the front one,
 * only further back, and scale, blur, and the peek carry the depth. Fading hard
 * washes the card tone towards the surface behind it, the bug `decisions.md`
 * records under "Card-toned demos on a card-toned stage". The pile stops
 * reading as separate planes and becomes one smudge.
 */
function depthOpacity(depth: number) {
  if (depth === 0) return 1;
  return depth === 1 ? 0.9 : 0.72;
}

interface StackCardProps {
  item: NotificationItem;
  index: number;
  /** Rung in the collapsed pile, capped so a deep list doesn't keep receding. */
  depth: number;
  /** Beyond the cap: still mounted and still the same DOM, just not painted. */
  buried: boolean;
  expanded: boolean;
  dismissible: boolean;
  /** Normalised, resisted pull. Positive opens, negative closes. */
  pull: MotionValue<number>;
  /** Slot geometry, resolved by the parent from the measured heights. */
  slotY: number;
  clipBottom: number;
  /** Buried cards clip flush; the front card and every open card do not. */
  clipped: boolean;
  /** What the pile is recovering from, if anything. */
  settle: Settle;
  /** This card is the one behind a card being swiped off. Collapsed only. */
  uncovered: boolean;
  measured: boolean;
  reduceMotion: boolean;
  onHeight: (id: string, height: number) => void;
  onDismiss?: (id: string) => void;
  onPull: (travel: number) => void;
  onPullEnd: (travel: number) => void;
  onUncover: (active: boolean) => void;
  onActivate: () => void;
}

function StackCard({
  item,
  index,
  depth,
  buried,
  expanded,
  dismissible,
  pull,
  slotY,
  clipBottom,
  clipped,
  settle,
  uncovered,
  measured,
  reduceMotion,
  onHeight,
  onDismiss,
  onPull,
  onPullEnd,
  onUncover,
  onActivate,
}: StackCardProps) {
  const chromeRef = useRef<HTMLDivElement>(null);
  const [thrown, setThrown] = useState(false);
  const draggedRef = useRef(false);

  // Gesture layer. `x` is the swipe, `throwOpacity` the fade that rides it out.
  const x = useMotionValue(0);
  const throwOpacity = useMotionValue(1);

  // The pull previews the other state by spreading the rungs apart. Driven off
  // a motion value pair so it re-derives when the spread factor changes, rather
  // than capturing it in a closure that never updates.
  const spread = useMotionValue(0);
  useEffect(() => {
    spread.set(expanded ? Math.min(index, 4) : depth);
  }, [expanded, index, depth, spread]);
  const pullY = useTransform(
    [pull, spread],
    ([amount, factor]) => (amount as number) * PULL_SPREAD * (factor as number),
  );

  useLayoutEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;
    // Measure once, synchronously, before this card is painted. Every other
    // card's slot is solved from the front card's height, and an arriving card
    // lands at the front, so waiting on the observer's first async callback
    // leaves one committed frame where the pile has no front card, collapses to
    // a stub, and springs back out. `offsetHeight` rather than a rect, since an
    // ancestor is mid-scale and a rect would inherit it.
    onHeight(item.id, chrome.offsetHeight);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) onHeight(item.id, entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(chrome);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  const scale = expanded ? 1 : 1 - depth * DEPTH_SCALE;
  const opacity = expanded ? 1 : buried ? 0 : depthOpacity(depth);
  const blur = expanded ? 0 : depth * DEPTH_BLUR;
  // The front card owns the chrome. A rung being uncovered reveals its text and
  // nothing else, because it has not been promoted yet, only exposed.
  const chromeVisible = expanded || depth === 0;
  const contentVisible = chromeVisible || uncovered;

  // Opening leads with the front card and each rung follows. Closing runs the
  // other way at half the rate, because exits are faster than enters.
  //
  // A pile recovering from an arrival or a dismissal is doing neither. The exit
  // *tween* the collapsed state would hand it is what made an arrival read as
  // three unrelated animations: rungs on a flat curve, a card springing in over
  // them, the whole pile bouncing. Recovery takes the same spring as everything
  // else and no stagger, so the rungs give way as the card lands.
  const settling = settle !== "idle";
  const arriving = settle === "arriving";
  // A collapsed restack is its own event, see `DEPART_LEAD_PILE`. It is also
  // the only one where a card is *promoted* rather than moved, which is what
  // the overshoot and the slower content are for.
  const promoting = settle === "restacking" && !expanded;
  const departLead = expanded ? DEPART_LEAD_OPEN : DEPART_LEAD_PILE;
  const restackLead = expanded ? RESTACK_LEAD_OPEN : RESTACK_LEAD_PILE;
  // An arrival's rungs wait for contact. Same curve, offset in time, which
  // reads as cause and effect rather than the mixed curves this used to run.
  const stagger = arriving
    ? ARRIVE_IMPACT
    : settle === "restacking"
      ? departLead
      : expanded
        ? index * STAGGER
        : depth * CLOSE_STAGGER;
  const curve = arriving
    ? ARRIVE_SETTLE
    : promoting
      ? RESTACK_PILE
      : settling || expanded
        ? spring.moderate.enter
        : spring.moderate.exit;
  // Reduced motion is Contract, not convention. `design-system.md`: travel and
  // bounce are gone. Every slot *value* below still holds, since the depth ramp
  // is state rather than decoration. Only the journey to it goes. One gate for
  // the whole layer, so a curve added later cannot slip past.
  const still = { duration: 0 };
  const animates = measured && !reduceMotion;
  const travel = animates ? { ...curve, delay: stagger } : still;
  // Beat two, and only after a dismissal. An arrival waits for contact instead.
  const depthDelay = settle === "restacking" ? departLead + restackLead : stagger;
  const depthTransition = animates ? { ...curve, delay: depthDelay } : still;
  // Blur and the clip rect take the scale's curve but never its bounce. A
  // spring overshooting `blur(0px)` gives a negative radius, an invalid filter
  // value, so the declaration drops and the card renders unblurred for those
  // frames. Same duration, no overshoot, so the ramp lands with its transform.
  const flatCurve = "bounce" in curve ? { ...curve, bounce: 0 } : curve;
  const depthFlat = animates ? { ...flatCurve, delay: depthDelay } : still;
  // The label follows its container rather than racing it. A promoted card's
  // content is a whole surface arriving, not an icon crossfade, so it takes the
  // tier above. Same correction `DEPART` records against `spring.quick`.
  const contentDelay = depthDelay + CONTENT_LEAD;
  const contentCurve = promoting ? spring.moderate.enter : spring.quick.enter;
  // Leaving is unconditional and immediate. Content should be gone before its
  // card is buried, never caught halfway under one. An uncovered rung is the
  // other exception: it is tracking a finger, so it reveals without the lead.
  const contentTransition = !contentVisible
    ? reduceMotion
      ? still
      : spring.quick.exit
    : uncovered
      ? reduceMotion
        ? still
        : spring.quick.enter
      : animates
        ? { ...contentCurve, delay: contentDelay }
        : still;

  const canPull = index === 0;

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const horizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
    if (horizontal && dismissible) {
      const width = chromeRef.current?.offsetWidth ?? 320;
      const far = Math.abs(info.offset.x) > width * THROW_FRACTION;
      const fast = Math.abs(info.velocity.x) > THROW_VELOCITY;
      if (far || fast) {
        // The uncover flag deliberately survives the throw. Clearing it here
        // would fade the rung's text out for the 320ms the card spends leaving
        // and then straight back in once the list renumbers it to the front.
        const direction = info.offset.x < 0 ? -1 : 1;
        setThrown(true);
        animate(throwOpacity, 0, { duration: THROW_FADE });
        animate(x, direction * (width + 80), {
          ...THROW,
          velocity: info.velocity.x,
          onComplete: () => onDismiss?.(item.id),
        });
        return;
      }
      // Snapped back, so the rung goes under cover again.
      if (canPull) onUncover(false);
      animate(x, 0, spring.moderate.enter);
      return;
    }
    if (canPull) {
      onUncover(false);
      onPullEnd(info.offset.y);
    }
  };

  return (
    <motion.li
      // Layer 1, the slot. Owns where this card sits in the pile and nothing
      // else. Discrete, React-driven, the only layer that knows about depth.
      className="absolute inset-x-0 top-0 list-none"
      style={{ zIndex: 100 - index, transformOrigin: "top center" }}
      animate={{
        y: slotY,
        scale,
        opacity,
        filter: `blur(${blur}px)`,
        clipPath: clipPathFor(clipBottom, clipped),
      }}
      transition={{
        y: travel,
        scale: depthTransition,
        opacity: depthTransition,
        filter: depthFlat,
        clipPath: depthFlat,
      }}
    >
      {/* Layer 2, the pull. A motion value the parent drives during a drag,
          kept off layer 1 so a gesture never fights a slot animation. */}
      <motion.div style={{ y: pullY }}>
        {/* Layer 3, the gesture, plus this card's arrival and departure. */}
        <motion.div
          drag={canPull ? true : "x"}
          dragDirectionLock
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.4, bottom: 0.4, left: 1, right: 1 }}
          dragMomentum={false}
          onDragStart={() => {
            draggedRef.current = true;
          }}
          onDrag={(_event, info) => {
            if (!canPull) return;
            if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
              if (dismissible) onUncover(Math.abs(info.offset.x) > UNCOVER_TRAVEL);
              return;
            }
            onPull(info.offset.y);
          }}
          onDragEnd={handleDragEnd}
          style={{ x }}
          // Arrives from *above* and presses down onto the pile. The first
          // version came up from below and fought both the squash and the rungs
          // giving way beneath it. Two things travelling down, one travelling
          // up, no read of what happened. 4px of blur rather than 8, because at
          // 8 the card materialises out of fog instead of landing on something.
          initial={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  scale: 0.96,
                  y: -(expanded ? ARRIVE_DROP_OPEN : ARRIVE_DROP_PILE),
                  filter: "blur(4px)",
                }
          }
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={
            thrown
              ? // Already gone, under its own velocity.
                { opacity: 0, transition: { duration: 0 } }
              : reduceMotion
                ? // The fade stays, since opacity survives and a card that just
                  // vanished reads as a bug. The depth-axis travel is what goes.
                  { opacity: 0, transition: DEPART }
                : // The other cause. It recedes into the pile instead.
                  {
                    opacity: 0,
                    scale: DEPART_SCALE,
                    filter: `blur(${DEPART_BLUR}px)`,
                    transition: DEPART,
                  }
          }
          // A card arriving unbidden is the playbook's larger, rarer change. It
          // settles alongside the pile's landing rather than well before it.
          // Opacity comes off this curve entirely, see `ARRIVE_FADE`.
          transition={
            reduceMotion
              ? { ...ARRIVE_FADE, opacity: ARRIVE_FADE }
              : { ...(expanded ? spring.slow.enter : ARRIVE_PILE), opacity: ARRIVE_FADE }
          }
          className={cn(!expanded && depth > 0 && "pointer-events-none")}
        >
          {/* Layer 4, the chrome, plus the fade that rides a throw out. */}
          <motion.div
            ref={chromeRef}
            data-slot="notification-stack-card"
            style={{ opacity: throwOpacity }}
            onClick={() => {
              if (draggedRef.current) {
                draggedRef.current = false;
                return;
              }
              onActivate();
            }}
            className={cn(
              "group/card relative touch-pan-y rounded-xl border border-border bg-card px-3.5 py-3 shadow-card select-none",
              !expanded && "cursor-pointer",
            )}
          >
            <motion.div
              animate={{ opacity: contentVisible ? 1 : 0 }}
              transition={contentTransition}
              className="flex gap-3"
            >
              {item.icon ? (
                <span
                  aria-hidden
                  className="mt-px grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5"
                >
                  {item.icon}
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-control truncate text-foreground">{item.title}</span>
                  {item.meta ? (
                    <span className="text-meta shrink-0 tabular-nums text-muted-foreground">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                {item.body ? (
                  <p className="text-caption mt-0.5 line-clamp-2 text-muted-foreground">
                    {item.body}
                  </p>
                ) : null}
              </div>
            </motion.div>
            {dismissible && chromeVisible ? (
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={(event) => {
                  event.stopPropagation();
                  onDismiss?.(item.id);
                }}
                // The keyboard's route to the job the swipe does. Chrome, so
                // opacity and nothing else.
                className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition-opacity duration-quick group-hover/card:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <X className="size-2.5" strokeWidth={2.5} />
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.li>
  );
}

/**
 * How long the pile stays in a recovery state, in ms.
 *
 * Derived rather than picked. It has to outlast every beat its branch
 * schedules, or `settle` returns to idle mid-flight and the pile swaps curves
 * under itself. The hand-tuned constant this replaced had no margin at all on
 * the arrival branch, and scaling the collapsed restack pushed that one 100ms
 * past it. One frame of slack on top.
 */
function settleWindow(kind: Exclude<Settle, "idle">, expanded: boolean) {
  if (kind === "arriving") {
    const fall = expanded ? spring.slow.enter.duration : ARRIVE_PILE.duration;
    const rungs = ARRIVE_IMPACT + ARRIVE_SETTLE.duration;
    return Math.max(LAND_DURATION, fall, rungs) * 1000 + 16;
  }
  const lead =
    (expanded ? DEPART_LEAD_OPEN : DEPART_LEAD_PILE) +
    (expanded ? RESTACK_LEAD_OPEN : RESTACK_LEAD_PILE);
  const depth = expanded ? spring.moderate.enter.duration : RESTACK_PILE.duration;
  const content = CONTENT_LEAD + (expanded ? spring.quick.enter : spring.moderate.enter).duration;
  return (lead + Math.max(depth, content)) * 1000 + 16;
}

function clipPathFor(bottom: number, clipped: boolean) {
  // Clipped means buried. Cut flush on every side, so the strip that peeks out
  // is the card's own edge and nothing else. Otherwise don't clip at all, which
  // still needs a rect, bled outwards far enough to spare the shadow.
  if (!clipped) {
    const bleed = `${-CLIP_BLEED}px`;
    return `inset(${bleed} ${bleed} ${bleed} ${bleed} round ${RADIUS}px)`;
  }
  return `inset(0px 0px ${bottom}px 0px round ${RADIUS}px)`;
}

interface NotificationStackProps {
  notifications: NotificationItem[];
  onDismiss?: (id: string) => void;
  /** Heading above the pile. */
  label?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Cards painted in the collapsed pile, including the front one. Three is the
   *  iOS number and the one this is tuned for; more rungs stop reading as depth. */
  maxCollapsed?: number;
  dismissible?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

function NotificationStack({
  notifications,
  onDismiss,
  label = "Notifications",
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  maxCollapsed = 3,
  dismissible = true,
  emptyState = "Nothing new",
  className,
}: NotificationStackProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? uncontrolledExpanded;
  const reduceMotion = useReducedMotion() ?? false;

  const [heights, setHeights] = useState<Record<string, number>>({});
  const [settle, setSettle] = useState<Settle>("idle");
  const [uncovering, setUncovering] = useState(false);
  const pull = useMotionValue(0);
  const squash = useMotionValue(1);

  const maxDepth = Math.max(0, maxCollapsed - 1);
  const count = notifications.length;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setUncontrolledExpanded(next);
      onExpandedChange?.(next);
    },
    [expandedProp, onExpandedChange],
  );

  const handleHeight = useCallback((id: string, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);

  const prevCount = useRef(count);
  useEffect(() => {
    const previous = prevCount.current;
    prevCount.current = count;
    if (count === previous) return;
    // Beat two of a dismissal. The gap closes on the tier, then depth follows.
    // An arrival gets no such lag, but takes the same spring, so the rungs give
    // way in the motion the new card lands with.
    const kind = count < previous ? "restacking" : "arriving";
    setSettle(kind);
    // The list has renumbered, so whatever was uncovered is now the front card
    // and holds its own content. This is where a committed swipe's flag clears.
    setUncovering(false);
    if (count > previous && !reduceMotion) {
      // Lands with weight, scaled to the state it lands in. Transform-only, so
      // reduced motion drops it. The leading `null` reads the current value at
      // start, so a second card landing inside the settle window compresses
      // from wherever the pile is. An explicit `1` restarts the keyframe from
      // the top, which popped.
      animate(squash, [null, expanded ? SQUASH_OPEN : SQUASH_PILE, 1], LAND);
    }
    const timer = setTimeout(() => setSettle("idle"), settleWindow(kind, expanded));
    return () => clearTimeout(timer);
  }, [count, expanded, reduceMotion, squash]);

  // An emptied stack has nothing to be open about.
  useEffect(() => {
    if (count === 0 && expanded) setExpanded(false);
  }, [count, expanded, setExpanded]);

  // Belt and braces behind the synchronous measure above. If a front card does
  // reach a paint unmeasured, fall back to the last known height rather than to
  // zero. Solving against a front height of nothing flattens every slot at
  // once, the most violent frame this component can produce. The render-time
  // cache write is idempotent, and an effect would land a frame too late.
  const lastFrontHeight = useRef(0);
  const measuredFront = notifications[0] ? heights[notifications[0].id] : undefined;
  if (measuredFront) lastFrontHeight.current = measuredFront;
  const frontHeight = measuredFront ?? (lastFrontHeight.current || undefined);
  const measured = count === 0 || (frontHeight !== undefined && frontHeight > 0);

  const handlePull = useCallback(
    (travel: number) => {
      if (reduceMotion) return;
      // Only the direction with somewhere to go. Closed pulls open, open pulls
      // shut. The other way round is already at its stop.
      const directional = expanded ? Math.min(0, travel) : Math.max(0, travel);
      pull.set(resist(directional));
    },
    [expanded, pull, reduceMotion],
  );

  const handleUncover = useCallback((active: boolean) => setUncovering(active), []);

  const handlePullEnd = useCallback(
    (travel: number) => {
      const directional = expanded ? Math.min(0, travel) : Math.max(0, travel);
      if (Math.abs(directional) > PULL_TO_COMMIT) setExpanded(!expanded);
      animate(pull, 0, spring.moderate.enter);
    },
    [expanded, pull, setExpanded],
  );

  // Slot geometry. Bottom edges are what has to come out evenly spaced, so each
  // top edge is solved backwards from its bottom one. A shorter card sits lower
  // rather than showing a shorter peek.
  let runningY = 0;
  const slots = notifications.map((item, index) => {
    const depth = Math.min(index, maxDepth);
    const height = heights[item.id] ?? 0;
    const front = frontHeight ?? height;
    const clipped = Math.min(height, front);
    const scale = 1 - depth * DEPTH_SCALE;
    const collapsedY = front + depth * PEEK - clipped * scale;
    const expandedY = runningY;
    runningY += height + GAP;
    return {
      item,
      index,
      depth,
      buried: index > maxDepth,
      slotY: expanded ? expandedY : collapsedY,
      clipBottom: expanded ? 0 : Math.max(0, height - front),
      clipped: !expanded && depth > 0,
    };
  });

  const collapsedHeight = (frontHeight ?? 0) + Math.min(count - 1, maxDepth) * PEEK;
  const expandedHeight = Math.max(0, runningY - GAP);
  const stackHeight = count === 0 ? 0 : expanded ? expandedHeight : collapsedHeight;

  const toggleLabel = expanded ? "Collapse" : "Expand";

  return (
    <section
      data-slot="notification-stack"
      aria-label={typeof label === "string" ? label : undefined}
      className={cn("flex w-full flex-col gap-2.5", className)}
    >
      <div className="flex items-center justify-between gap-3 px-0.5">
        <span className="text-label text-muted-foreground uppercase">{label}</span>
        {count > 1 ? (
          <motion.button
            type="button"
            // `layout` animates the width as the label changes length, so the
            // two labels crossfade rather than teleport. House technique, see
            // `design-system.md`.
            layout
            transition={reduceMotion ? { duration: 0 } : spring.moderate.enter}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="text-caption relative grid place-items-center rounded-md px-2 py-1 text-muted-foreground transition-colors duration-quick hover:bg-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={toggleLabel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
                }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
                className="whitespace-nowrap"
              >
                {toggleLabel}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        ) : null}
      </div>

      <motion.div
        // The pile squashes as a whole when a card lands on it.
        style={{ scaleY: squash, transformOrigin: "top center" }}
        // Departure 1: the stack has to reserve the room it opens into, and
        // there is no transform that does that. Instant under reduced motion.
        animate={{ height: stackHeight }}
        transition={
          reduceMotion || !measured
            ? { duration: 0 }
            : expanded || settle !== "idle"
              ? spring.moderate.enter
              : spring.moderate.exit
        }
        className="relative"
      >
        <ul aria-live="polite" className="contents">
          <AnimatePresence initial={false}>
            {slots.map((slot) => (
              <StackCard
                key={slot.item.id}
                item={slot.item}
                index={slot.index}
                depth={slot.depth}
                buried={slot.buried}
                expanded={expanded}
                dismissible={dismissible}
                pull={pull}
                slotY={slot.slotY}
                clipBottom={slot.clipBottom}
                clipped={slot.clipped}
                settle={settle}
                uncovered={uncovering && !expanded && slot.index === 1}
                measured={measured}
                reduceMotion={reduceMotion}
                onHeight={handleHeight}
                onDismiss={onDismiss}
                onPull={handlePull}
                onPullEnd={handlePullEnd}
                onUncover={handleUncover}
                onActivate={() => {
                  if (!expanded) setExpanded(true);
                }}
              />
            ))}
          </AnimatePresence>
        </ul>
        {count === 0 && emptyState ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={spring.quick.enter}
            className="text-caption text-muted-foreground"
          >
            {emptyState}
          </motion.p>
        ) : null}
      </motion.div>
    </section>
  );
}

export { NotificationStack, type NotificationItem, type NotificationStackProps };
