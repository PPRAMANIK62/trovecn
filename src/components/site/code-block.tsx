import { highlightTsx } from "@/lib/highlight";
import { CopyButton } from "@/components/site/copy-button";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export async function CodeBlock({ code, className }: CodeBlockProps) {
  const html = await highlightTsx(code);

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border bg-card ${className ?? ""}`}
    >
      <CopyButton
        text={code}
        className="absolute top-2 right-2 z-10 border border-border bg-card opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div
        className={[
          "max-h-[36rem] overflow-auto text-caption [&_pre]:p-4 [&_pre]:leading-6",
          // Long lines (Tailwind class strings especially) routinely need
          // horizontal scroll, but the OS's thin auto-hiding overlay
          // scrollbar gives no visible cue that more content exists off to
          // either side — a reader can land mid-scroll and see truncated
          // text on both edges with nothing indicating why. Always-visible,
          // themed scrollbars make the affordance obvious.
          // `--border` is a near-white hairline token — invisible as a
          // scrollbar thumb in light mode. `--muted-foreground` at partial
          // opacity has real contrast in both themes.
          "[scrollbar-color:color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_transparent] [scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
