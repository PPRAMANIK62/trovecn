import { cn } from "@/lib/utils";
import type { PropRow } from "@/lib/components-registry";

interface ApiTableProps {
  rows: PropRow[];
  className?: string;
}

/**
 * API reference table — a real <table>, but laid out as paired columns
 * (name + default on the left, type stacked over description on the right)
 * rather than four flat Prop/Type/Default/Description columns. No accent
 * color on the type line: the site is zero-chroma (see --link in
 * globals.css), so the hierarchy comes from font/weight, not hue.
 */
export function ApiTable({ rows, className }: ApiTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-xl bg-background shadow-card", className)}>
      <table className="w-full border-collapse text-left text-caption">
        <tbody>
          {rows.map((row, i) => (
            // Index, not row.prop: a section documenting several bundled
            // sub-components (e.g. Select's "SelectTrigger / SelectValue /
            // SelectIcon") can legitimately list the same prop name twice —
            // once per component — so the prop name alone isn't unique.
            <tr key={i} className={i < rows.length - 1 ? "border-b border-border" : ""}>
              <td className="w-36 px-5 py-5 align-top">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="font-mono text-control text-foreground">{row.prop}</span>
                  {row.default !== undefined && row.default !== "—" && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-micro text-muted-foreground">
                      {row.default}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-5 align-top">
                <p className="font-mono text-foreground">{row.type}</p>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">{row.description}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
