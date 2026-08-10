import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { LandingShowcase } from "@/components/site/landing-showcase";
import { Brand } from "@/components/site/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";

export default function Home() {
  return (
    <>
      <SiteHeader>
        <Brand />
        <ThemeToggle />
      </SiteHeader>
      <main>
        <Hero />
        <LandingShowcase />
      </main>
      {/* Pinned to the viewport's own bottom edge, not to any section's box
          — the whole page is one normal scroll (no fixed-height pane the
          way docs has), so this is the only anchor that's guaranteed to
          sit over whatever's actually cut off at the bottom of the window,
          most importantly LandingShowcase's first row peeking up at rest.
          Same fog-over-content mask as ScrollFadeTop/Bottom
          (scroll-fade.tsx). */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-20 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </>
  );
}
