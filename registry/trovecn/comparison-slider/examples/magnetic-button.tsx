"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { ComparisonSlider } from "@/components/trovecn/motion-demos/comparison-slider";

const PULL_RADIUS = 90;
const PULL_STRENGTH = 0.35;
const SPRING = { stiffness: 300, damping: 20, mass: 0.4 };

const buttonClassName =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm";

export default function ComparisonSliderMagneticButtonExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const springX = useSpring(dx, SPRING);
  const springY = useSpring(dy, SPRING);

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(offsetX, offsetY);
    if (distance < PULL_RADIUS) {
      dx.set(offsetX * PULL_STRENGTH);
      dy.set(offsetY * PULL_STRENGTH);
    } else {
      dx.set(0);
      dy.set(0);
    }
  }

  function onPointerLeave() {
    dx.set(0);
    dy.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="w-full"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ComparisonSlider
        beforeLabel="Static"
        afterLabel="Magnetic"
        before={
          <div className="flex h-full w-full items-center justify-center bg-background">
            <button type="button" className={buttonClassName}>
              Get started
            </button>
          </div>
        }
        after={
          <div className="flex h-full w-full items-center justify-center bg-background">
            <motion.button
              type="button"
              style={{ x: springX, y: springY }}
              className={buttonClassName}
            >
              Get started
            </motion.button>
          </div>
        }
      />
    </div>
  );
}
