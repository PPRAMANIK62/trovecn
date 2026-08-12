"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { usePausableWait } from "@/components/site/demo-playback";
import { ComparisonSlider } from "@/components/trovecn/motion-demos/comparison-slider";

// Same metallic-pill construction as the trove/cn membership card's PRO
// badge (gradient + inset highlight/shadow for a raised, premium chip),
// but gold rather than the accent blue — "Winner" reads as a medal, not
// another PRO-style upsell chip, and gold pairs better with the Crown
// icon than blue does. Fixed hue rather than a token for the same reason
// confetti's palette is: this is decorative, not a themed UI surface.
// Kept local rather than shared since each registry example stays a
// standalone, copy-pasteable snippet.
const winnerBadgeStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, oklch(0.88 0.16 85), oklch(0.78 0.18 80) 50%, oklch(0.68 0.17 75))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 1px rgba(0,0,0,0.18), 0 3px 10px -3px oklch(0.78 0.18 80 / 50%)",
  color: "oklch(0.3 0.08 75)",
};

interface Dish {
  id: string;
  label: string;
  image: string;
  score: number;
}

// Fixed, pre-sorted starting order — deterministic so server and client
// render the same markup before the shuffle loop (client-only, inside an
// effect) takes over.
const INITIAL_DISHES: Dish[] = [
  { id: "biryani", label: "Biryani", image: "/comparison-slider/biryani.jpg", score: 82 },
  {
    id: "butter-chicken",
    label: "Butter Chicken",
    image: "/comparison-slider/butter-chicken.jpg",
    score: 71,
  },
  {
    id: "masala-dosa",
    label: "Masala Dosa",
    image: "/comparison-slider/masala-dosa.jpg",
    score: 64,
  },
  { id: "samosa", label: "Samosa", image: "/comparison-slider/samosa.jpg", score: 53 },
  {
    id: "gulab-jamun",
    label: "Gulab Jamun",
    image: "/comparison-slider/gulab-jamun.jpg",
    score: 41,
  },
];

const SHUFFLE_INTERVAL = 2200;
const RACE_DURATION = 15_000;

// Deliberately outside the token system: confetti needs to read as a
// pile of loose, differently-dyed paper, not a themed UI surface, so a
// fixed vivid palette rather than `--accent-blue`/`--success` is the
// right call here — this is the one "seen once" moment the design
// system's delight budget allows a component a beat more personality for.
const CONFETTI_COLORS = [
  "oklch(0.7 0.22 25)", // red
  "oklch(0.78 0.18 55)", // orange
  "oklch(0.85 0.17 95)", // yellow
  "oklch(0.75 0.19 145)", // green
  "oklch(0.7 0.18 240)", // blue
  "oklch(0.65 0.22 320)", // magenta
];

// Matches ComparisonSlider's fixed `h-[420px]` stage below — pieces fall
// this far so they clear the bottom edge before the layer is torn down.
const CONFETTI_STAGE_HEIGHT = 420;

function nextScore(score: number): number {
  const delta = Math.round((Math.random() - 0.5) * 46);
  return Math.min(98, Math.max(12, score + delta));
}

/** Perturbs every score and re-sorts — a gradual leaderboard shift rather
 *  than a fresh random shuffle each cycle, so rank changes stay plausible. */
function reshuffle(dishes: Dish[]): Dish[] {
  return dishes
    .map((dish) => ({ ...dish, score: nextScore(dish.score) }))
    .toSorted((a, b) => b.score - a.score);
}

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  dx: number;
  apex: number;
  fallBack: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  circle: boolean;
}

/** A popper-bomb, not a stream — every piece launches from a tight bottom
 *  window at nearly the same instant (a narrow delay band, not spread over
 *  a second) with its own random launch angle and speed, then arcs under
 *  gravity: `y` rises easeOut (decelerating) and falls easeIn
 *  (accelerating) as two segments of one keyframe run, while `x` carries
 *  the constant lateral throw from that angle. The wide angle spread
 *  (~±85° from straight up) plus per-piece speed is what reads as a
 *  scattered explosion rather than pieces all traveling the same line.
 *  Bespoke duration/ease rather than a `spring` tier — the tiers model UI
 *  state changes, this is a physical scatter. */
