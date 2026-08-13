"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon, Loader2Icon, RotateCcwIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type ApprovalRequestStatus = "pending" | "approved" | "denied" | "expired" | "cancelled";

export interface ApprovalRequestDetail {
  summary: ReactNode;
  /** Compact key:value parameters, rendered in mono — counts, paths, filters. */
  items?: readonly ReactNode[];
  /** Full-sentence content (a message draft, a diff) rendered as body copy instead of mono. */
  preview?: ReactNode;
}

export interface ApprovalRequestProps {
  id: string;
  /** The action being approved, stated as what will happen — not a question. */
  title: ReactNode;
  /** One-line requester context: which agent or tool call, and where in the run. */
  context?: ReactNode;
  detail?: ApprovalRequestDetail;
  /** Freeform label for whichever category applies ("Irreversible," "Customer-facing," …). No fixed vocabulary — the caller writes it. */
  flag?: ReactNode;
  /** Binary, not a severity scale: trove/cn has one semantic warning colour. */
  flagTone?: "default" | "critical";
  /** Caller-owned source of truth. This component renders it; it never sets it itself. */
  status: ApprovalRequestStatus;
  /** Renders a static deadline label. Not a timer — the caller still drives the transition to "expired". */
  expiresAt?: Date;
  decidedBy?: ReactNode;
  decidedAt?: ReactNode;
  /** A rejected promise renders the anchored inline error state with Retry — never a toast. */
  onApprove?: () => void | Promise<void>;
  onDeny?: () => void | Promise<void>;
  className?: string;
}

type DecisionAction = "approve" | "deny";
type Phase = "pending" | "submitting" | "error" | "resolved";

const RESOLVED_COPY: Record<
  Exclude<ApprovalRequestStatus, "pending">,
  { icon: typeof CheckIcon; label: string; tone: "success" | "muted" | "destructive" }
> = {
  approved: { icon: CheckIcon, label: "Approved", tone: "success" },
  denied: { icon: XIcon, label: "Denied", tone: "muted" },
  expired: { icon: XIcon, label: "Expired", tone: "destructive" },
  cancelled: { icon: XIcon, label: "Cancelled", tone: "muted" },
};

