import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { LandingProof } from "@/components/site/landing-proof";
import { LandingEvidence } from "@/components/site/landing-evidence";
import { LandingPrimitives } from "@/components/site/landing-primitives";
import { LandingClosing } from "@/components/site/landing-closing";
import { SiteFooter } from "@/components/site/site-footer";
import { Brand } from "@/components/site/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";

/**
 * Marketing. The argument runs hero → proof → what installs → what it stands
 * on → why it matters, and hands off to /docs.
 *
 * The fixed bottom fog this page used to carry is gone. It existed to sit
 * over the old grid's first row peeking up at rest, and the new hero is short
 * enough that the proof strip's own hairline crosses the fold instead — a
 * better scroll cue than a gradient, and one that does not blur the section
 * rules the layout is now built from. SiteFooter, not a fade, is what anchors
 * the bottom — see its header for why the docs shell's ScrollFade does not
 * transfer to a normal document scroll.
 */
export default function Home() {
  return (
    <>
      <SiteHeader>
        <Brand />
        <ThemeToggle />
      </SiteHeader>
      <main>
        <Hero />
        <LandingProof />
        <LandingEvidence />
        <LandingPrimitives />
        <LandingClosing />
      </main>
      <SiteFooter />
    </>
  );
}