function Confetti() {
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: 80 }, (_, i) => {
        const angle = (Math.random() - 0.5) * Math.PI * 0.95;
        const speed = 320 + Math.random() * 340;
        const apex = Math.cos(angle) * speed * 0.95;
        return {
          id: i,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          left: 50 + (Math.random() - 0.5) * 40,
          dx: Math.sin(angle) * speed,
          apex,
          fallBack: apex * 0.45,
          size: 7 + Math.random() * 7,
          rotate: (Math.random() < 0.5 ? -1 : 1) * (480 + Math.random() * 480),
          delay: Math.random() * 0.18,
          duration: 1.5 + Math.random() * 1.1,
          circle: Math.random() < 0.35,
        };
      }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className={cn("absolute top-0", piece.circle ? "rounded-full" : "rounded-[1px]")}
          style={{
            left: `${piece.left}%`,
            width: piece.circle ? piece.size : piece.size * 0.7,
            height: piece.circle ? piece.size : piece.size * 1.8,
            backgroundColor: piece.color,
          }}
          initial={{ y: CONFETTI_STAGE_HEIGHT + 24, x: 0, opacity: 0 }}
          animate={{
            y: [
              CONFETTI_STAGE_HEIGHT + 24,
              CONFETTI_STAGE_HEIGHT + 24 - piece.apex,
              CONFETTI_STAGE_HEIGHT + 24 - piece.apex + piece.fallBack,
            ],
            x: piece.dx,
            opacity: [0, 1, 1, 0],
            rotate: piece.rotate,
          }}
          transition={{
            y: {
              duration: piece.duration,
              delay: piece.delay,
              times: [0, 0.4, 1],
              ease: ["easeOut", "easeIn"],
            },
            x: { duration: piece.duration, delay: piece.delay, ease: "easeOut" },
            opacity: { duration: piece.duration, delay: piece.delay, times: [0, 0.05, 0.65, 1] },
            rotate: { duration: piece.duration, delay: piece.delay, ease: "linear" },
          }}
        />
      ))}
    </div>
  );
}

function Row({
  rank,
  dish,
  animated,
  winner = false,
}: {
  rank: number;
  dish: Dish;
  animated: boolean;
  winner?: boolean;
}) {
  return (
    <motion.div
      layout={animated}
      transition={animated ? spring.moderate.enter : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-border bg-card px-2.5 py-2",
        winner && "border-accent-blue/50 ring-2 ring-accent-blue/15",
      )}
    >
      <div className="relative shrink-0">
        {/* A dish photo is a fixed, bundled asset shipped alongside this demo
            — not runtime content — so Next's static Image optimization would
            apply fine in a consumer's app; kept as a plain img here only so
            this example stays copy-pasteable outside a Next project. */}
        {/* oxlint-disable-next-line no-img-element */}
        <img
          src={dish.image}
          alt={dish.label}
          className="size-12 rounded-lg border border-border object-cover"
        />
        <span className="absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-2xs font-semibold text-background ring-2 ring-card">
          {rank}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">{dish.label}</span>
          {winner && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={spring.quick.enter}
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold tracking-wide uppercase"
              style={winnerBadgeStyle}
            >
              <Crown className="size-3" strokeWidth={2.5} />
              Winner
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full bg-foreground/70",
                animated && "transition-[width] duration-500 ease-out",
              )}
              style={{ width: `${dish.score}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {dish.score}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ComparisonSliderListReorderExample() {
  const reduceMotion = useReducedMotion();
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [finished, setFinished] = useState(false);
  const { wait } = usePausableWait();

  useEffect(() => {
    let cancelled = false;

    // Demo-time elapsed, not a wall-clock timer — `wait` only resolves after
    // its ms have ticked down while playing, so this stays exactly 10s of
    // unpaused runtime regardless of how long the transport control pauses it.
    const run = async () => {
      let elapsed = 0;
      while (elapsed < RACE_DURATION) {
        const step = Math.min(SHUFFLE_INTERVAL, RACE_DURATION - elapsed);
        await wait(step);
        if (cancelled) return;
        setDishes((prev) => reshuffle(prev));
        elapsed += step;
      }
      if (!cancelled) setFinished(true);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [wait]);

  return (
    <ComparisonSlider
      beforeLabel="Snap"
      afterLabel="Smooth"
      className="aspect-auto h-[420px]"
      before={
        <div className="relative flex h-full w-full items-center justify-center bg-background p-6">
          <div className="flex w-72 flex-col gap-2">
            {dishes.map((dish, index) => (
              <Row
                key={dish.id}
                rank={index + 1}
                dish={dish}
                animated={false}
                winner={finished && index === 0}
              />
            ))}
          </div>
          {finished && !reduceMotion && <Confetti />}
        </div>
      }
      after={
        <div className="relative flex h-full w-full items-center justify-center bg-background p-6">
          <div className="flex w-72 flex-col gap-2">
            {dishes.map((dish, index) => (
              <Row
                key={dish.id}
                rank={index + 1}
                dish={dish}
                animated={!reduceMotion}
                winner={finished && index === 0}
              />
            ))}
          </div>
          {finished && !reduceMotion && <Confetti />}
        </div>
      }
    />
  );
}
