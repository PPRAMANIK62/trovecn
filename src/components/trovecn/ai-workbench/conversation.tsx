"use client";

import type { ReactNode } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  RotateCcwIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type ConversationMessageRole = "user" | "assistant";
export type ConversationMessageStatus = "streaming" | "complete" | "stopped" | "error";

export interface ConversationSource {
  id: string;
  label: string;
  href?: string;
}

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  /** Rendered content keeps markdown and code rendering in the consuming product. */
  content: ReactNode;
  status?: ConversationMessageStatus;
  label?: string;
  timestamp?: ReactNode;
  sources?: readonly ConversationSource[];
  branch?: { index: number; count: number };
  error?: { message: string };
}

export interface ConversationProps {
  messages: readonly ConversationMessage[];
  /** The message whose copy action should temporarily show confirmed state. */
  copiedMessageId?: string;
  onCopy?: (message: ConversationMessage) => void;
  onRetry?: (message: ConversationMessage) => void;
  onSourceSelect?: (source: ConversationSource, message: ConversationMessage) => void;
  onBranchChange?: (message: ConversationMessage, index: number) => void;
  /** Replaces an entire row when a product needs a specialised message treatment. */
  renderMessage?: (message: ConversationMessage) => ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

function getStatusLabel(message: ConversationMessage) {
  if (message.status === "streaming") return "Generating";
  if (message.status === "stopped") return "Stopped";
  if (message.status === "error") return message.error?.message ?? "Couldn’t complete response";
  return message.timestamp;
}

function Conversation({
  messages,
  copiedMessageId,
  onCopy,
  onRetry,
  onSourceSelect,
  onBranchChange,
  renderMessage,
  emptyState,
  className,
}: ConversationProps) {
  const reduceMotion = useReducedMotion();
  const activeMessage = messages.findLast((message) => message.status === "streaming");

  if (messages.length === 0) {
    return emptyState ? (
      <div data-slot="conversation" className={className}>
        {emptyState}
      </div>
    ) : null;
  }

  return (
    <section data-slot="conversation" aria-label="Conversation" className={cn("w-full", className)}>
      <span role="status" aria-live="polite" className="sr-only">
        {activeMessage
          ? "Response generating."
          : messages.some((message) => message.status === "error")
            ? "A response could not be completed."
            : "Conversation updated."}
      </span>
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) =>
            renderMessage ? (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: reduceMotion ? 0 : -4,
                  transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
                }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              >
                {renderMessage(message)}
              </motion.div>
            ) : (
              <MessageRow
                key={message.id}
                message={message}
                reduceMotion={reduceMotion}
                copied={message.id === copiedMessageId}
                onCopy={onCopy}
                onRetry={onRetry}
                onSourceSelect={onSourceSelect}
                onBranchChange={onBranchChange}
              />
            ),
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

interface MessageRowProps {
  message: ConversationMessage;
  reduceMotion: boolean | null;
  copied: boolean;
  onCopy?: ConversationProps["onCopy"];
  onRetry?: ConversationProps["onRetry"];
  onSourceSelect?: ConversationProps["onSourceSelect"];
  onBranchChange?: ConversationProps["onBranchChange"];
}

function MessageRow({
  message,
  reduceMotion,
  copied,
  onCopy,
  onRetry,
  onSourceSelect,
  onBranchChange,
}: MessageRowProps) {
  const isAssistant = message.role === "assistant";
  const status = getStatusLabel(message);
  const canRetry = message.status === "error" || message.status === "stopped";
  const branch = message.branch;

  return (
    <motion.article
      data-slot="conversation-message"
      data-role={message.role}
      aria-label={
        isAssistant ? (message.label ?? "Assistant response") : (message.label ?? "Your message")
      }
      initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: reduceMotion ? 0 : -4,
        transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
      }}
      transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
      className={cn(
        "group/message min-w-0",
        isAssistant ? "max-w-3xl" : "ml-auto max-w-[min(88%,42rem)]",
      )}
    >
      {isAssistant ? (
        <div className="mb-2 flex items-center gap-2 text-meta text-muted-foreground">
          <span className="font-mono">{message.label ?? "Assistant"}</span>
          {status ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{status}</span>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 text-body leading-6 text-foreground",
          isAssistant
            ? "[&_a]:text-link [&_a]:underline-offset-4 hover:[&_a]:underline"
            : "rounded-xl bg-muted px-3.5 py-2.5 text-caption leading-5",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={branch?.index ?? "message"}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: reduceMotion ? 0 : -4,
              transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
            }}
            transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
          >
            {message.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {isAssistant ? (
        <div className="mt-2 flex min-h-6 items-center gap-1 text-meta text-muted-foreground opacity-100 transition-opacity duration-quick sm:opacity-0 sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100">
          {onCopy ? (
            <Button
              type="button"
              variant="ghost"
              size="2xs"
              onClick={() => onCopy(message)}
              aria-label="Copy assistant response"
            >
              {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied" : "Copy"}
            </Button>
          ) : null}
          {canRetry && onRetry ? (
            <Button type="button" variant="ghost" size="2xs" onClick={() => onRetry(message)}>
              <RotateCcwIcon /> Retry
            </Button>
          ) : null}
          {message.sources?.map((source) =>
            source.href ? (
              <Button
                key={source.id}
                render={<a href={source.href} aria-label={source.label} />}
                nativeButton={false}
                variant="ghost"
                size="2xs"
                onClick={() => onSourceSelect?.(source, message)}
              >
                {source.label}
              </Button>
            ) : (
              <Button
                key={source.id}
                type="button"
                variant="ghost"
                size="2xs"
                onClick={() => onSourceSelect?.(source, message)}
                disabled={!onSourceSelect}
              >
                {source.label}
              </Button>
            ),
          )}
          {branch && branch.count > 1 ? (
            <div className="ml-auto flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={branch.index === 0}
                onClick={() => onBranchChange?.(message, branch.index - 1)}
                aria-label="Previous response"
              >
                <ChevronLeftIcon />
              </Button>
              <span
                className="min-w-9 text-center font-mono text-micro tabular-nums"
                aria-label={`Response ${branch.index + 1} of ${branch.count}`}
              >
                {branch.index + 1} / {branch.count}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={branch.index === branch.count - 1}
                onClick={() => onBranchChange?.(message, branch.index + 1)}
                aria-label="Next response"
              >
                <ChevronRightIcon />
              </Button>
            </div>
          ) : null}
          {message.status === "complete" ? (
            <CheckIcon className="ml-auto size-3 text-success" aria-label="Response complete" />
          ) : null}
        </div>
      ) : null}
    </motion.article>
  );
}

export { Conversation };
