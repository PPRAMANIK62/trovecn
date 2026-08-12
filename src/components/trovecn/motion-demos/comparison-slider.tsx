"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ComparisonSliderProps {
  /** Layer revealed on the left of the divider. */
  before: React.ReactNode;
  /** Layer revealed on the right of the divider — sits underneath, full-bleed. */
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Divider position as a percentage (0-100) of the container width. */
  defaultValue?: number;
  className?: string;
}

const STEP = 4;
const RESET_TRANSITION = "clip-path 300ms cubic-bezier(0.23, 1, 0.32, 1)";

export function ComparisonSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  defaultValue = 50,
  className,
}: ComparisonSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSettling, setIsSettling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.min(100, Math.max(0, pct)));
  }, []);

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    setIsSettling(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    updateFromClientX(event.clientX);
  }

  function onHandlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onHandleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") setValue((v) => Math.max(0, v - STEP));
    else if (event.key === "ArrowRight") setValue((v) => Math.min(100, v + STEP));
    else if (event.key === "Home") setValue(0);
    else if (event.key === "End") setValue(100);
    else return;
    setIsSettling(true);
    event.preventDefault();
  }

  function onDoubleClick() {
    draggingRef.current = false;
    setIsSettling(true);
    setValue(50);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full touch-none overflow-hidden rounded-2xl border border-border bg-card select-none",
        className,
      )}
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute inset-0">{after}</div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - value}% 0 0)`,
          transition: isSettling ? RESET_TRANSITION : undefined,
        }}
        onTransitionEnd={() => setIsSettling(false)}
      >
        {before}
      </div>

      <div className="pointer-events-none absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-2xs font-medium text-foreground shadow-sm backdrop-blur">
        {beforeLabel}
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-2xs font-medium text-foreground shadow-sm backdrop-blur">
        {afterLabel}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-border"
        style={{
          left: `${value}%`,
          transition: isSettling ? "left 300ms cubic-bezier(0.23, 1, 0.32, 1)" : undefined,
        }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-label="Comparison position"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          onKeyDown={onHandleKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-transform duration-quick ease-out outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronsLeftRight className="size-4" />
        </div>
      </div>
    </div>
  );
}
