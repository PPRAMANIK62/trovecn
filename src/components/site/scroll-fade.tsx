/**
 * Top/bottom masks for an independently-scrolling pane (docs shell's
 * sidebar, main content, and info-rail panes — see docs/design-system.md
 * "Shell architecture"). Painted as matching-background gradients layered
 * above the scroll container via z-index, not a `mask-image` on the content
 * itself — a mask multiplies the pane's own shadows/rounded corners into the
 * fade curve, while painting fog over the content leaves its shape
 * untouched regardless of what's underneath. Render inside a `relative`
 * wrapper around the scroll container.
 */
export function ScrollFadeTop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background via-background/70 to-transparent" />
  );
}

export function ScrollFadeBottom() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background via-background/70 to-transparent" />
  );
}
