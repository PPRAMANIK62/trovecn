"use client";

/**
 * ElasticSlider — a bounded continuous value (volume, brightness, zoom, opacity)
 * whose track is the only thing on screen worth watching.
 *
 * The motion IS the component, so per `docs/design-system.md` this skips the
 * playbook and states the choreography instead:
 *
 * - The track carries its own state in one property: 6px at rest, 8px under a
 *   hovering mouse, 10px once you actually have hold of it. Hover is the most
 *   frequently seen animation a component has, so it gets the smallest step
 *   that still reads as "this is live" — the full weight is reserved for real
 *   engagement. All of it is feedback rather than decoration, so it survives
 *   reduced motion.
 * - Push past either end and the whole bar stretches with real resistance,
 *   less and less the harder you pull, then snaps back on release. That is
 *   decoration, so reduced motion drops it entirely.
 *
 * Two departures, both named per the rules that ask for it:
 *
 * 1. `strokeWidth` and the line endpoints are animated rather than `transform`.
 *    A `scaleY` on a wrapper would squash the round caps into ellipses, and a
 *    `scaleX` would smear them sideways — which is the exact tell that makes
 *    cheaper versions of this read as a stretch of an image rather than a bar
 *    growing. Driving SVG geometry keeps every cap a true half-circle at any
 *    thickness or length. The usual reduced-motion gate on non-transform
 *    animation is deliberately *not* applied to the thickening, because that
 *    is the feedback we want to keep; it is applied to the stretch.
 *
 * 2. `SNAP_BACK`, `MAX_OVERSHOOT`, and `OVERSHOOT_DECAY` are bespoke rather
 *    than one of the four tiers, under the gesture-and-physics exemption in
 *    `@/lib/springs`. A rubber band that tracks the pointer and then releases
 *    with velocity is precisely what that exemption exists for.
 *
 * Hover deliberately does not introduce a second element. A pill that appears
 * under the cursor would be a second focal movement competing with the stretch
 * below, and it moves the target mid-approach: you aim at a bar, a knob
 * materialises, and now you are aiming at the knob. Video scrubbers get away
 * with it because frame-precise seeking needs a precision grab target. A
 * coarse value — volume, brightness, zoom — does not.
 *
 * There is no visible thumb by design. The filled portion's leading edge is
 * the position, the way it is on the Apple Music volume slider this follows.
 * The thumb element is still in the DOM, focusable and keyboard-driven, and
 * shows a ring on `:focus-visible` — the affordance is real, it just isn't
 * competing with the track for attention.
 */

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

/** Track weight at rest, under a hovering mouse, and while held. */
const REST_THICKNESS = 6;
const HOVER_THICKNESS = 8;
const ACTIVE_THICKNESS = 10;
/** Half the thickest the track ever gets, so its round caps stay inside the control. */
const INSET = ACTIVE_THICKNESS / 2;
/** Tall enough to hold the thickened track plus the focus ring. */
const CONTROL_HEIGHT = 24;

/**
 * Bespoke gesture curves — see the departure note above.
 *
 * `MAX_OVERSHOOT` is the hard ceiling: pull with your whole arm and the band
 * still only gives 28px. `OVERSHOOT_DECAY` is the pointer travel that buys the
 * first half of it, so resistance builds from the very first pixel past the
 * end rather than after some dead zone.
 */
const MAX_OVERSHOOT = 28;
const OVERSHOOT_DECAY = 90;
/** Release. Enough bounce to read as elastic, damped enough not to wobble twice. */
const SNAP_BACK = { type: "spring", duration: 0.45, bounce: 0.35 } as const;

/**
 * Saturating resistance. `x / (x + decay)` approaches 1 without reaching it,
 * so every extra pixel of pull returns less than the one before — a hard clamp
 * would instead feel like the bar simply stopped tracking the pointer.
 */
function resist(excess: number) {
  const magnitude = Math.abs(excess);
  return Math.sign(excess) * MAX_OVERSHOOT * (magnitude / (magnitude + OVERSHOOT_DECAY));
}

