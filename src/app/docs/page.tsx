import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Introduction — trove/cn",
  description:
    "Why trove/cn exists: interfaces are judged as cheap or crafted in seconds, and almost never in words.",
};

const cheapTells = [
  {
    title: "The layout jumps",
    body: "A card finishes loading and the paragraph underneath drops to make room for it. The button you were about to hit is now hovering over something else entirely. Every state an element can reach needs its space reserved before it gets there — not the moment after.",
  },
  {
    title: "The hover answers late",
    body: "You put the cursor on a button and, for a beat, nothing happens — then the color catches up once you've already moved on. Feedback under a tenth of a second reads as instant. Anything slower reads as absence, even once it arrives.",
  },
  {
    title: "Nothing was actually measured",
    body: "Twenty pixels here, eighteen there, a heading sized at whatever the framework shipped with. No single gap is wrong enough to flag on its own. The page just feels slightly off, in a way nobody can point to — because it was never built from one scale to begin with.",
  },
  {
    title: "The motion doesn't explain anything",
    body: "Elements fade and slide because a UI kit defaults to it, not because the movement tells you what changed. You can tell — close the panel a half-second after opening it, and it snaps back to start instead of reversing from wherever it actually was.",
  },
];

export default function DocsIndexPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-title text-foreground lg:mt-8">
        Nobody tells you an interface feels cheap.
        <br />
        They just leave.
      </h1>
      <p className="mt-3.5 text-lede leading-relaxed text-muted-foreground">
        A visitor doesn&apos;t run through a checklist. They land, move the cursor, click something
        — and somewhere in that first half-minute they&apos;ve already decided whether this is worth
        trusting with the next ten.
      </p>
      <p className="mt-3.5 text-lede leading-relaxed text-muted-foreground">
        Nobody writes that verdict down. They just act on it, usually before they&apos;ve read a
        single word.
      </p>

      <h2 className="mt-12 text-label uppercase text-muted-foreground">
        What &ldquo;cheap&rdquo; actually means
      </h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        It&apos;s rarely one broken thing. It&apos;s a handful of decisions nobody made on purpose —
        each too small to file as a bug — that add up to a feeling anyway.
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
        trove/cn studies the interfaces that get this right — the ones people call
        &ldquo;expensive&rdquo; without being able to say why — and rebuilds the actual mechanism
        behind each one: a spring that answers in under a tenth of a second and adapts if you
        interrupt it instead of snapping back to start, a type and spacing scale where every size
        traces back to one system instead of whatever felt close enough, surfaces that visibly step
        up off the page instead of a border nobody notices. None of it is supposed to read as an
        effect. That restraint is the craft, not the absence of it.
      </p>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Then it ships as source, the same distribution model as{" "}
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
