import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Introduction — trove/cn",
  description:
    "Why trove/cn exists: native controls keep listening after you press, and most web components do not.",
};

/**
 * The manifesto. Rewritten around the gap rather than around polish in
 * general.
 *
 * The previous version argued that interfaces get judged as cheap or crafted
 * in seconds, then listed four tells — a jumping layout, a late hover, an
 * unmeasured scale, motion that explains nothing. All true, and all still
 * here, but only the last one touched what this project actually competes
 * on. The mission is closing the distance between how native controls feel
 * and how web components feel, and question 2 of docs/what-to-build.md —
 * describe how it behaves under the hand — is the test every component has
 * to pass. Neither appeared anywhere on the site.
 *
 * So the tells are now split into the two groups that match what the code
 * does: things that stop listening, and things nobody measured.
 */

const stopsListening = [
  {
    title: "It commits the moment you press",
    body: "You start a drag and the component has already decided where it is going. Nothing you do for the next three hundred milliseconds changes the outcome. A native control is still reading your finger the entire time, which is why it feels like you are moving the thing rather than requesting that it move.",
  },
  {
    title: "It cannot be interrupted",
    body: "Open a panel, change your mind, close it half-way through. The web version jumps to fully-open and then plays the close from rest. The native one turns around from wherever it actually is. This is the single clearest tell, and it takes about a second to find in any interface.",
  },
  {
    title: "Nothing happens until you let go",
    body: "The gesture runs, the screen holds still, and the result appears on release. Every frame in between was a chance to show what was about to happen, spent on nothing. Feedback that arrives only at the end is indistinguishable from a button that took a while.",
  },
];

const nobodyMeasured = [
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
];

function Tells({ items, offset }: { items: { title: string; body: string }[]; offset: number }) {
  return (
    <ol className="mt-6 grid gap-2">
      {items.map((tell, i) => (
        <li key={tell.title} className="rounded-xl bg-background p-4 shadow-card">
          <div className="flex items-baseline gap-2.5">
            <span className="grid size-[18px] shrink-0 place-items-center rounded-md bg-muted font-mono text-micro tabular-nums text-muted-foreground">
              {offset + i + 1}
            </span>
            <h3 className="text-control text-foreground">{tell.title}</h3>
          </div>
          <p className="mt-1.5 pl-7 text-caption leading-relaxed text-muted-foreground">
            {tell.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

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

      <h2 className="mt-12 text-label uppercase text-muted-foreground">The gap</h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Ask someone why an app felt better than a website and they will say it was faster, or
        smoother, or just nicer. It is usually none of those. A native control tracks your finger
        the whole time it is moving, can be grabbed in the middle of its own animation, and settles
        instead of stopping. Most web components fire once on a click event, run a CSS transition
        that cannot be interrupted, and are finished deciding before your hand is.
      </p>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        That is the whole difference, and it is a difference in what the component is listening to —
        not in frame rate, and not in how it looks in a screenshot.
      </p>

      <h2 className="mt-12 text-label uppercase text-muted-foreground">What stops listening</h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Three symptoms of the same cause. Each takes seconds to find in an interface you already
        use.
      </p>
      <Tells items={stopsListening} offset={0} />

      <h2 className="mt-12 text-label uppercase text-muted-foreground">What nobody measured</h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        The quieter half. None of these are about motion at all, and none of them are one broken
        thing — they are decisions nobody made on purpose, each too small to file as a bug, that add
        up to a feeling anyway.
      </p>
      <Tells items={nobodyMeasured} offset={3} />

      <h2 className="mt-12 text-label uppercase text-muted-foreground">The test</h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Nothing gets built here on the strength of looking good. A component has to survive one
        question:{" "}
        <em className="text-foreground not-italic">
          describe how it behaves under the hand, in one sentence
        </em>{" "}
        — what it does while you drag it, and what happens if you let go halfway.
      </p>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        &ldquo;A fresh take on tabs&rdquo; says nothing and fails. &ldquo;You drag across the tabs
        and the content follows your finger, and releasing halfway springs it back&rdquo; passes —
        and it also tells you what to build. Every description in this registry is written that way
        on purpose. If one of them reads like a category name rather than a behaviour, the component
        underneath it is not finished.
      </p>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        The thing being competed with is the native app, not another registry. That is a high bar
        and it is meant to be.
      </p>

      <h2 className="mt-12 text-label uppercase text-muted-foreground">How it ships</h2>
      <p className="mt-3 text-body leading-relaxed text-muted-foreground">
        Each component rebuilds the actual mechanism rather than the look of it: a spring that
        answers in under a tenth of a second and adapts if you interrupt it instead of snapping back
        to start, a gesture that reverses from where it is, surfaces that visibly step up off the
        page instead of a border nobody notices, a type and spacing scale where every size traces
        back to one system. None of it is supposed to read as an effect. That restraint is the
        craft, not the absence of it.
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
        install once and never open again. The hard part is meant to live inside the component, so
        that using it correctly never requires knowing why it was built this way.
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
