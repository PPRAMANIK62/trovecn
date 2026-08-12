"use client";

import { useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { Save } from "lucide-react";

import { cn } from "@/lib/utils";
import { ComparisonSlider } from "@/components/trovecn/motion-demos/comparison-slider";

const MAX_TILT = 14;
const SPRING = { stiffness: 220, damping: 18, mass: 0.5 };

const badgeGradient: CSSProperties = {
  background:
    "linear-gradient(135deg, color-mix(in oklch, var(--accent-blue), white 35%), var(--accent-blue) 55%, color-mix(in oklch, var(--accent-blue), black 30%))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.15)",
};

function MemberCard({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        "relative flex aspect-video w-72 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 text-foreground",
        className,
      )}
      style={style}
    >
      {/* A floppy disk is the universal save icon despite nobody having
          touched one in decades — the anachronism is half the joke, so it's
          decorative background flavor rather than something read literally. */}
      <Save
        aria-hidden
        strokeWidth={1.5}
        className="absolute -right-5 -bottom-7 size-32 -rotate-12 text-accent-blue/15"
      />
      {/* Diagonal satin-shadow streak instead of a bright highlight — the
          card face is already near-white, so a light "sheen" gradient would
          just wash into the background. A soft dark band reads as gloss
          because the untouched white on either side looks brighter by
          contrast, the same illusion flat-design "brushed metal" uses. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 15%, rgba(15, 23, 42, 0.05) 44%, rgba(15, 23, 42, 0.08) 50%, rgba(15, 23, 42, 0.05) 56%, transparent 85%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="text-sm font-semibold tracking-tight">
          trove<span className="font-mono font-normal text-muted-foreground">/cn</span>
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase"
          style={badgeGradient}
        >
          Pro
        </span>
      </div>
      <div className="relative z-10 flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border border-b-2 bg-muted font-mono text-sm font-semibold text-muted-foreground shadow-sm">
          ⌘
        </span>
        <p className="text-base leading-snug font-semibold text-nowrap">Certified Cmd+S Enjoyer</p>
      </div>
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex items-center gap-2.5 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
          {[0, 1, 2].map((group) => (
            <span key={group} className="flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, dot) => (
                <span key={dot} className="size-[3px] rounded-full bg-muted-foreground/50" />
              ))}
            </span>
          ))}
          <span>CMD</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-wide text-muted-foreground/70 uppercase">Valid thru</p>
          <p className="font-mono text-xs text-muted-foreground">∞ / ∞</p>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonSliderTiltCardExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Cursor position as a -0.5..0.5 fraction of the container's width/height.
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const springFx = useSpring(fx, SPRING);
  const springFy = useSpring(fy, SPRING);

  const rotateY = useTransform(springFx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(springFy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  // A directional glow instead of an on-face highlight — it shifts to the
  // side the card leans away from, like the card catching blue ambient
  // light, without ever sitting on top of (and washing out) the text.
  const glowX = useTransform(springFx, [-0.5, 0.5], [26, -26]);
  const glowY = useTransform(springFy, [-0.5, 0.5], [26, -26]);
  const cardShadow = useMotionTemplate`${glowX}px ${glowY}px 34px 2px color-mix(in oklch, var(--accent-blue), transparent 40%), 0 14px 30px -14px rgba(0,0,0,0.35)`;

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    fx.set((event.clientX - rect.left) / rect.width - 0.5);
    fy.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    fx.set(0);
    fy.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="w-full"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ComparisonSlider
        beforeLabel="Flat"
        afterLabel="Tilt"
        before={
          <div className="flex h-full w-full items-center justify-center bg-background">
            <MemberCard className="shadow-sm" />
          </div>
        }
        after={
          <div
            className="flex h-full w-full items-center justify-center bg-background"
            style={{ perspective: 800 }}
          >
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d", boxShadow: cardShadow }}
              className="relative rounded-2xl"
            >
              <MemberCard />
            </motion.div>
          </div>
        }
      />
    </div>
  );
}
