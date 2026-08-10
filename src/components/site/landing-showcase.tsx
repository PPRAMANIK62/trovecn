"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { getComponent } from "@/lib/components-registry";
import { spring } from "@/lib/springs";

/**
 * Small, self-contained demos only — no full-screen overlays (Dialog,
 * Drawer), nothing that needs a right-click to discover (ContextMenu), and
 * nothing too wide for a grid cell (Menubar, NavigationMenu). See
 * docs/design-system.md "Preview-grid tile pattern."
 */
const FEATURED = [
  { slug: "switch", example: "Settings row" },
  { slug: "tabs", example: "Icons" },
  { slug: "accordion", example: "Single expand" },
  { slug: "tooltip", example: "Placement" },
  { slug: "combobox", example: "Standalone" },
  { slug: "preview-card", example: "Profile" },
] as const;

/**
 * Same container/item stagger shape as ExampleList (docs/design-system.md
 * spring table: "preview cards" and "small entrance staggers" both fall
 * under spring.quick) — kept as its own local wrapper rather than reusing
 * ExampleList itself, since that component's vertical-list entrance is a
 * docs-only concern and this is a grid.
 */
function ShowcaseGrid({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion ? undefined : { staggerChildren: 0.06 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={container}
      className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}

/**
 * Reuses ComponentPreview's visual recipe (lifted shadow-card frame,
 * recessed shadow-well stage) but drops its footer/replay button — that's a
 * docs-reference affordance, while this tile is a navigation affordance
 * into the same content. Caption sits below, left-aligned, matching
 * transitions.dev's actual pattern rather than centering it to match the
 * hero above.
 */
function LandingTile({
  slug,
  example,
}: {
  slug: (typeof FEATURED)[number]["slug"];
  example: string;
}) {
  const reduceMotion = useReducedMotion();
  const registryItem = getComponent(slug);
  const demo = registryItem?.examples.find((e) => e.title === example);
  if (!registryItem || !demo) return null;
  const Demo = demo.Demo;

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : spring.quick.enter,
    },
  };

  return (
    <motion.div variants={item} className="flex flex-col gap-3">
      {/* No tile-wide overlay link and no hover-lift on the frame — the demo
          stays normally interactive, exactly like ComponentPreview on the
          docs page (see docs/design-system.md "Preview-grid tile pattern").
          A lift-on-hover here would fire while hovering to click a live
          control (e.g. Tabs) and visibly distort that control's own layout
          animation. Only the caption below is the navigation affordance. */}
      <div className="rounded-xl bg-card p-[5px] shadow-card">
        <div className="flex min-h-56 items-center justify-center rounded-lg bg-background p-6 shadow-well">
          <Demo />
        </div>
      </div>
      <div className="px-1">
        <Link
          href={`/docs/components/${slug}`}
          aria-label={`${registryItem.title}: ${registryItem.description}`}
          className="rounded-sm text-control font-medium text-foreground outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {registryItem.title}
        </Link>
      </div>
    </motion.div>
  );
}

export function LandingShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-6 sm:pt-8">
      <p className="text-label uppercase text-muted-foreground">Live previews</p>
      <h2 className="mt-2 text-title text-foreground">See it before you install it.</h2>
      <ShowcaseGrid>
        {FEATURED.map((f) => (
          <LandingTile key={f.slug} slug={f.slug} example={f.example} />
        ))}
      </ShowcaseGrid>
    </section>
  );
}
