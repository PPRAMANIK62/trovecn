import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Introduction — Trovecn",
  description:
    "Why Trovecn exists: interfaces are judged as cheap or crafted in seconds, and almost never in words.",
};

const cheapTells = [
  {
    title: "The layout jumps",
    body: "A card finishes loading and the copy underneath drops to make room for it. The link you were about to click is now hovering over something else entirely. Every state an element can reach needs its space reserved before it gets there, not after.",
  },
  {
    title: "The hover state answers late",
    body: "You move the cursor onto a button and, for a moment, nothing happens — then the color catches up after you've already decided it isn't going to. A response measured in whole seconds reads as absence, even once it arrives.",
  },
  {
    title: "Nothing was actually measured",
    body: "Twenty pixels here, eighteen there, a heading sized at whatever the framework shipped with. No single gap is wrong enough to flag on its own. The page just feels slightly off, in a way nobody can point to.",
  },
  {
    title: "The motion doesn't explain anything",
    body: "Elements fade and slide because a UI kit defaults to it, not because the movement tells you what changed. Motion that isn't carrying information is decoration wearing an easing curve.",
  },
];

export default function DocsIndexPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-label uppercase text-link">Introduction</p>
      <h1 className="mt-3 text-title text-foreground">
        Nobody tells you an interface feels cheap. They just leave.
      </h1>
      <p className="mt-3.5 text-lede leading-relaxed text-muted-foreground">
        A visitor doesn&apos;t run through a checklist. They land, move the cursor, click something
        — and somewhere in that first half-minute they&apos;ve already decided whether this is a
        product worth trusting with more of their time. Nobody writes that verdict down. They just
        act on it, usually before they&apos;ve read a single word of your copy.
      </p>

      <h2 className="mt-12 text-label uppercase text-muted-foreground">
        What &ldquo;cheap&rdquo; actually means
      </h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        It&apos;s rarely one broken thing. It&apos;s a handful of decisions nobody made on purpose —
        and none of them show up in a bug report.
      </p>
      <ol className="mt-6 grid gap-2">
        {cheapTells.map((tell, i) => (
          <li key={tell.title} className="rounded-xl bg-background p-4 shadow-card">
            <div className="flex items-baseline gap-2.5">
              <span className="grid size-[18px] shrink-0 place-items-center rounded-md bg-muted font-mono text-micro tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <h3 className="text-control text-foreground">{tell.title}</h3>
            </div>
            <p className="mt-1.5 pl-7 text-caption leading-relaxed text-muted-foreground">
              {tell.body}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-label uppercase text-muted-foreground">
        What we&apos;re doing about it
      </h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Trovecn studies the interfaces that get this right — the ones people call
        &ldquo;expensive&rdquo; without being able to say why — and rebuilds the actual mechanism
        behind each one: the real easing curve, the real spacing scale, the restraint that makes it
        look like nothing is happening. Then it ships as source, the same distribution model as{" "}
        <a
          href="https://ui.shadcn.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-link underline underline-offset-4"
        >
          shadcn/ui
        </a>
        : code that lands directly in your project and becomes yours to maintain, not a package you
        install once and never open again.
      </p>

      <Link
        href="/docs/components"
        className="mt-6 inline-flex items-center gap-1.5 text-caption font-medium text-link underline-offset-4 hover:underline"
      >
        Browse components
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}
