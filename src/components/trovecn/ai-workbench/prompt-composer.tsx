"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  ImageIcon,
  PlusIcon,
  SquareIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
  className?: string;
}

/**
 * The minimal prompt surface shared by chat, generation, and agent products.
 * Attachments and model choice are optional, controlled enhancements.
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
  const canSubmit = prompt.trim().length > 0 && !disabled && !isRunning && !isSending;

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
          disabled={disabled || isRunning || isSending}
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
                  disabled={disabled || isRunning}
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
                  disabled={disabled || isRunning}
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
        {isRunning ? (
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
            aria-label="Send prompt"
            title="Send prompt (Enter)"
            className="rounded-full"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

export { PromptComposer };
