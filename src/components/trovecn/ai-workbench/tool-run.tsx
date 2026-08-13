"use client";

import { useId, useState, type ReactNode } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  ApprovalRequest,
  type ApprovalRequestProps,
} from "@/components/trovecn/ai-workbench/approval-request";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type ToolRunStatus =
  | "queued"
  | "running"
  | "needs-approval"
  | "success"
  | "error"
  | "cancelled";

export interface ToolRunDetail {
  /** Compact key:value call arguments, rendered in mono. */
  args?: readonly ReactNode[];
  /** The call's result, once it has one — body copy, not a key:value list. */
  result?: ReactNode;
}

export interface ToolRunProps {
  /** Stable identifier for the call. Not rendered — for the caller's own keys/lookups. */
  id: string;
  /** The tool being called, e.g. "search_docs" or "Read file". */
  tool: ReactNode;
  /** A short call summary next to the tool name — an argument preview, not the full arguments. */
  summary?: ReactNode;
  /** Caller-owned source of truth. This component renders it; it never sets it itself. */
  status: ToolRunStatus;
  detail?: ToolRunDetail;
  /** Trailing metadata — elapsed time, a timestamp. */
  meta?: ReactNode;
  errorMessage?: ReactNode;
  /** A rejected retry re-renders the same anchored error — never a toast. */
  onRetry?: () => void | Promise<void>;
  /**
   * Required while status is "needs-approval" — the props ToolRun forwards
   * to an embedded ApprovalRequest, whose card body replaces ToolRun's own
   * for the duration of the pause. `variant` and `className` are owned by
   * ToolRun and can't be overridden here.
   */
  approval?: Omit<ApprovalRequestProps, "variant" | "className">;
  className?: string;
}

type StatusTone = "muted" | "success" | "destructive";

const STATUS_COPY: Record<
  Exclude<ToolRunStatus, "needs-approval">,
  { label: string; tone: StatusTone }
> = {
  queued: { label: "Queued", tone: "muted" },
  running: { label: "Running", tone: "muted" },
  success: { label: "Done", tone: "success" },
  error: { label: "Failed", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

function ToolRunStatusIcon({
  status,
  reduceMotion,
}: {
  status: ToolRunStatus;
  reduceMotion: boolean;
}) {
  switch (status) {
    case "queued":
      return <span className="size-1.5 rounded-full bg-muted-foreground" />;
    case "running":
      return (
        <Loader2Icon
          className={cn("size-3.5 text-muted-foreground", !reduceMotion && "animate-spin")}
        />
      );
    case "success":
      return <CheckIcon className="size-3.5 text-success" />;
    case "error":
      return <AlertTriangleIcon className="size-3.5 text-destructive" />;
    case "cancelled":
      return <XIcon className="size-3.5 text-muted-foreground" />;
    case "needs-approval":
      return null;
  }
}

function ToolRunDisclosure({ detail, showResult }: { detail: ToolRunDetail; showResult: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const reduceMotion = useReducedMotion();

  const hasArgs = Boolean(detail.args && detail.args.length > 0);
  const hasResult = showResult && Boolean(detail.result);
  if (!hasArgs && !hasResult) return null;

  const label = hasArgs && hasResult ? "Arguments & result" : hasResult ? "Result" : "Arguments";

  return (
    <div className="mt-1.5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
        className="group relative inline-flex items-center gap-1 text-caption text-muted-foreground transition-colors duration-quick before:absolute before:-inset-3 before:content-[''] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{label}</span>
        <motion.span
          animate={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
          transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
        >
          <ChevronDownIcon className="size-3" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={contentId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? spring.quick.exit : spring.moderate.enter}
            className="overflow-hidden"
          >
            <div className="mt-1.5 flex flex-col gap-1.5">
              {hasArgs ? (
                <div className="flex flex-col gap-1 rounded-md bg-muted px-2.5 py-2 font-mono text-meta text-muted-foreground">
                  {detail.args?.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
                </div>
              ) : null}
              {hasResult ? (
                <div className="shadow-well rounded-md bg-background px-2.5 py-2 text-body leading-relaxed text-foreground">
                  {detail.result}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * One tool call's lifecycle: queued, running, paused on approval, and its
 * resolution, with call arguments and results always one click away behind
 * a disclosure. A needs-approval status hands the whole card body off to
 * ApprovalRequest (via its embedded variant) instead of growing a second,
 * competing consent affordance — Retry stays anchored to the call that
 * failed rather than surfacing as a toast elsewhere.
 */
function ToolRun({
  tool,
  summary,
  status,
  detail,
  meta,
  errorMessage,
  onRetry,
  approval,
  className,
}: ToolRunProps) {
  const reduceMotion = useReducedMotion();
  const statusId = useId();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  async function handleRetry() {
    setRetryError(null);
    setIsRetrying(true);
    try {
      await onRetry?.();
    } catch {
      setRetryError("Retry failed. Try again.");
    } finally {
      setIsRetrying(false);
    }
  }

  const isNeedsApproval = status === "needs-approval";
  const statusCopy = isNeedsApproval ? null : STATUS_COPY[status];

  return (
    <motion.div
      data-slot="tool-run"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? spring.quick.exit : spring.moderate.enter}
      className={cn("shadow-bevel w-full max-w-md rounded-lg bg-card px-4 py-3.5", className)}
    >
      <span id={statusId} role="status" aria-live="polite" className="sr-only">
        {statusCopy ? `${tool}: ${statusCopy.label}` : `${tool}: needs approval`}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        {isNeedsApproval && approval ? (
          <motion.div
            key="approval"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: reduceMotion ? { duration: 0 } : spring.quick.exit }}
            transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
          >
            <ApprovalRequest {...approval} variant="embedded" />
          </motion.div>
        ) : (
          <motion.div
            key="call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: reduceMotion ? { duration: 0 } : spring.quick.exit }}
            transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                <ToolRunStatusIcon status={status} reduceMotion={Boolean(reduceMotion)} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-control text-foreground",
                  status === "running" && !reduceMotion && "agent-activity-shimmer",
                )}
              >
                {tool}
                {summary ? (
                  <span className="font-normal text-muted-foreground"> · {summary}</span>
                ) : null}
              </span>
              {meta ? (
                <span className="shrink-0 font-mono text-micro text-muted-foreground">{meta}</span>
              ) : null}
            </div>

            {detail ? (
              <ToolRunDisclosure detail={detail} showResult={status === "success"} />
            ) : null}

            {status === "error" ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-caption text-destructive">
                  {retryError ?? errorMessage ?? "This call failed."}
                </span>
                {onRetry ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isRetrying}
                    onClick={() => void handleRetry()}
                  >
                    {isRetrying ? (
                      <Loader2Icon
                        className={cn("size-3.5", !reduceMotion && "animate-spin")}
                        aria-hidden="true"
                      />
                    ) : (
                      <RotateCcwIcon className="size-3.5" />
                    )}
                    {isRetrying ? "Retrying…" : "Retry"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { ToolRun };
