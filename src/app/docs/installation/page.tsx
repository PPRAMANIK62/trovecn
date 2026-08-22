import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

import { CodeBlock } from "@/components/site/code-block";

export const metadata: Metadata = {
  title: "Installation — trove/cn",
  description:
    "The shared foundation most primitives in trove/cn build on: the core packages, and the handful of local files worth copying once.",
};

// Same build-time-only file read as the component pages use — see
// src/app/docs/components/[slug]/page.tsx.
function readSource(path: string): string {
  return readFileSync(join(/* turbopackIgnore: true */ process.cwd(), path), "utf-8").trim();
}

const CORE_DEPENDENCIES = [
  "@base-ui/react",
  "motion",
  "lucide-react",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

const foundationFiles = [
  {
    title: "cn()",
    description:
      "Class-name merger — clsx plus tailwind-merge, extended so tailwind-merge recognizes this site's custom text-* font-size scale.",
    path: "src/lib/utils.ts",
  },
  {
    title: "Springs",
    description:
      "Four-tier spring/tween motion tokens — fast, quick, moderate, slow — each an enter spring paired with a faster, bounce-free exit.",
    path: "src/lib/springs.ts",
  },
  {
    title: "useProximityHover",
    description:
      "Tracks cursor distance across a list of items to preview the nearest one before it's clicked — the hover pill behind Accordion, Tabs, Menu, and Combobox.",
    path: "src/hooks/use-proximity-hover.ts",
  },
  {
    title: "Font weight",
    description: "Geist variable-font weight tokens for animated font-weight transitions.",
    path: "src/lib/font-weight.ts",
  },
];

export default function InstallationPage() {
  return (
    <article className="max-w-3xl">
      <p className="font-mono text-2xs font-medium text-link">Getting Started</p>
      <h1 className="mt-3 text-title text-foreground">Installation</h1>
      <p className="mt-2.5 max-w-xl text-body leading-relaxed text-muted-foreground">
        Every component page ships its own install command, scoped to the packages that component
        imports directly. The files below are the shared foundation several components build on —
        copy whichever ones a component's page points back here for.
      </p>

      <section className="mt-10">
        <h2 className="text-control font-medium text-foreground">Core packages</h2>
        <p className="mt-1.5 text-caption text-muted-foreground">
          Covers everything the primitives in this registry depend on.
        </p>
        <CodeBlock
          code={`bun add ${CORE_DEPENDENCIES.join(" ")}`}
          lang="bash"
          label="Terminal"
          className="mt-4"
        />
      </section>

      <div className="mt-16 flex flex-col gap-12">
        {foundationFiles.map((file) => (
          <section key={file.path}>
            <h2 className="text-control font-medium text-foreground">{file.title}</h2>
            <p className="mt-1.5 text-caption text-muted-foreground">{file.description}</p>
            <CodeBlock
              code={readSource(file.path)}
              label={file.path.split("/").pop()}
              className="mt-4"
            />
          </section>
        ))}
      </div>
    </article>
  );
}
