import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCatalogNumber, getComponent, registry } from "@/lib/components-registry";
import { CodeBlock } from "@/components/site/code-block";
import { CopyButton } from "@/components/site/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getComponent(slug);
  if (!item) return {};
  return { title: `${item.title} — Trovecn`, description: item.description };
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getComponent(slug);
  if (!item) notFound();

  // Every param is enumerated by generateStaticParams above, so this file
  // read only ever runs at build time against known repo-relative paths —
  // never against user input. The ignore comment stops Next's file tracer
  // from conservatively bundling the entire project into this route's
  // output (see the tracing warning this used to produce during `next build`).
  const source = readFileSync(
    join(/* turbopackIgnore: true */ process.cwd(), item.file),
    "utf-8",
  ).trim();
  const installCommand = `npx shadcn add https://trovecn.dev/r/${item.slug}.json`;
  const Demo = item.Demo;

  return (
    <article className="max-w-3xl">
      <p className="font-mono text-sm font-medium text-link">
        {item.category} · {getCatalogNumber(item.slug)}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{item.title}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{item.description}</p>
      <p className="mt-2 font-mono text-xs text-muted-foreground/80">Observed — {item.source}</p>

      <Tabs defaultValue="preview" className="mt-8">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          {/* `bg-canvas` recesses the stage one step below `--background`,
              the same relationship `AppFrame` uses between its gutter and
              `Panel` (docs/design-system.md "Surfaces must visibly step").
              Demo content sitting directly on it (bg-card / bg-popover
              surfaces) reads as elevated by contrast alone, instead of two
              identically-toned bordered boxes nesting into one flat shape. */}
          <div className="flex min-h-96 items-center justify-center overflow-hidden rounded-xl border border-border bg-canvas p-8 sm:p-12">
            <div className="w-full">
              <Demo />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="code">
          <CodeBlock code={source} />
        </TabsContent>
      </Tabs>

      <h2 className="mt-10 text-sm font-semibold text-foreground">Installation</h2>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-card py-2 pr-2 pl-4">
        <code className="overflow-x-auto font-mono text-sm text-foreground">{installCommand}</code>
        <CopyButton text={installCommand} />
      </div>

      {item.dependencies.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Depends on{" "}
          {item.dependencies.map((dep, i) => (
            <span key={dep}>
              <code className="font-mono text-foreground">{dep}</code>
              {i < item.dependencies.length - 1 ? ", " : ""}
            </span>
          ))}
          .
        </p>
      )}
    </article>
  );
}
