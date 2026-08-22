import Link from "next/link";

import { GithubIcon } from "@/components/site/github-icon";
import { GITHUB_URL, X_URL } from "@/lib/site-config";

/**
 * Landing-page footer. The page used to stop on the closing link with 64px
 * of padding and nothing under it, which left the bottom unanchored — the
 * gap a fixed bottom fade was proposed for. A fade is the wrong tool here:
 * ScrollFade exists for the docs shell's clipped panes (see
 * scroll-fade.tsx), and painting one over a normal document scroll washes
 * out the closing line at the exact point there is nothing more to reveal,
 * while a `via-background/70` band crossing this layout's 1px section rules
 * visibly dissolves them. A real terminus fixes the problem the fade was
 * reaching for.
 *
 * Not used by /docs — that shell is a fixed three-pane layout whose panes
 * scroll independently, so it has no document end to anchor.
 *
 * Same grammar as every section above it: hairline top rule, contained to
 * the shared column, `md:px-8` so the wordmark lands on the same left edge
 * as "01 — The difference" and every grid cell.
 */

const DOCS = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/examples", label: "Examples" },
];

const linkClass =
  "text-caption text-muted-foreground underline-offset-4 transition-colors duration-fast hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-xs flex-col gap-2.5">
            {/* Wordmark exactly as design-system.md fixes it: `trove` in
                font-sans and --foreground, `/cn` in font-mono and
                --muted-foreground. */}
            <Link href="/" className="text-caption font-semibold tracking-tight text-foreground">
              trove<span className="font-mono font-normal text-muted-foreground">/cn</span>
            </Link>
            <p className="text-caption leading-relaxed text-muted-foreground">
              Interface components that keep listening after you press. Copy the source, own it.
            </p>
          </div>

          <div className="flex gap-16 sm:gap-20">
            <nav className="flex flex-col gap-3">
              <p className="font-mono text-label uppercase text-muted-foreground">Docs</p>
              {DOCS.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-col gap-3">
              <p className="font-mono text-label uppercase text-muted-foreground">Project</p>
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className={`${linkClass} inline-flex items-center gap-1.5`}
              >
                <GithubIcon className="size-3.5" />
                GitHub
              </Link>
              <Link href={X_URL} target="_blank" rel="noreferrer" className={linkClass}>
                @ppramanik62
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="font-mono text-meta text-muted-foreground">trovecn.dev</p>
        </div>
      </div>
    </footer>
  );
}
