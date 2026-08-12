import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { examples, getExample } from "@/lib/examples-registry";
import { getComponent } from "@/lib/components-registry";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentPreview } from "@/components/site/component-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return examples.map((example) => ({ slug: example.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const example = getExample(slug);
  if (!example) return {};
  return { title: `${example.title} — trove/cn`, description: example.description };
}

// Every param is enumerated by generateStaticParams above, so this file read
// only ever runs at build time against known repo-relative paths — never
// against user input. The ignore comment stops Next's file tracer from
// conservatively bundling the entire project into this route's output.
function readSource(path: string): string {
  return readFileSync(join(/* turbopackIgnore: true */ process.cwd(), path), "utf-8").trim();
}

const linkClassName = "font-medium text-link underline-offset-4 hover:underline";

export default async function ExamplePage({ params }: PageProps) {
  const { slug } = await params;
  const example = getExample(slug);
  if (!example) notFound();

  const Demo = example.Demo;
  const source = readSource(example.file);
  const composedComponents = example.composes
    .map((composedSlug) => getComponent(composedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="max-w-2xl">
      <p className="font-mono text-2xs font-medium text-link">Examples</p>
      <h1 className="mt-3 text-title text-foreground">{example.title}</h1>
      <p className="mt-2.5 max-w-xl text-body leading-relaxed text-muted-foreground">
        {example.description}
      </p>

      {composedComponents.length > 0 ? (
        <p className="mt-3 text-caption text-muted-foreground">
          Composed from{" "}
          {composedComponents.map((item, index) => (
            <span key={item.slug}>
              {index > 0 && (index === composedComponents.length - 1 ? " and " : ", ")}
              <Link href={`/docs/components/${item.slug}`} className={linkClassName}>
                {item.title}
              </Link>
            </span>
          ))}
          .
        </p>
      ) : null}

      <div className="mt-10">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <ComponentPreview label={example.slug}>
              <Demo />
            </ComponentPreview>
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock code={source} label={example.slug} />
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}
