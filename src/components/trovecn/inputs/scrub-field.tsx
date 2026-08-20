"use client";

/**
 * ScrubField — a number input whose *label* is the drag handle. Press the
 * label and pull sideways and the value scrubs under pointer lock, so the
 * cursor never leaves the field or runs off the screen edge. Alt scrubs
 * fine, Shift scrubs coarse. The input itself still types and steps like
 * any other number input.
 *
 * Two departures from the house conventions, both deliberate.
 *
 * 1. Hand-composed on `@base-ui/react/number-field` rather than scaffolded
 *    with `npx shadcn add`. There is no `base-nova` scaffold for it, and the
 *    label-as-handle layout is not what a generic number-field scaffold
 *    produces.
 * 2. No Motion. The value has to track the pointer 1:1, since a scrub that
 *    lags the cursor reads as broken, and everything else here is a hover
 *    wash or a colour change. Those are CSS transitions on the house
 *    `duration-*` tokens, which is cheaper than a Motion component that
 *    would only animate opacity. `MotionConfig` cannot reach CSS, so the
 *    one bit of travel is gated with `motion-safe:` — on the rule that
 *    applies the nudge, not as a `motion-reduce:` override, which loses the
 *    specificity contest against the `group-data-scrubbing` selector.
 */

import { type ReactNode, useId } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { MoveHorizontal, MoveVertical } from "lucide-react";

import { cn } from "@/lib/utils";

interface ScrubFieldProps extends Omit<
  NumberField.Root.Props,
  "className" | "style" | "render" | "id"
> {
  /** The drag handle. Pressing it and moving sideways scrubs the value. */
  label: ReactNode;
  /** Static unit shown inside the field, for units Intl has no format for ("px", "ms"). */
  suffix?: string;
  /** Pixels the pointer must travel before the value moves. Higher is less sensitive. */
  pixelSensitivity?: number;
  /** Axis the scrub follows. */
  direction?: "horizontal" | "vertical";
  className?: string;
  inputClassName?: string;
}

function ScrubField({
  label,
  suffix,
  pixelSensitivity = 2,
  direction = "horizontal",
  className,
  inputClassName,
  ...props
}: ScrubFieldProps) {
  const id = useId();
  const isVertical = direction === "vertical";
  const scrubCursor = isVertical ? "cursor-ns-resize" : "cursor-ew-resize";
  // The affordance icon and its scrub nudge both follow the drag axis — an
  // arrow pointing across the direction you're pulling reads as a bug.
  const ScrubIcon = isVertical ? MoveVertical : MoveHorizontal;
  const scrubNudge = isVertical
    ? "motion-safe:group-data-scrubbing/scrub:translate-y-0.5"
    : "motion-safe:group-data-scrubbing/scrub:translate-x-0.5";

  return (
    <NumberField.Root data-slot="scrub-field" id={id} {...props}>
      {/* One box with two regions: the left scrubs, the right types. Fixed
          width by default so a stack of fields aligns without the caller
          having to size anything. */}
      <NumberField.Group
        data-slot="scrub-field-group"
        className={cn(
          "flex items-stretch overflow-hidden rounded-md border border-input bg-background",
          // Fixed so a stack aligns without the caller sizing anything.
          "w-40",
          // Not `transition-colors`: that list has no `box-shadow`, so the
          // focus ring would land instantly while the border eased in behind
          // it — two halves of one focus treatment arriving apart.
          "transition-[border-color,box-shadow] duration-quick",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "data-scrubbing:border-ring/60",
          "has-[input:focus-visible]:border-ring/60 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
          className,
        )}
      >
        <NumberField.ScrubArea
          data-slot="scrub-field-area"
          direction={direction}
          pixelSensitivity={pixelSensitivity}
          className={cn(
            "group/scrub flex items-center gap-1 py-1 pr-1.5 pl-2 select-none",
            "transition-colors duration-fast hover:bg-hover data-scrubbing:bg-active",
            scrubCursor,
            "data-disabled:cursor-not-allowed",
          )}
        >
          {/* The "you can drag this" tell. Faint at rest so a still frame
              still shows the affordance, full strength on approach. */}
          <ScrubIcon
            aria-hidden
            className={cn(
              "size-3 shrink-0 text-muted-foreground opacity-35",
              "transition-[opacity,translate,color] duration-fast ease-out-strong",
              "group-hover/scrub:opacity-100",
              scrubNudge,
              "group-data-scrubbing/scrub:text-foreground group-data-scrubbing/scrub:opacity-100",
            )}
          />
          <label
            htmlFor={id}
            className={cn(
              "text-control text-muted-foreground transition-colors duration-fast",
              scrubCursor,
              "group-hover/scrub:text-foreground group-data-scrubbing/scrub:text-foreground",
            )}
          >
            {label}
          </label>
          {/* Base UI hides this in Safari, where the Pointer Lock
              notification causes a layout shift. */}
          <NumberField.ScrubAreaCursor data-slot="scrub-field-cursor">
            <ScrubIcon
              aria-hidden
              className="size-4 text-foreground drop-shadow-[0_1px_1px_var(--background)]"
            />
          </NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>

        <NumberField.Input
          data-slot="scrub-field-input"
          className={cn(
            "min-w-0 flex-1 bg-transparent py-1 pr-1 pl-1 text-right text-caption tabular-nums text-foreground outline-none",
            "read-only:cursor-default disabled:cursor-not-allowed",
            inputClassName,
          )}
        />
        {suffix ? (
          <span
            aria-hidden
            className="self-center pr-2 text-caption tabular-nums text-muted-foreground select-none"
          >
            {suffix}
          </span>
        ) : null}
      </NumberField.Group>
    </NumberField.Root>
  );
}

export { ScrubField };
export type { ScrubFieldProps };
