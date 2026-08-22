"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  ClockIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  ListPlusIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion, Reorder, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

export interface PromptComposerSubmitEvent {
  prompt: string;
}

export interface PromptComposerAttachmentOption {
  id: string;
  label: string;
  description?: string;
  kind?: "file" | "image" | "folder";
}

export type PromptComposerFileKind = "image" | "file";

export interface PromptComposerFile {
  id: string;
  name: string;
  kind?: PromptComposerFileKind;
  /** Object URL or remote URL rendered inside the preview tile for image files. */
  previewUrl?: string;
}

export interface PromptComposerQueuedMessage {
  id: string;
  prompt: string;
}

export interface PromptComposerProps {
  /** Controlled draft text. */
  value?: string;
  /** Initial draft text when the component is uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (event: PromptComposerSubmitEvent) => void;
  /** Called while a response is being generated. */
  onStop?: () => void;
  /** Replaces Send with Stop and prevents edits until the response ends. */
  isRunning?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Limits the number of characters in the draft. */
  maxLength?: number;
  /** Optional model choices, rendered as a compact footer menu. */
  models?: readonly string[];
  model?: string;
  onModelChange?: (model: string) => void;
  /** Choices opened by the attachment menu above the composer. */
  attachmentOptions?: readonly PromptComposerAttachmentOption[];
  onAttachmentOptionSelect?: (option: PromptComposerAttachmentOption) => void;
  /** Attachments for the current draft, shown as preview tiles above the textarea. */
  files?: readonly PromptComposerFile[];
  onFilesChange?: (files: readonly PromptComposerFile[]) => void;
  /** Side length, in pixels, of each file preview tile. */
  filePreviewSize?: number;
  /**
   * Messages waiting to send while a response is running. Providing this
   * (with `onQueueChange`) lets the draft stay open and Send become Queue
   * mid-response, instead of locking the composer until it finishes.
   */
  queue?: readonly PromptComposerQueuedMessage[];
  onQueueChange?: (queue: readonly PromptComposerQueuedMessage[]) => void;
  className?: string;
}

/**
 * The minimal prompt surface shared by chat, generation, and agent products.
 * Attachments, model choice, and queueing are optional, controlled enhancements.
 */
