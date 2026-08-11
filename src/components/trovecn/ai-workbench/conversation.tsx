"use client";

import { useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon, PencilIcon, RotateCcwIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type ConversationMessageRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  /** Consumer-rendered text, markdown, or other inline response content. */
  content: ReactNode;
  /** Rendered below a user message; assistant messages intentionally omit it. */
  timestamp?: ReactNode;
}

export interface ConversationProps {
  messages: readonly ConversationMessage[];
  onCopy?: (message: ConversationMessage) => void;
  onEdit?: (message: ConversationMessage) => void;
  onRegenerate?: (message: ConversationMessage) => void;
  emptyState?: ReactNode;
  className?: string;
}

/**
 * A quiet conversation reading surface. It establishes authored hierarchy and
 * contextual actions, leaving transport, markdown, and product state outside.
 */
function Conversation({
  messages,
  onCopy,
  onEdit,
  onRegenerate,
  emptyState,
  className,
}: ConversationProps) {
  const reduceMotion = useReducedMotion();
  const [copiedMessageId, setCopiedMessageId] = useState<string>();

  async function handleCopy(message: ConversationMessage) {
    let copied = false;

    if (typeof message.content === "string" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(message.content);
        copied = true;
      } catch {
        // A consumer callback can provide a fallback for restricted clipboard contexts.
      }
    }

    onCopy?.(message);
    if (!copied && !onCopy) return;

    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId(undefined), 1_600);
  }

  if (messages.length === 0) {
    return emptyState ? (
      <div data-slot="conversation" className={className}>
        {emptyState}
      </div>
    ) : null;
  }

  return (
    <section data-slot="conversation" aria-label="Conversation" className={cn("w-full", className)}>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.article
              key={message.id}
              data-slot="conversation-message"
              data-role={message.role}
              aria-label={message.role === "user" ? "Your message" : "Conversation response"}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: reduceMotion ? 0 : -4,
                transition: reduceMotion ? { duration: 0 } : spring.quick.exit,
              }}
              transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              className={cn(
                "group/message flex min-w-0 flex-col",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[min(88%,32rem)] min-w-0 text-lede leading-7 text-foreground",
                  message.role === "user" ? "rounded-2xl bg-muted px-3.5 py-2.5" : "py-2.5",
                )}
              >
                {message.content}
              </div>

              <div
                className={cn(
                  "flex min-h-6 items-center gap-1 opacity-100 transition-opacity duration-quick sm:opacity-0 sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100",
                  message.role === "user" && "mt-1.5",
                )}
              >
                {message.role === "user" && message.timestamp ? (
                  <span className="mr-1 text-caption text-muted-foreground">
                    {message.timestamp}
                  </span>
                ) : null}
                {typeof message.content === "string" || onCopy ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    onClick={() => void handleCopy(message)}
                    aria-label={message.role === "user" ? "Copy your message" : "Copy response"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={copiedMessageId === message.id ? "copied" : "copy"}
                        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.8 }}
                        transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
                      >
                        {copiedMessageId === message.id ? <CheckIcon /> : <CopyIcon />}
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                ) : null}
                {message.role === "user" && onEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    onClick={() => onEdit(message)}
                    aria-label="Edit your message"
                  >
                    <PencilIcon />
                  </Button>
                ) : null}
                {message.role === "assistant" && onRegenerate ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    onClick={() => onRegenerate(message)}
                    aria-label="Regenerate response"
                  >
                    <RotateCcwIcon />
                  </Button>
                ) : null}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

export { Conversation };
