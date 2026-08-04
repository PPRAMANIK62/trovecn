"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CommandPaletteItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  items: CommandPaletteItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function CommandPalette({ items, open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevQuery, setPrevQuery] = React.useState(query);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Ignore hover highlighting until the pointer actually moves after the
  // panel opens — otherwise whatever item happens to render under a
  // stationary cursor (e.g. right where the trigger button was) steals the
  // highlight from the freshly-reset first item.
  const hasPointerMovedRef = React.useRef(false);
  const shouldReduceMotion = useReducedMotion();

  // Reset search + selection whenever the palette opens. Adjusted during
  // render rather than in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
      hasPointerMovedRef.current = false;
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandPaletteItem[]>();
    for (const item of filtered) {
      const key = item.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Any time the query changes, snap selection back to the first result.
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  // Autofocus the input when the palette opens. A side effect with no
  // setState of its own, so it stays a plain effect.
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  // Keep the highlighted row scrolled into view during keyboard navigation.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = React.useCallback(
    (item: CommandPaletteItem) => {
      item.onSelect();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = filtered[activeIndex];
      if (item) handleSelect(item);
    }
  };

  const transitionDuration = shouldReduceMotion ? 0 : 0.4;
  const backdropDuration = shouldReduceMotion ? 0 : 0.3;

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            key="command-palette-backdrop"
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: backdropDuration, ease: EASE }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            key="command-palette-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: transitionDuration, ease: EASE }}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a command or search..."
                aria-label="Search commands"
                className="h-12 w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto p-2"
              onPointerMove={() => {
                hasPointerMovedRef.current = true;
              }}
            >
              {filtered.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </p>
              )}

              {groups.map(([group, groupItems]) => (
                <div key={group || "ungrouped"} className="mb-2 last:mb-0">
                  {group && (
                    <p className="px-2.5 pt-2 pb-1 font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">
                      {group}
                    </p>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const currentIndex = flatIndex;
                      const isActive = currentIndex === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-index={currentIndex}
                          onMouseEnter={() => {
                            if (hasPointerMovedRef.current) setActiveIndex(currentIndex);
                          }}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/60",
                          )}
                        >
                          {item.icon && (
                            <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
