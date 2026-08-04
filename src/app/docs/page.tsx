import Link from "next/link";

import { registry } from "@/lib/components-registry";

export default function DocsIndexPage() {
  return (
    <article className="max-w-2xl">
      <p className="text-sm font-medium text-link">Introduction</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        Trovecn<span className="text-link">[.]</span>
        <span className="text-muted-foreground">dev</span>
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Trovecn is a registry of interface patterns observed on sites like Apple, Linear, Vercel,
        and Raycast, rebuilt from scratch and distributed as open code you copy into your own
        project — the same model as{" "}
        <a
          href="https://ui.shadcn.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-link underline underline-offset-4"
        >
          shadcn/ui
        </a>
        . There is no package to install and no runtime dependency on this site: every component
        becomes source you own.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-foreground">Installation</h2>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        Each component page has a ready-to-run install command. Under the hood it uses the shadcn
        CLI to fetch the component, drop it into your project, and install any dependencies it
        needs.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-foreground">
        npx shadcn add https://trovecn.dev/r/blur-navbar.json
      </pre>

      <h2 className="mt-10 text-lg font-semibold text-foreground">Stack</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-7 text-muted-foreground">
        <li>Next.js App Router, React 19, TypeScript</li>
        <li>Tailwind CSS v4</li>
        <li>Base UI primitives, styled with class-variance-authority</li>
        <li>Framer Motion for the animated pieces</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-foreground">Browse components</h2>
      <ul className="mt-3 space-y-1.5">
        {registry.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/docs/components/${item.slug}`}
              className="text-base font-medium text-link underline-offset-4 hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
