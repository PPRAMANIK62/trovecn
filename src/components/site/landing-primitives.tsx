import Link from "next/link";

import { getComponentsByCategory } from "@/lib/components-registry";

/**
 * Section 03. The primitives, as one line of text.
 *
 * They used to be the entire grid. docs/what-to-build.md deprioritises
 * leading with primitives a trusted library already owns, but they are real,
 * installed, and carry the same motion as everything else — so hiding them
 * would be the opposite mistake. A sentence names all of them and links each
 * one, which is proportionate to what they are: the floor this is built on,
 * not the argument for it.
 *
 * Count comes from the registry rather than a literal, so adding a primitive
 * cannot leave a stale number on the front page.
 */
export function LandingPrimitives() {
  const primitives =
    getComponentsByCategory().find((group) => group.category === "Primitives")?.items ?? [];

  if (primitives.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 md:flex-row md:items-baseline md:gap-10 md:px-8">
        <p className="shrink-0 font-mono text-label uppercase text-muted-foreground">
          03 — Underneath
        </p>
        <p className="max-w-3xl text-caption leading-relaxed text-muted-foreground">
          Built on {primitives.length} primitives carrying the same motion —{" "}
          {primitives.map((item, i) => (
            <span key={item.slug}>
              <Link
                href={`/docs/components/${item.slug}`}
                className="text-foreground underline-offset-4 transition-colors duration-fast hover:underline"
              >
                {item.title}
              </Link>
              {i < primitives.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
