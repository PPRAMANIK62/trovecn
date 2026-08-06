/**
 * Geist Sans weight tokens for `fontVariationSettings` — see
 * docs/design-system.md "Ghost-span for animated font-weight". Geist is a
 * variable font (loaded without a fixed `weight` in layout.tsx, so
 * next/font/google serves the full `wght` axis) but has no `opsz` axis, so
 * unlike some variable fonts there's no optical-size compensation to pair
 * each weight with.
 */
export const fontWeights = {
  normal: "'wght' 400",
  medium: "'wght' 500",
} as const;
