/**
 * Which way the docs content pane should slide on the next route change —
 * set by whichever nav element (sidebar, breadcrumb, prev/next arrows) the
 * user actually clicked, read once by `DocsPageTransition`
 * (`@/components/site/docs-page-transition`) when the pathname it's keyed
 * on changes. A plain module-level value rather than React context: the
 * writer (an onClick handler) and the reader (a render triggered by the
 * following navigation) never need to be reactive to each other — the
 * value only has to be current at the moment the transition reads it.
 */

export type DocsNavDirection = "forward" | "back";

let direction: DocsNavDirection = "forward";

export function setDocsNavDirection(next: DocsNavDirection) {
  direction = next;
}

export function getDocsNavDirection(): DocsNavDirection {
  return direction;
}
