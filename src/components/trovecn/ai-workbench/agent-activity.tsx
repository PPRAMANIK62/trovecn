"use client";

import { useId, useState, type ComponentType, type ReactNode } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  SearchIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type AgentActivityStatus = "pending" | "active" | "complete";

export type AgentActivityIcon = "thinking" | "reasoning" | "search" | "tool" | "image";

export interface AgentActivityImage {
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface AgentActivityDetails {
  summary: ReactNode;
  items: readonly ReactNode[];
  defaultOpen?: boolean;
}

export interface AgentActivityEntry {
  id: string;
  /** The completed label shown after the step resolves. */
  label: ReactNode;
  /** Optional in-progress label, such as "Reading…" before "Read…". */
  activeLabel?: ReactNode;
  status: AgentActivityStatus;
  /** Marks a description that changes token by token while its step is active. */
  isStreamingText?: boolean;
  /** A compact secondary line, including text that may update while streaming. */
  description?: ReactNode;
  icon?: AgentActivityIcon;
  /** Defaults to an understated dot when false. */
  showIcon?: boolean;
  sources?: readonly ReactNode[];
  details?: AgentActivityDetails;
  image?: AgentActivityImage;
}

export interface AgentActivityProps {
  entries: readonly AgentActivityEntry[];
  /** The interactive run label; it remains the stable anchor while steps arrive. */
  title?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ICONS: Record<AgentActivityIcon, ComponentType<{ className?: string }>> = {
  thinking: CircleIcon,
  reasoning: FileTextIcon,
  search: SearchIcon,
  tool: SquareTerminalIcon,
  image: ImageIcon,
};

const railDrawTransition = { ...spring.moderate.enter, bounce: 0.06 };
// Output is append-only trace data, so it should simply arrive in place rather
// than competing with the structural step and rail motion.
const evidenceRevealTransition = spring.quick.exit;
const reducedFadeTransition = spring.quick.exit;

function AgentActivityDetails({ details }: { details: AgentActivityDetails }) {
  const [isOpen, setIsOpen] = useState(details.defaultOpen ?? false);
  const id = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-1.5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen((open) => !open)}
        className="group inline-flex items-center gap-1 text-caption text-muted-foreground transition-colors duration-quick hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{details.summary}</span>
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
            id={id}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? reducedFadeTransition : spring.moderate.enter}
            className="overflow-hidden"
          >
            <div className="mt-1 flex flex-col gap-1 pl-2.5 text-meta text-muted-foreground">
              {details.items.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AgentActivityStep({
  entry,
  hasFollowingStep,
}: {
  entry: AgentActivityEntry;
  hasFollowingStep: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = entry.icon ? ICONS[entry.icon] : CircleIcon;
  const isActive = entry.status === "active";
  const displayLabel = isActive ? (entry.activeLabel ?? entry.label) : entry.label;
  const hasLiveDescription = isActive && entry.isStreamingText && Boolean(entry.description);
  const hasSupportingContent = Boolean(
    entry.description || entry.sources?.length || entry.details || entry.image,
  );

  if (entry.status === "pending") return null;

  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : hasLiveDescription ? { opacity: 0 } : { height: 0 }}
      animate={
        reduceMotion ? { opacity: 1 } : hasLiveDescription ? { opacity: 1 } : { height: "auto" }
      }
      transition={reduceMotion ? reducedFadeTransition : spring.slow.enter}
      className={cn("relative", !hasLiveDescription && "overflow-hidden")}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? reducedFadeTransition : { ...spring.quick.enter, delay: 0.06 }}
        className="flex gap-3"
      >
        <div className="flex w-4 shrink-0 flex-col items-center">
          <span className="mt-0.5 flex size-4 items-center justify-center text-muted-foreground">
            {entry.status === "complete" ? (
              <CheckIcon className="size-3.5" />
            ) : entry.showIcon === false ? (
              <span className="size-1.5 rounded-full bg-muted-foreground" />
            ) : (
              <Icon className="size-3.5" />
            )}
          </span>
          {hasSupportingContent && hasFollowingStep ? (
            <motion.span
              initial={
                reduceMotion
                  ? { opacity: 0, transform: "scaleY(1)" }
                  : { opacity: 0, transform: "scaleY(0)" }
              }
              animate={{ opacity: 1, transform: "scaleY(1)" }}
              transition={reduceMotion ? reducedFadeTransition : railDrawTransition}
              style={{ transformOrigin: "top" }}
              className="my-1 w-px flex-1 bg-border/60"
              aria-hidden="true"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 pb-3">
          <div
            className={cn(
              "text-control leading-snug text-foreground",
              isActive && !reduceMotion && "agent-activity-shimmer",
            )}
          >
            {displayLabel}
            {isActive ? <span aria-hidden="true">…</span> : null}
          </div>
          {entry.description ? (
            entry.isStreamingText ? (
              <div className="mt-1 text-body leading-relaxed text-muted-foreground">
                {entry.description}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduceMotion ? reducedFadeTransition : evidenceRevealTransition}
                className="mt-1 text-body leading-relaxed text-muted-foreground"
              >
                {entry.description}
              </motion.div>
            )
          ) : null}
          {entry.sources && entry.sources.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.sources.map((source, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    ...(reduceMotion ? reducedFadeTransition : evidenceRevealTransition),
                    delay: reduceMotion ? 0 : index * 0.04,
                  }}
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-meta text-muted-foreground"
                >
                  <GlobeIcon className="mr-1 inline-block size-2.5 align-[-1px]" />
                  {source}
                </motion.span>
              ))}
            </div>
          ) : null}
          {entry.details ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? reducedFadeTransition : evidenceRevealTransition}
            >
              <AgentActivityDetails details={entry.details} />
            </motion.div>
          ) : null}
          {entry.image ? (
            <motion.figure
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? reducedFadeTransition : spring.moderate.exit}
              className="mt-2.5"
            >
              {/* The visual may be a runtime URL from an agent result, so Next's
                static Image optimization and its host allow-list cannot be
                assumed by this distributable component. */}
              {/* oxlint-disable-next-line no-img-element */}
              <img
                src={entry.image.src}
                alt={entry.image.alt}
                className="aspect-video h-auto w-full max-w-56 rounded-lg border border-border bg-card object-cover"
              />
              {entry.image.caption ? (
                <figcaption className="mt-1 text-meta text-muted-foreground">
                  {entry.image.caption}
                </figcaption>
              ) : null}
            </motion.figure>
          ) : null}
        </div>
      </motion.div>
    </motion.li>
  );
}

