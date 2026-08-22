"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

export type SliderValue = number | readonly number[];

function defaultFormatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function percentOf(value: number, min: number, max: number) {
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

interface SliderProps extends Omit<SliderPrimitive.Root.Props, "children" | "orientation"> {
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  label?: ReactNode;
  thumbLabels?: string[];
  formatValue?: (value: number) => string;
}

function Slider({
  className,
  trackClassName,
  thumbClassName,
  label,
  thumbLabels,
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
}: SliderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<SliderValue>(
    () => defaultValue ?? min,
  );
  const value = valueProp ?? uncontrolledValue;
  const values: readonly number[] = Array.isArray(value) ? value : [value as number];
  const [dragging, setDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const motion0 = useMotionValue(percentOf(values[0] ?? min, min, max));
  const motion1 = useMotionValue(percentOf(values[1] ?? values[0] ?? min, min, max));
  const motionValues = [motion0, motion1] as const;
  const hasMountedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    const controls = values.map((rawValue, index) => {
      const mv = motionValues[index];
      if (!mv) return undefined;
      const percent = percentOf(rawValue, min, max);
      if (!hasMountedRef.current || dragging || reduceMotion) {
        mv.set(percent);
        return undefined;
      }
      return animate(mv, percent, spring.moderate.enter);
    });
    return () => controls.forEach((control) => control?.stop());
    // motionValues are stable refs; re-run only when the actual values/range change.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [values.join(","), min, max, dragging, reduceMotion]);

  const leftPercent0 = useTransform(motion0, (position) => `${position}%`);
  const leftPercent1 = useTransform(motion1, (position) => `${position}%`);
  const leftPercents = [leftPercent0, leftPercent1] as const;
  const rangeWidthPercent = useTransform([motion0, motion1], (positions) => {
    const [first, second] = positions as number[];
    return `${Math.max(0, second - first)}%`;
  });
  const isRange = values.length > 1;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(next, eventDetails) => {
        if (valueProp === undefined) setUncontrolledValue(next);
        setActiveIndex(eventDetails.activeThumbIndex);
        if (eventDetails.reason === "drag") setDragging(true);
        onValueChange?.(next, eventDetails);
      }}
      onValueCommitted={(next, eventDetails) => {
        setDragging(false);
        onValueCommitted?.(next, eventDetails);
      }}
      className={cn(
        "flex w-full flex-col gap-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <SliderPrimitive.Label data-slot="slider-label" className="text-control text-foreground">
            {label}
          </SliderPrimitive.Label>
          <SliderPrimitive.Value
            data-slot="slider-value"
            className="text-caption tabular-nums text-muted-foreground"
          >
            {(_formatted, rawValues) =>
              rawValues.map((rawValue) => formatValue(rawValue)).join(" – ")
            }
          </SliderPrimitive.Value>
        </div>
      ) : null}
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="relative flex w-full touch-none items-center py-2.5 select-none"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn("h-1.5 w-full rounded-full bg-input", trackClassName)}
        >
          <motion.div
            data-slot="slider-indicator"
            aria-hidden
            className="absolute inset-y-0 rounded-full bg-primary"
            style={
              isRange
                ? { left: leftPercent0, width: rangeWidthPercent }
                : { left: 0, width: leftPercent0 }
            }
          />
          {values.map((rawValue, index) => (
            <SliderThumb
              key={index}
              index={index}
              value={rawValue}
              leftPercent={leftPercents[index] ?? leftPercent0}
              isActiveDrag={dragging && activeIndex === index}
              disabled={disabled}
              reduceMotion={reduceMotion}
              formatValue={formatValue}
              ariaLabel={thumbLabels?.[index]}
              className={thumbClassName}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

const HOVER_DELAY = 100;

function SliderThumb({
  index,
  value,
  leftPercent,
  isActiveDrag,
  disabled,
  reduceMotion,
  formatValue,
  ariaLabel,
  className,
}: {
  index: number;
  value: number;
  leftPercent: MotionValue<string>;
  isActiveDrag: boolean;
  disabled?: boolean;
  reduceMotion: boolean | null;
  formatValue: (value: number) => string;
  ariaLabel?: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hovered) hoverTimeoutRef.current = setTimeout(() => setHoverOpen(true), HOVER_DELAY);
    else setHoverOpen(false);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [hovered]);

  const tooltipOpen = !disabled && (hoverOpen || focused || isActiveDrag);
  const tooltipOffset = reduceMotion ? 0 : 4;

  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      index={index}
      aria-label={ariaLabel}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      render={(thumbProps) => {
        const { children: hiddenInput, ...restThumbProps } = thumbProps as {
          children?: ReactNode;
        } & Record<string, unknown>;
        return (
          <motion.div
            {...restThumbProps}
            className={cn(
              "absolute top-1/2 z-10 size-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border border-border bg-background shadow-bevel outline-none data-disabled:pointer-events-none data-dragging:cursor-grabbing has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              className,
            )}
            style={{ left: leftPercent, top: "50%" }}
            whileHover={disabled ? undefined : { scale: 1.08 }}
            transition={spring.fast.enter}
          >
            {hiddenInput}
            <AnimatePresence>
              {tooltipOpen ? (
                <motion.span
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-micro text-background"
                  initial={{ opacity: 0, y: tooltipOffset }}
                  animate={{ opacity: 1, y: 0, transition: spring.fast.enter }}
                  exit={{ opacity: 0, transition: spring.fast.exit }}
                >
                  {formatValue(value)}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      }}
    />
  );
}

export { Slider };
