"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bold, Italic } from "lucide-react";

import {
  SelectionToolbar,
  type SelectionAction,
} from "@/components/trovecn/inputs/selection-toolbar";
import { spring } from "@/lib/springs";

/**
 * The other job, and the place to see the API rather than the defaults. A
 * comment composer wants fewer controls than a document editor, and it wants
 * to know what was applied rather than leaving the markup to speak for
 * itself.
 */
export default function SelectionToolbarCommentExample() {
  const [lastRun, setLastRun] = useState<string | null>(null);

  /** Memoised on purpose. `actions` is a dependency of the component's own
   *  selection listeners, so a fresh array every render would resubscribe
   *  them every render. */
  const commentActions = useMemo<SelectionAction[]>(
    () => [
      {
        id: "bold",
        label: "Bold",
        icon: <Bold className="size-3.5" />,
        run: ({ text }) => {
          document.execCommand("bold");
          setLastRun(`Bold → ${text}`);
        },
        isActive: () => document.queryCommandState("bold"),
      },
      {
        id: "italic",
        label: "Italic",
        icon: <Italic className="size-3.5" />,
        run: ({ text }) => {
          document.execCommand("italic");
          setLastRun(`Italic → ${text}`);
        },
        isActive: () => document.queryCommandState("italic"),
      },
    ],
    [],
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-full bg-accent" aria-hidden />
        <span className="text-caption text-muted-foreground">Priya Raman</span>
      </div>

      <SelectionToolbar actions={commentActions}>
        <div
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="min-h-16 rounded-lg border border-border p-3 text-body outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Migration is behind a flag, so this can ship whenever review clears.
        </div>
      </SelectionToolbar>

      {/* A label whose text changes crossfades rather than teleports, per
          `design-system.md`. `mode="wait"` so the two strings never overlap
          and smear: the old one leaves on the faster tier, then the new one
          arrives. `min-h-5` already reserves the row, so nothing reflows. */}
      <p className="min-h-5 text-caption text-muted-foreground">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={lastRun ?? "empty"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: spring.fast.exit }}
            transition={spring.quick.enter}
          >
            {lastRun ?? "A custom action reports here. The text is the live selection."}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
}
