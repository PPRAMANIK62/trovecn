/**
 * X's card image. Same render as the Open Graph one, deliberately — the two
 * cards have never differed and keeping one source avoids them drifting.
 *
 * CACHE TRAP — bump the revision below whenever opengraph-image.tsx changes.
 *
 * Next derives each metadata route's `?hash` query from that route file's own
 * bytes, not from the image those bytes produce. opengraph-image.tsx is fine,
 * because editing the art edits the file. This one is a re-export, so its hash
 * is frozen: the card can be redrawn from scratch and this URL stays
 * byte-identical. X caches by image URL, so without a bump every viewer who
 * has seen the old card keeps seeing it.
 *
 * Verified 2026-08-22: appending a line to opengraph-image.tsx moved the
 * og:image hash and left twitter:image untouched.
 *
 * Card revision: 2 (notification pile + sliders product shot)
 */

export { default, alt, size, contentType } from "./opengraph-image";
