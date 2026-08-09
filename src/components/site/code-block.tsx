import { cn } from "@/lib/utils";
import { highlightCode } from "@/lib/highlight";
import { CopyButton } from "@/components/site/copy-button";
import { CodeScroll } from "@/components/site/code-scroll";

interface CodeBlockProps {
  code: string;
  /** Shown in the footer's meta label, e.g. an example's file basename ("standalone"). */
  label?: string;
  /** Syntax to highlight as — "bash" for install commands, "tsx" (default) for everything else. */
  lang?: "tsx" | "bash";
  className?: string;
}

/**
 * Same two-layer chrome as ComponentPreview (src/components/site/component-preview.tsx):
 * a lifted shadow-card frame around a recessed shadow-well stage, plus a
 * matching meta footer. Preview and Code are two tabs over the same card, so
 * they carry the same physicality — switching tabs shouldn't read as
 * dropping onto a flatter, bordered box.
 */
export async function CodeBlock({ code, label, lang = "tsx", className }: CodeBlockProps) {
  const html = await highlightCode(code, lang);
  const lineCount = code.split("\n").length;

  return (
    <div className={cn("rounded-xl bg-card p-[5px] shadow-card", className)}>
      <div className="group relative overflow-hidden rounded-lg bg-background shadow-well">
        <CopyButton
          text={code}
          className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <CodeScroll html={html} lineCount={lineCount} />
      </div>
      {label && (
        <div className="flex h-9 items-center px-2.5">
          <span className="font-mono text-meta text-muted-foreground">{label}</span>
        </div>
      )}
    </div>
  );
}
