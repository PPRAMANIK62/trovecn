"use client";

import { useEffect, useRef, useState } from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { motion, useMotionValue, animate } from "framer-motion";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

/**
 * Squishy, draggable thumb — ported from fluidfunctionalism.com's Base UI
 * switch (MIT, github.com/mickadesign/fluid-functionalism/blob/main/
 * registry/base/switch.tsx): the thumb stretches wider on hover, squishes
 * wider-and-shorter on press, and can be dragged (not just clicked) to the
 * other side. `default` reproduces their track/thumb geometry (34×20 track,
 * 16px thumb, 2px offset) exactly; `sm` scales it down by the same ratio.
 *
 * Checked track uses `--accent-blue`/`--accent-blue-hover` (globals.css) —
 * the same blue hue `--ring`/`--link` use elsewhere, but scoped to this one
 * filled control rather than this repo's neutral `--primary`. `--accent`
 * itself stays neutral gray; this blue is deliberately not a general-purpose
 * token other components reach for.
 * The thumb stays a fixed light color regardless of checked state (same as
 * fluidfunctionalism.com's source, `bg-white shadow-sm`) instead of
 * swapping to a semantic token: swapping was tried and reverted, since in
 * dark mode `--primary-foreground` (the would-be checked-state token) lands
 * almost exactly on `--background` and the thumb disappears into the page.
 */

const SIZES = {
  default: { track: 34, height: 20, thumb: 16 },
  sm: { track: 24, height: 14, thumb: 12 },
} as const;

const DRAG_DEAD_ZONE = 2;

function Switch({
  className,
  size = "default",
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  ...props
}: Omit<SwitchPrimitive.Root.Props, "inputRef"> & {
  size?: "sm" | "default";
}) {
  const { track, height, thumb } = SIZES[size];
  const offset = (height - thumb) / 2;
  const travel = track - thumb - offset * 2;
  // Squish deltas scale with the thumb so "sm" stretches proportionally
  // the same amount their source's fixed 2/4/4px deltas do at thumb=16.
  const hoverExtend = (2 * thumb) / 16;
  const pressExtend = (4 * thumb) / 16;
  const pressShrink = (4 * thumb) / 16;

  // Always controlled from Base UI's side (mirrors tabs.tsx) so a drag-
  // completed toggle can be applied directly — see handlePointerUp below —
  // without racing the native click Base UI's own click handling also fires
  // after a pointer-down+up pair.
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false);
  const checked = checkedProp ?? uncontrolledChecked;

  const applyChecked = (next: boolean, eventDetails?: SwitchPrimitive.Root.ChangeEventDetails) => {
    if (checkedProp === undefined) setUncontrolledChecked(next);
    onCheckedChange?.(next, eventDetails as SwitchPrimitive.Root.ChangeEventDetails);
  };

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const dragging = useRef(false);
  // Guards the native click Base UI still fires after pointerup, whether or
  // not the gesture actually dragged — set for the duration of a drag so
  // that click doesn't re-apply (or reverse) what handlePointerUp already
  // decided, then cleared on the next frame for the next real click.
  const suppressNextClick = useRef(false);
  const dragStart = useRef<{ clientX: number; originX: number } | null>(null);

  const thumbWidth = pressed ? thumb + pressExtend : hovered ? thumb + hoverExtend : thumb;
  const thumbHeight = pressed ? thumb - pressShrink : thumb;
  const thumbY = pressed ? offset + pressShrink / 2 : offset;
  const thumbX = checked ? offset + travel - (thumbWidth - thumb) : offset;

  const motionX = useMotionValue(thumbX);
  const hasMountedRef = useRef(false);
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (dragging.current) return;
    if (!hasMountedRef.current) {
      motionX.set(thumbX);
      return;
    }
    const controls = animate(motionX, thumbX, spring.moderate.enter);
    return () => controls.stop();
    // motionX is a stable framer ref; re-running only on thumbX changes is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbX]);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      checked={checked}
      disabled={disabled}
      onCheckedChange={(next, eventDetails) => {
        if (suppressNextClick.current) return;
        applyChecked(next, eventDetails);
      }}
      className={cn(
        "group/switch relative shrink-0 touch-none rounded-full border border-transparent outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        checked
          ? hovered
            ? "bg-accent-blue-hover"
            : "bg-accent-blue"
          : hovered
            ? "bg-[color-mix(in_oklch,var(--input),var(--foreground)_10%)] dark:bg-[color-mix(in_oklch,var(--input),var(--foreground)_14%)]"
            : "bg-input",
        className,
      )}
      style={{ width: track, height }}
      onPointerEnter={(e) => {
        if (!disabled && e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        if (disabled) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        setPressed(true);
        dragging.current = false;
        suppressNextClick.current = false;
        dragStart.current = { clientX: e.clientX, originX: motionX.get() };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragStart.current) return;
        const delta = e.clientX - dragStart.current.clientX;
        if (!dragging.current) {
          if (Math.abs(delta) < DRAG_DEAD_ZONE) return;
          dragging.current = true;
        }
        const pressedWidth = thumb + pressExtend;
        const min = offset;
        const max = track - offset - pressedWidth;
        motionX.set(Math.max(min, Math.min(max, dragStart.current.originX + delta)));
      }}
      onPointerUp={() => {
        if (!dragStart.current) return;
        setPressed(false);
        if (dragging.current) {
          suppressNextClick.current = true;
          dragging.current = false;
          const pressedWidth = thumb + pressExtend;
          const min = offset;
          const max = track - offset - pressedWidth;
          const shouldBeOn = motionX.get() > (min + max) / 2;
          if (shouldBeOn !== checked) {
            applyChecked(shouldBeOn);
          } else {
            animate(
              motionX,
              checked ? offset + travel - pressExtend : offset,
              spring.moderate.enter,
            );
          }
          requestAnimationFrame(() => {
            suppressNextClick.current = false;
          });
        }
        dragStart.current = null;
      }}
      onPointerCancel={() => {
        if (!dragStart.current) return;
        setPressed(false);
        if (dragging.current) {
          dragging.current = false;
          animate(motionX, thumbX, spring.moderate.enter);
        }
        dragStart.current = null;
      }}
      {...props}
    >
      <motion.span
        data-slot="switch-thumb"
        // -top-px/-left-px cancels the track's `border-transparent`: an
        // absolutely positioned child's 0,0 sits at the parent's *padding*
        // box, so without this the thumb reads 1px low and 1px right of
        // where offset/travel above assume it starts.
        className="pointer-events-none absolute -top-px -left-px block rounded-full bg-background shadow-sm dark:bg-foreground"
        style={{ x: motionX }}
        animate={{ y: thumbY, width: thumbWidth, height: thumbHeight }}
        transition={hasMountedRef.current ? spring.moderate.enter : { duration: 0 }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