/**
 * A collapsible agent-run timeline. Pending steps stay out of the document,
 * active steps retain the live state, and completed steps become readable history.
 * Motion story: the header is the fixed anchor; each arriving static step
 * makes vertical space, then settles into the execution trail. A live text
 * step only fades so its changing line breaks are never clipped.
 */
function AgentActivity({
  entries,
  title = "Thinking",
  defaultOpen = true,
  open,
  onOpenChange,
  className,
}: AgentActivityProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const contentId = useId();
  const reduceMotion = useReducedMotion();
  const visibleEntries = entries.filter((entry) => entry.status !== "pending");

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section data-slot="agent-activity" className={cn("w-full max-w-md", className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 py-1 text-control text-muted-foreground transition-colors duration-quick hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{title}</span>
        <motion.span
          animate={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
          transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
        >
          <ChevronDownIcon className="size-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={contentId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? reducedFadeTransition : spring.moderate.enter}
            className="overflow-hidden"
          >
            <ol className="pt-3" aria-label="Agent activity">
              <AnimatePresence initial={false}>
                {visibleEntries.map((entry, index) => (
                  <AgentActivityStep
                    key={entry.id}
                    entry={entry}
                    hasFollowingStep={index < visibleEntries.length - 1}
                  />
                ))}
              </AnimatePresence>
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export { AgentActivity };
