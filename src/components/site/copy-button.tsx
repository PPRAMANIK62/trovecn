"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore, the text is selectable
    }
  }

  return (
    <Button
      type="button"
      variant="elevated"
      size="icon-xs"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      {copied ? <Check className="text-link" /> : <Copy />}
    </Button>
  );
}