function percentOf(value: number, min: number, max: number) {
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

function defaultFormatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

interface ElasticSliderProps extends Omit<
  SliderPrimitive.Root.Props,
  "children" | "orientation" | "value" | "defaultValue" | "onValueChange" | "onValueCommitted"
> {
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  label?: ReactNode;
  thumbLabel?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommitted?: (value: number) => void;
  formatValue?: (value: number) => string;
}

function ElasticSlider({
  className,
  trackClassName,
  indicatorClassName,
  label,
  thumbLabel,
  formatValue = defaultFormatValue,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  ...props
}: ElasticSliderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(() => defaultValue ?? min);
  const value = valueProp ?? uncontrolledValue;

  const controlRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const percent = useMotionValue(percentOf(value, min, max));
  const overshoot = useMotionValue(0);
  const thickness = useMotionValue(REST_THICKNESS);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  // The SVG draws in pixel user units with no viewBox, so the line endpoints
  // need the control's real width rather than a percentage.
  useEffect(() => {
    const control = controlRef.current;
    if (!control) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setTrackWidth(entry.contentRect.width);
    });
    observer.observe(control);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = percentOf(value, min, max);
    // While dragging, the value must track the pointer 1:1 — springing it here
    // would put the fill behind the finger.
    if (dragging || reduceMotion || !hasMountedRef.current) {
      percent.set(target);
      return;
    }
    const controls = animate(percent, target, spring.moderate.enter);
    return () => controls.stop();
  }, [value, min, max, dragging, reduceMotion, percent]);

  const engaged = (dragging || focused) && !disabled;
  const targetThickness = disabled
    ? REST_THICKNESS
    : engaged
      ? ACTIVE_THICKNESS
      : hovered
        ? HOVER_THICKNESS
        : REST_THICKNESS;

  useEffect(() => {
    // Growing is an arrival, shrinking is a withdrawal — same asymmetry the
    // tiers encode everywhere else.
    const growing = targetThickness > thickness.get();
    const controls = animate(
      thickness,
      targetThickness,
      growing ? spring.quick.enter : spring.quick.exit,
    );
    return () => controls.stop();
  }, [targetThickness, thickness]);

  const releaseRef = useRef<(() => void) | null>(null);
  useEffect(() => () => releaseRef.current?.(), []);

  const handlePointerDown = useCallback(() => {
    setDragging(true);
    const control = controlRef.current;
    if (!control || disabled) return;

    // Reduced motion keeps the thickening but never stretches, so the move
    // listener is only worth attaching when the band can actually give. The
    // release listener goes on either way — it owns the drag flag.
    const stretches = !reduceMotion;

    const handleMove = (event: PointerEvent) => {
      const rect = control.getBoundingClientRect();
      const left = rect.left + INSET;
      const right = rect.right - INSET;
      const excess =
        event.clientX < left ? event.clientX - left : Math.max(0, event.clientX - right);
      overshoot.set(resist(excess));
    };
    const release = () => {
      if (stretches) window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      releaseRef.current = null;
      // Own the flag rather than waiting on Base UI's commit. A cancelled
      // gesture never commits, and the track would stay thick for good.
      setDragging(false);
      if (stretches) animate(overshoot, 0, SNAP_BACK);
    };
    releaseRef.current = release;
    if (stretches) window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  }, [disabled, reduceMotion, overshoot]);

  // Both ends move: pulling past the minimum extends the bar leftwards, past
  // the maximum rightwards. The fill is then laid out *between* them, so it
  // stretches along with the band instead of staying pinned to the old end.
  const startX = useTransform(overshoot, (offset) => INSET + Math.min(0, offset));
  const endX = useTransform(
    overshoot,
    (offset) => Math.max(INSET, trackWidth - INSET) + Math.max(0, offset),
  );
  const fillX = useTransform([startX, endX, percent], ([start, end, pct]) => {
    return (start as number) + ((pct as number) / 100) * ((end as number) - (start as number));
  });
  const thumbLeft = useTransform(fillX, (x) => `${x}px`);
  const midY = CONTROL_HEIGHT / 2;

  return (
    <SliderPrimitive.Root
      data-slot="elastic-slider"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(next) => {
        const single = Array.isArray(next) ? (next[0] as number) : (next as number);
        if (valueProp === undefined) setUncontrolledValue(single);
        onValueChange?.(single);
      }}
      onValueCommitted={(next) => {
        setDragging(false);
        onValueCommitted?.(Array.isArray(next) ? (next[0] as number) : (next as number));
      }}
      className={cn(
        "flex w-full flex-col gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <SliderPrimitive.Label
            data-slot="elastic-slider-label"
            className="text-control text-foreground"
          >
            {label}
          </SliderPrimitive.Label>
          <SliderPrimitive.Value
            data-slot="elastic-slider-value"
            className="text-caption tabular-nums text-muted-foreground"
          >
            {(_formatted, rawValues) => formatValue(rawValues[0] ?? min)}
          </SliderPrimitive.Value>
        </div>
      ) : null}
      <SliderPrimitive.Control
        ref={controlRef}
        data-slot="elastic-slider-control"
        onPointerDown={handlePointerDown}
        onPointerEnter={(event) => {
          // Touch reports a hover on tap, which would thicken the track on
          // every tap-to-set. Mice and pens only.
          if (event.pointerType !== "touch") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        className="relative flex w-full touch-none items-center select-none data-disabled:pointer-events-none"
        style={{ height: CONTROL_HEIGHT }}
      >
        <SliderPrimitive.Track
          data-slot="elastic-slider-track"
          className={cn("relative h-full w-full", trackClassName)}
        >
          {/* overflow-visible lets the band render outside the control while stretched. */}
          <svg aria-hidden width="100%" height={CONTROL_HEIGHT} className="block overflow-visible">
            <motion.line
              x1={startX}
              y1={midY}
              x2={endX}
              y2={midY}
              strokeWidth={thickness}
              strokeLinecap="round"
              className="stroke-input"
            />
            <motion.line
              x1={startX}
              y1={midY}
              x2={fillX}
              y2={midY}
              strokeWidth={thickness}
              strokeLinecap="round"
              className={cn("stroke-primary", indicatorClassName)}
            />
          </svg>
          <SliderPrimitive.Thumb
            data-slot="elastic-slider-thumb"
            index={0}
            aria-label={thumbLabel}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            render={(thumbProps) => {
              const { children: hiddenInput, ...rest } = thumbProps as {
                children?: ReactNode;
              } & Record<string, unknown>;
              return (
                <motion.div
                  {...rest}
                  className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                  style={{ left: thumbLeft }}
                >
                  {hiddenInput}
                </motion.div>
              );
            }}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { ElasticSlider };
