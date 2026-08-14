"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  Loader2Icon,
  PencilIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type PlanChecklistItemStatus = "pending" | "in-progress" | "done";

export interface PlanChecklistItem {
  id: string;
  /** The stated step, in the agent's own words — editable text, not markup. */
  label: string;
  status: PlanChecklistItemStatus;
  /** A short supporting note under the label — scope, a file count. */
  detail?: ReactNode;
}

export interface PlanChecklistProps {
  /** Caller-owned source of truth, in the order the plan will run. */
  items: readonly PlanChecklistItem[];
  title?: ReactNode;
  /** Enables inline rename on not-yet-started items. Omit to render fixed text. */
  onRelabel?: (id: string, label: string) => void;
  /**
   * Enables reordering not-yet-started items via Move up/down. Omit to
   * render a fixed order. Called with the full, reordered id list.
   */
  onReorder?: (orderedIds: string[]) => void;
  className?: string;
}

const STATUS_LABEL: Record<PlanChecklistItemStatus, string> = {
  pending: "Pending",
  "in-progress": "In progress",
  done: "Done",
};

function PlanChecklistStatusIcon({
  status,
  reduceMotion,
}: {
  status: PlanChecklistItemStatus;
  reduceMotion: boolean;
}) {
  switch (status) {
    case "pending":
      return <CircleIcon className="size-3.5 text-muted-foreground" />;
    case "in-progress":
      return (
        <Loader2Icon
          className={cn("size-3.5 text-muted-foreground", !reduceMotion && "animate-spin")}
        />
      );
    case "done":
      return <CheckIcon className="size-3.5 text-success" />;
  }
}

function PlanChecklistStatus({
  status,
  reduceMotion,
}: {
  status: PlanChecklistItemStatus;
  reduceMotion: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: spring.quick.exit }}
        transition={reduceMotion ? spring.quick.exit : spring.moderate.enter}
        className="flex size-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <PlanChecklistStatusIcon status={status} reduceMotion={reduceMotion} />
      </motion.span>
    </AnimatePresence>
  );
}

function PlanChecklistLabel({
  item,
  editable,
  reduceMotion,
  onRelabel,
}: {
  item: PlanChecklistItem;
  editable: boolean;
  reduceMotion: boolean;
  onRelabel?: (id: string, label: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function commit() {
    const next = draft.trim();
    setIsEditing(false);
    if (next && next !== item.label) onRelabel?.(item.id, next);
    else setDraft(item.label);
  }

  function cancel() {
    setDraft(item.label);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      inputRef.current?.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        onFocus={(event) => event.currentTarget.select()}
        aria-label="Step label"
        className="w-full min-w-0 rounded-sm bg-transparent text-control leading-snug text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  if (!editable) {
    return (
      <span
        className={cn(
          "min-w-0 text-control leading-snug text-foreground transition-colors duration-quick",
          item.status === "done" && "text-muted-foreground line-through",
          item.status === "in-progress" && !reduceMotion && "agent-activity-shimmer",
        )}
      >
        {item.label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group/label -mx-1 inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-sm px-1 text-left text-control leading-snug text-foreground transition-colors duration-quick hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="truncate">{item.label}</span>
      <PencilIcon className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-quick group-hover/label:opacity-100 group-focus-visible/label:opacity-100" />
    </button>
  );
}

/**
 * The agent's stated intentions before and while it acts — distinct from
 * AgentActivity, which narrates what already happened. Only steps that
 * haven't started can be renamed or reordered: once a step is in progress or
 * done it becomes a record of what happened, not a draft, so relabel/reorder
 * affordances disappear the moment a step leaves "pending". Reordering ships
 * as Move up/down rather than drag so keyboard and screen-reader users get
 * the same capability as a pointer, from the first version, not a bolted-on
 * fallback.
 */
function PlanChecklist({
  items,
  title = "Plan",
  onRelabel,
  onReorder,
  className,
}: PlanChecklistProps) {
  const reduceMotion = useReducedMotion();
  const statusId = useId();
  const titleId = useId();

  const doneCount = items.filter((item) => item.status === "done").length;
  const active = items.find((item) => item.status === "in-progress");

  function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= items.length) return;
    if (items[index].status !== "pending" || items[targetIndex].status !== "pending") return;

    const reordered = items.map((item) => item.id);
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    onReorder?.(reordered);
  }

  return (
    <motion.section
      data-slot="plan-checklist"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? spring.quick.exit : spring.moderate.enter}
      className={cn("shadow-bevel w-full max-w-md rounded-lg bg-card px-4 py-3.5", className)}
    >
      <span id={statusId} role="status" aria-live="polite" className="sr-only">
        {active
          ? `${title}: ${doneCount} of ${items.length} done, currently ${active.label}.`
          : `${title}: ${doneCount} of ${items.length} done.`}
      </span>

      <div className="flex items-center gap-2">
        <h3 id={titleId} className="text-control text-foreground">
          {title}
        </h3>
        <span className="font-mono text-micro text-muted-foreground">
          {doneCount}/{items.length}
        </span>
      </div>

      <ol aria-labelledby={titleId} className="mt-1 flex flex-col">
        <AnimatePresence initial={false}>
          {items.map((item, index) => {
            const editable = item.status === "pending";
            const canMoveUp = editable && index > 0 && items[index - 1].status === "pending";
            const canMoveDown =
              editable && index < items.length - 1 && items[index + 1].status === "pending";

            return (
              <motion.li
                key={item.id}
                layout={!reduceMotion}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
                }}
                transition={reduceMotion ? { duration: 0 } : spring.moderate.enter}
                className="group/item flex items-start gap-2.5 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <PlanChecklistStatus
                      status={item.status}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                    <PlanChecklistLabel
                      item={item}
                      editable={editable && Boolean(onRelabel)}
                      reduceMotion={Boolean(reduceMotion)}
                      onRelabel={onRelabel}
                    />
                  </div>
                  {item.detail ? (
                    <p className="pl-[1.625rem] text-caption text-muted-foreground">
                      {item.detail}
                    </p>
                  ) : null}
                  <span className="sr-only">{STATUS_LABEL[item.status]}</span>
                </div>

                {onReorder && editable ? (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-quick group-hover/item:opacity-100 group-focus-within/item:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={!canMoveUp}
                      onClick={() => move(item.id, -1)}
                      aria-label={`Move "${item.label}" up`}
                    >
                      <ChevronUpIcon className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={!canMoveDown}
                      onClick={() => move(item.id, 1)}
                      aria-label={`Move "${item.label}" down`}
                    >
                      <ChevronDownIcon className="size-3.5" />
                    </Button>
                  </div>
                ) : null}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </motion.section>
  );
}

export { PlanChecklist };