function PromptComposer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  isRunning = false,
  disabled = false,
  placeholder = "Ask anything...",
  maxLength,
  models = [],
  model,
  onModelChange,
  attachmentOptions = [],
  onAttachmentOptionSelect,
  files = [],
  onFilesChange,
  filePreviewSize = 64,
  queue = [],
  onQueueChange,
  className,
}: PromptComposerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaId = useId();
  const statusId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const prompt = value ?? uncontrolledValue;
  const canQueue = isRunning && Boolean(onQueueChange);
  const canSubmit = prompt.trim().length > 0 && !disabled && !isSending && (!isRunning || canQueue);
  const showQueueAction = canQueue && prompt.trim().length > 0;
  const showStop = isRunning && !showQueueAction;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [prompt]);

  function setPrompt(nextValue: string) {
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }

  function submit() {
    if (!canSubmit) return;
    setIsSending(true);
    if (canQueue) {
      onQueueChange?.([...queue, { id: crypto.randomUUID(), prompt: prompt.trim() }]);
      return;
    }
    onSubmit?.({ prompt: prompt.trim() });
  }

  function completeSendAnimation() {
    if (!isSending) return;
    setPrompt("");
    setIsSending(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    submit();
  }

  function removeFile(id: string) {
    onFilesChange?.(files.filter((file) => file.id !== id));
  }

  function removeQueuedMessage(id: string) {
    onQueueChange?.(queue.filter((item) => item.id !== id));
  }

  function editQueuedMessage(id: string) {
    const target = queue.find((item) => item.id === id);
    if (!target) return;
    setPrompt(target.prompt);
    onQueueChange?.(queue.filter((item) => item.id !== id));
    textareaRef.current?.focus();
  }

  function moveQueuedMessage(id: string, direction: -1 | 1) {
    const index = queue.findIndex((item) => item.id === id);
    if (index === -1) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= queue.length) return;
    const next = [...queue];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onQueueChange?.(next);
  }

  return (
    <form
      data-slot="prompt-composer"
      className={cn(
        "w-full rounded-[20px] border border-border bg-card p-2 shadow-[0_18px_40px_-32px_color-mix(in_oklab,var(--foreground)_70%,transparent)] transition-[border-color,box-shadow] duration-quick focus-within:border-ring/70 focus-within:ring-1 focus-within:ring-ring/25 dark:bg-card/80",
        className,
      )}
      onSubmit={handleSubmit}
    >
      <span id={statusId} role="status" aria-live="polite" className="sr-only">
        {isRunning ? "Generating response. Stop is available." : "Ready to send prompt."}
      </span>

      {queue.length > 0 ? (
        <Reorder.Group
          as="ul"
          axis="y"
          values={[...queue]}
          onReorder={(next) => onQueueChange?.(next)}
          className="flex flex-col gap-1 px-1 pt-1"
        >
          {queue.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              tabIndex={0}
              onKeyDown={(event) => {
                if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) {
                  return;
                }
                event.preventDefault();
                moveQueuedMessage(item.id, event.key === "ArrowUp" ? -1 : 1);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-body text-muted-foreground"
            >
              <ClockIcon className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <button
                type="button"
                onDoubleClick={() => editQueuedMessage(item.id)}
                title="Double-click to edit"
                className="min-w-0 flex-1 truncate text-left"
              >
                {item.prompt}
              </button>
              <button
                type="button"
                onClick={() => removeQueuedMessage(item.id)}
                aria-label="Remove queued message"
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-2 px-1 pt-2">
          <AnimatePresence initial={false}>
            {files.map((file) => (
              <motion.li
                key={file.id}
                layout
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
                className="group/file relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                style={{ width: filePreviewSize, height: filePreviewSize }}
              >
                {file.kind === "image" && file.previewUrl ? (
                  // oxlint-disable-next-line next/no-img-element
                  <img src={file.previewUrl} alt={file.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-1 px-1.5 text-center">
                    {file.kind === "image" ? (
                      <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <FileIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className="line-clamp-2 text-[0.6rem] leading-tight break-all text-muted-foreground">
                      {file.name}
                    </span>
                  </div>
                )}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove ${file.name}`}
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity duration-quick group-hover/file:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <XIcon className="size-3" />
                  </button>
                ) : null}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}

      <label htmlFor={textareaId} className="sr-only">
        Prompt
      </label>
      <motion.div
        initial={false}
        animate={isSending ? { opacity: 0, y: reduceMotion ? 0 : -8 } : { opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : isSending ? spring.quick.exit : spring.quick.enter
        }
        onAnimationComplete={completeSendAnimation}
      >
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={prompt}
          disabled={disabled || isSending || (isRunning && !onQueueChange)}
          aria-describedby={statusId}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={1}
          className="block max-h-40 w-full resize-none overflow-y-auto bg-transparent p-2 text-lede leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </motion.div>

      <div className="flex min-h-9 items-center gap-1 px-0 pt-1.5">
        {attachmentOptions.length > 0 ? (
          <Menu onOpenChange={setIsAttachmentMenuOpen}>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled || showStop}
                  aria-label="Add an attachment"
                  title="Add an attachment"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                />
              }
            >
              <motion.span
                className="flex"
                animate={{ rotate: isAttachmentMenuOpen ? 45 : 0 }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              >
                <PlusIcon className="size-4" />
              </motion.span>
            </MenuTrigger>
            <MenuContent align="start" side="top" sideOffset={8} className="w-60">
              {attachmentOptions.map((option) => (
                <MenuItem key={option.id} onClick={() => onAttachmentOptionSelect?.(option)}>
                  {option.kind === "image" ? <ImageIcon /> : <FileTextIcon />}
                  <span className="flex min-w-0 flex-col">
                    <span>{option.label}</span>
                    {option.description ? (
                      <span className="text-minor leading-4 text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        ) : null}
        <span className="flex-1" />
        {models.length > 0 ? (
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || showStop}
                  className="text-body text-muted-foreground hover:text-foreground"
                />
              }
            >
              <span className="max-w-28 truncate">{model ?? models[0]}</span>
              <ChevronDownIcon className="size-4 opacity-50" />
            </MenuTrigger>
            <MenuContent align="end" side="top" sideOffset={8} className="w-52">
              <MenuRadioGroup value={model ?? models[0]} onValueChange={onModelChange}>
                {models.map((option) => (
                  <MenuRadioItem
                    key={option}
                    value={option}
                    indicator="check"
                    className="data-checked:bg-active data-checked:text-foreground"
                  >
                    {option}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuContent>
          </Menu>
        ) : null}
        {showStop ? (
          <Button
            type="button"
            size="icon-sm"
            onClick={onStop}
            disabled={disabled}
            aria-label="Stop generating"
            title="Stop generating"
            className="rounded-full"
          >
            <SquareIcon className="size-3 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon-sm"
            disabled={!canSubmit}
            aria-label={showQueueAction ? "Queue prompt" : "Send prompt"}
            title={
              showQueueAction ? "Send once the current response finishes" : "Send prompt (Enter)"
            }
            className="rounded-full"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={showQueueAction ? "queue" : "send"}
                className="flex"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              >
                {showQueueAction ? (
                  <ListPlusIcon className="size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        )}
      </div>
    </form>
  );
}

export { PromptComposer };
