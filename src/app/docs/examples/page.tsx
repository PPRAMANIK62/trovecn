import type { Metadata } from "next";
import Link from "next/link";

import { examples } from "@/lib/examples-registry";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Examples — trove/cn",
};

export default function ExamplesIndexPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-label uppercase text-link">Examples</p>
      <h1 className="mt-3 text-title text-foreground">Composed workflows</h1>

      {examples.length === 0 ? (
        <p className="mt-3.5 text-body text-muted-foreground">No examples yet — check back soon.</p>
      ) : (
        <>
          <p className="mt-3.5 max-w-xl text-lede leading-relaxed text-muted-foreground">
            {examples.length} recipe{examples.length === 1 ? "" : "s"} showing components working
            together in one screen, not in isolation.
          </p>
          <ul className="mt-10 flex flex-col gap-6">
            {examples.map((example) => (
              <li key={example.slug}>
                <Button
                  variant="link"
                  render={<Link href={`/docs/examples/${example.slug}`} />}
                  nativeButton={false}
                  className="h-auto justify-start rounded-none border-none p-0 text-control font-medium text-foreground no-underline hover:text-link"
                >
                  {example.title}
                </Button>
                <p className="mt-1 max-w-xl text-caption text-muted-foreground">
                  {example.description}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
