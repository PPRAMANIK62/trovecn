"use client";

import { useEffect, useState } from "react";

/**
 * Stream narrative output in compact batches. This is intentionally reserved
 * for prose: files, commands, sources, and diffs arrive as discrete traces.
 */
function useStreamingText(text: string, active: boolean, charactersPerTick = 3, tickMs = 16) {
  const [count, setCount] = useState(0);
  const length = text.length;

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    if (count >= length) return;

    const timer = window.setTimeout(
      () => setCount((value) => Math.min(value + charactersPerTick, length)),
      tickMs,
    );

    return () => window.clearTimeout(timer);
  }, [active, charactersPerTick, count, length, tickMs]);

  if (!active && count > 0) return text;
  if (!active) return text;
  return text.slice(0, count);
}

export function StreamingDescription({
  text,
  active,
  complete,
}: {
  text: string;
  active: boolean;
  complete: boolean;
}) {
  const streamedText = useStreamingText(text, active);
  const displayText = complete ? text : streamedText;

  if (!displayText) return null;

  return <span className="text-body leading-snug text-muted-foreground">{displayText}</span>;
}
