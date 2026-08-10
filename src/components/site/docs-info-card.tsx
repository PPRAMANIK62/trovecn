import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { GithubIcon } from "@/components/site/github-icon";
import { AVATAR_URL, GITHUB_URL, X_URL } from "@/lib/site-config";

function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(count);
}

/**
 * Docs shell's right-rail card (see docs/design-system.md "Shell
 * architecture" and "Right-rail info card"): a GitHub link with a live star
 * count, plus a creator credit. Not a persistent nav surface like
 * DocsSidebar — a single floating card near the top of its own column.
 */
export function DocsInfoCard({ starCount }: { starCount: number | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <Link
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-control font-medium text-foreground transition-colors duration-fast hover:bg-accent"
      >
        <span className="flex items-center gap-2">
          <GithubIcon className="size-4" />
          GitHub
        </span>
        {starCount !== null && (
          <span className="flex items-center gap-1 font-mono text-2xs text-muted-foreground">
            <Star className="size-3" />
            {formatStars(starCount)}
          </span>
        )}
      </Link>
      <div className="mt-3 flex items-center gap-1.5 border-t border-border px-2 pt-3 text-caption text-muted-foreground">
        <Image
          src={AVATAR_URL}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0 rounded-full"
        />
        <span>Created by</span>
        <Link
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground transition-colors duration-fast hover:text-link"
        >
          @ppramanik62
        </Link>
      </div>
    </div>
  );
}