function ApprovalRequestDetailDisclosure({ detail }: { detail: ApprovalRequestDetail }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-1.5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
        className="group relative inline-flex items-center gap-1 text-caption text-muted-foreground transition-colors duration-quick before:absolute before:-inset-3 before:content-[''] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{detail.summary}</span>
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
              {detail.preview ? (
                <div className="shadow-well rounded-md bg-background px-2.5 py-2 text-body leading-relaxed text-foreground">
                  {detail.preview}
                </div>
              ) : null}
              {detail.items && detail.items.length > 0 ? (
                <div className="flex flex-col gap-1 rounded-md bg-muted px-2.5 py-2 font-mono text-meta text-muted-foreground">
                  {detail.items.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
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
 * A stable, explicit pause for a human decision inside an agent run — never a
 * spinner standing in for consent. Inline and persistent in its surrounding
 * stream rather than a Dialog, so the pause can't be Escape-dismissed and the
 * context that justifies it never leaves view. Motion story: the action row
 * leaves before the resolved row claims its space, and the card itself never
 * moves or dismisses once a decision lands — resolving must not make the
 * decision disappear.
 */
function ApprovalRequest({
  title,
  context,
  detail,
  flag,
  flagTone = "default",
  status,
  expiresAt,
  decidedBy,
  decidedAt,
  onApprove,
  onDeny,
  className,
}: ApprovalRequestProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const [pendingAction, setPendingAction] = useState<DecisionAction | null>(null);
  const [lastAction, setLastAction] = useState<DecisionAction | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deadlineLabel, setDeadlineLabel] = useState<string | null>(null);

  // Computed after mount only — locale-formatted time can differ between the
  // server's timezone and the browser's, which would otherwise be a
  // hydration mismatch. A brief blank beat is preferable to a wrong one.
  useEffect(() => {
    if (!expiresAt) {
      setDeadlineLabel(null);
      return;
    }
    setDeadlineLabel(
      expiresAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    );
  }, [expiresAt]);

  const phase: Phase =
    status !== "pending"
      ? "resolved"
      : submitError
        ? "error"
        : pendingAction
          ? "submitting"
          : "pending";

  async function handleDecision(action: DecisionAction) {
    const handler = action === "approve" ? onApprove : onDeny;
    setLastAction(action);
    setSubmitError(null);
    setPendingAction(action);
    try {
      await handler?.();
    } catch {
      setSubmitError(
        action === "approve"
          ? "Couldn’t submit the approval. Try again."
          : "Couldn’t submit the denial. Try again.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  const resolved = status !== "pending" ? RESOLVED_COPY[status] : null;
  const ResolvedIcon = resolved?.icon;

  return (
    <motion.section
      data-slot="approval-request"
      role="group"
      aria-labelledby={titleId}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? spring.quick.exit : spring.moderate.enter}
      className={cn("shadow-bevel w-full max-w-md rounded-lg bg-card px-4 py-3.5", className)}
    >
      {context || flag ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {context ? <p className="m-0 text-meta text-muted-foreground">{context}</p> : null}
          {flag ? (
            <span
              className={cn(
                "ml-auto font-mono text-micro tracking-wide uppercase",
                flagTone === "critical"
                  ? "text-destructive underline decoration-destructive/40 underline-offset-2"
                  : "text-muted-foreground",
              )}
            >
              {flag}
            </span>
          ) : null}
        </div>
      ) : null}

      <p id={titleId} className="mt-0.5 text-control leading-snug text-foreground">
        {title}
      </p>

      {deadlineLabel ? (
        <p className="mt-1 font-mono text-micro text-muted-foreground">Expires {deadlineLabel}</p>
      ) : null}

      {detail ? <ApprovalRequestDetailDisclosure detail={detail} /> : null}

      <div className="relative mt-3 min-h-8" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "pending" || phase === "submitting" ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: reduceMotion ? { duration: 0 } : spring.quick.exit }}
              transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                size="sm"
                disabled={phase === "submitting"}
                onClick={() => void handleDecision("approve")}
                className="relative before:absolute before:-top-2 before:-bottom-2 before:inset-x-0 before:content-['']"
              >
                {pendingAction === "approve" ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
                    Approving…
                  </>
                ) : (
                  "Approve"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={phase === "submitting"}
                onClick={() => void handleDecision("deny")}
                className="relative before:absolute before:-top-2 before:-bottom-2 before:inset-x-0 before:content-['']"
              >
                {pendingAction === "deny" ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
                    Denying…
                  </>
                ) : (
                  "Deny"
                )}
              </Button>
            </motion.div>
          ) : phase === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: reduceMotion ? { duration: 0 } : spring.quick.exit }}
              transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-caption text-destructive">{submitError}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => lastAction && void handleDecision(lastAction)}
              >
                <RotateCcwIcon className="size-3.5" />
                Retry
              </Button>
            </motion.div>
          ) : resolved && ResolvedIcon ? (
            <motion.div
              key="resolved"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: reduceMotion ? { duration: 0 } : spring.quick.exit }}
              transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              className="flex items-center gap-1.5 text-caption text-muted-foreground"
            >
              <ResolvedIcon
                className={cn(
                  "size-3.5 shrink-0",
                  resolved.tone === "success" && "text-success",
                  resolved.tone === "destructive" && "text-destructive",
                  resolved.tone === "muted" && "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <span>
                <span
                  className={cn(
                    "font-medium",
                    resolved.tone === "destructive" ? "text-destructive" : "text-foreground",
                  )}
                >
                  {resolved.label}
                </span>
                {decidedBy ? <> by {decidedBy}</> : null}
                {decidedAt ? <> · {decidedAt}</> : null}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export { ApprovalRequest };
