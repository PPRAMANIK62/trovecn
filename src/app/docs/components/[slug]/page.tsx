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

/** registryDependencies entries that resolve to a shared file on the
 * Installation page rather than another component's own docs page. */
const FOUNDATION_FILES: Record<string, string> = {
  utils: "lib/utils.ts",
  springs: "lib/springs.ts",
  "font-weight": "lib/font-weight.ts",
  "use-proximity-hover": "hooks/use-proximity-hover.ts",
};

const linkClassName = "font-medium text-link underline-offset-4 hover:underline";

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getComponent(slug);
  if (!item) notFound();

  const { previous, next } = getAdjacentComponents(slug);
  const registryDeps = item.registryDependencies ?? [];
  const foundationDeps = registryDeps.filter((d) => d in FOUNDATION_FILES);
  const componentDeps = registryDeps.filter((d) => !(d in FOUNDATION_FILES));

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

      <section className="mt-16">
        <h2 className="text-control font-medium text-foreground">Install</h2>
        <p className="mt-1.5 text-caption text-muted-foreground">
          Install the packages this component imports.
        </p>
        <CodeBlock
          code={`bun add ${item.dependencies.join(" ")}`}
          lang="bash"
          label="Terminal"
          className="mt-4"
        />
        {(foundationDeps.length > 0 || componentDeps.length > 0) && (
          <p className="mt-3 text-caption text-muted-foreground">
            Also requires{" "}
            {foundationDeps.map((d, i) => (
              <span key={d}>
                {i > 0 && ", "}
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-2xs text-foreground">
                  {FOUNDATION_FILES[d]}
                </code>
              </span>
            ))}
            {foundationDeps.length > 0 && (
              <>
                {" "}
                (see{" "}
                <Link href="/docs/installation" className={linkClassName}>
                  Installation
                </Link>
                )
              </>
            )}
            {foundationDeps.length > 0 && componentDeps.length > 0 && ", and "}
            {componentDeps.map((d, i) => {
              const dep = getComponent(d);
              return (
                <span key={d}>
                  {i > 0 && ", "}
                  {foundationDeps.length === 0 && "the "}
                  <Link href={`/docs/components/${d}`} className={linkClassName}>
                    {dep?.title ?? d}
                  </Link>{" "}
                  primitive
                </span>
              );
            })}
            .
          </p>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-control font-medium text-foreground">Source</h2>
        <p className="mt-1.5 text-caption text-muted-foreground">
          Copy and paste the following code into your project.
        </p>
        <CodeBlock
          code={readSource(item.file)}
          label={item.file.split("/").pop()}
          className="mt-4"
        />
      </section>

      <div className="mt-16 flex flex-col gap-10">
        {item.api.map((section) => (
          <section key={section.component}>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <h2 className="text-label uppercase text-muted-foreground">API Reference</h2>
              <div className="flex flex-wrap gap-1.5">
                {section.component.split(" / ").map((name) => (
                  <code
                    key={name}
                    className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-caption text-foreground"
                  >
                    {name}
                  </code>
                ))}
              </div>
            </div>
            <ApiTable rows={section.props} className="mt-3" />
          </section>
        ))}
      </div>
    </article>
  );
}
