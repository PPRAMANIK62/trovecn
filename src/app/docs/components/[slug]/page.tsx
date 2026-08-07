import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  getAdjacentComponents,
  getCatalogNumber,
  getComponent,
  registry,
} from "@/lib/components-registry";
import { ApiTable } from "@/components/site/api-table";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentPreview } from "@/components/site/component-preview";
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
  return { title: `${item.title} — trove/cn`, description: item.description };
}

// Every param is enumerated by generateStaticParams above, so this file read
// only ever runs at build time against known repo-relative paths — never
// against user input. The ignore comment stops Next's file tracer from
// conservatively bundling the entire project into this route's output.
function readSource(path: string): string {
  return readFileSync(join(/* turbopackIgnore: true */ process.cwd(), path), "utf-8").trim();
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getComponent(slug);
  if (!item) notFound();

  const { previous, next } = getAdjacentComponents(slug);

  return (
    <article className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-2xs font-medium text-link">
            {item.category} · {getCatalogNumber(item.slug)}
          </p>
          <h1 className="mt-3 text-title text-foreground">{item.title}</h1>
        </div>
        {(previous || next) && (
          <div className="mt-1 flex shrink-0 items-center gap-1">
            {previous ? (
              <Link
                href={`/docs/components/${previous.slug}`}
                aria-label={`Previous: ${previous.title}`}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
              </Link>
            ) : (
              <span className="flex size-7 items-center justify-center text-muted-foreground/30">
                <ArrowLeft className="size-4" />
              </span>
            )}
            {next ? (
              <Link
                href={`/docs/components/${next.slug}`}
                aria-label={`Next: ${next.title}`}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="flex size-7 items-center justify-center text-muted-foreground/30">
                <ArrowRight className="size-4" />
              </span>
            )}
          </div>
        )}
      </div>
      <p className="mt-2.5 max-w-xl text-body leading-relaxed text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {item.examples.map((example) => {
          const Demo = example.Demo;
          const source = readSource(example.file);
          const label =
            example.file
              .split("/")
              .pop()
              ?.replace(/\.tsx$/, "") ?? example.title;
          return (
            <section key={example.title}>
              <h2 className="text-control font-medium text-foreground">{example.title}</h2>
              <p className="mt-1.5 text-caption text-muted-foreground">{example.description}</p>

              <Tabs defaultValue="preview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <ComponentPreview label={label}>
                    <Demo />
                  </ComponentPreview>
                </TabsContent>
                <TabsContent value="code">
                  <CodeBlock code={source} label={label} />
                </TabsContent>
              </Tabs>
            </section>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col gap-10">
        {item.api.map((section) => (
          <section key={section.component}>
            <h2 className="text-label uppercase text-muted-foreground">
              API Reference — {section.component}
            </h2>
            <ApiTable rows={section.props} className="mt-3" />
          </section>
        ))}
      </div>
    </article>
  );
}
