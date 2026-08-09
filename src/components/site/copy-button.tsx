"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";

interface CopyButtonProps {
  text: string;
  className?: string;
}

/** Floats over the code stage's top-right corner — same elevated/shadow-bevel
 *  physicality as the rest of the control set, just icon-only since it sits
 *  on top of content rather than in a footer row. */
export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore, the text is selectable
    }
  }

  return (
    <Button
      type="button"
      variant="elevated"
      size="icon-sm"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      // elevated's dark:bg-input/30 (and dark:hover:bg-input/50) is meant for
      // chrome sitting on plain background — translucent enough here to let
      // the code text underneath show through. Force it fully opaque, same
      // fix as CodeScroll's expand/collapse control.
      className={cn(
        "bg-card text-muted-foreground hover:bg-card hover:text-foreground dark:bg-card dark:hover:bg-card",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          className="inline-flex"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: spring.quick.exit }}
          transition={spring.quick.enter}
        >
          {copied ? <Check className="text-success" /> : <Copy />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
