"use client";

import ComparisonSliderListReorder from "../../../registry/trovecn/comparison-slider/examples/list-reorder";

/**
 * Section 01. The claim in the hero, demonstrated before anything asks to be
 * installed.
 *
 * This is the "seen once" tier of docs/design-system.md's delight budget —
 * the homepage hero is named there as somewhere to spend a beat more — so it
 * gets the full-width stage rather than a grid cell. The Comparison Slider
 * collapses at tile width: the two halves overlap and the divider handle
 * lands on top of the button, which is why it is here and not in the grid
 * below.
 *
 * The reorder race runs itself on a timer, so a visitor who never touches
 * anything still watches one list snap and the other move. Dragging the
 * divider is the second read, not the only one.
 *
 * Flush, hairline-ruled, no rounded frame — see LandingEvidence's header for
 * why the whole page uses the docs shell's grammar rather than floating
 * cards.
 */
export function LandingProof() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-5 md:px-8">
        <p className="font-mono text-label uppercase text-muted-foreground">01 — The difference</p>
        <h2 className="mt-2 max-w-xl text-title text-foreground">
          Same data, same reorder. Only one of them tells you what moved.
        </h2>
      </div>
      <div className="border-t border-border">
        {/* The example returns a bare ComparisonSlider, so its root is this
            wrapper's only child. Neutralising the radius and horizontal
            borders there is what keeps the stage flush with the section
            rules; left alone it re-introduces exactly the floating card this
            page removed. Constrained to the same column as every other left
            edge — full width strands the two labels in opposite corners with
            ~350px of dead space either side of the list. */}
        <div className="mx-auto max-w-6xl [&>div]:rounded-none [&>div]:border-y-0 md:[&>div]:border-x">
          <ComparisonSliderListReorder />
        </div>
      </div>
    </section>
  );
}
