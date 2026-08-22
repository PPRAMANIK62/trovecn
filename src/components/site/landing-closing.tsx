import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The page opens on what these components do and closes on why anyone should
 * care, handing off to the manifesto that argues it at length. The line is
 * /docs's own opening, quoted deliberately — the landing page and the
 * introduction should sound like the same voice, and until now they did not.
 */
export function LandingClosing() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
      <h2 className="max-w-lg text-title text-foreground">
        Nobody tells you an interface feels cheap. They just leave.
      </h2>
      <Link
        href="/docs"
        className="mt-5 inline-flex items-center gap-1.5 text-caption font-medium text-link underline-offset-4 hover:underline"
      >
        Read why that happens
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
