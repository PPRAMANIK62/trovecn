"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Standalone two-state button — a toolbar bold/italic toggle, a
 * favorite/star button, anything that flips on/off on its own, not as part
 * of a `ToggleGroup`. Base UI's `Toggle` directly (`pressed`/`defaultPressed`
 * /`onPressedChange`), with `cva` size variants matching this repo's other
 * compact controls (see `button.tsx`'s size steps) — this file doesn't reuse
 * `buttonVariants` itself since a toggle's persistent pressed fill is its own
 * visual language, not a button variant.
 *
 * Per `docs/research/selection-inputs-motion-research.md` (Toggle/
 * ToggleGroup section): a toggle's pressed-state fill is deliberately NOT a
 * `spring.*` moment — Rauno Freiberg's guidance is that toggles should take
 * effect immediately rather than play a confirmation animation, so the fill
 * below is a plain CSS `transition-colors`. The press-scale is the same
 * story: a plain CSS `active:` utility, not a Motion spring, and a subtle
 * 0.97 rather than a dramatic 1→0.8-style squash (Rauno again). Toggle does
 * NOT share code with `switch.tsx` — confirmed by the same research doc as
 * an architecturally distinct control (button vs. thumb-on-track), so this
 * file doesn't reach for Switch's hover-stretch/press-squish constants.
 *
 * Base UI sets `data-pressed`/`data-disabled` on the rendered `<button>`
 * automatically (see `ToggleDataAttributes`) — style off those directly
 * rather than re-deriving pressed state in React.
 */
const toggleVariants = cva(
  "group/toggle relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-control text-muted-foreground whitespace-nowrap outline-none transition-colors duration-fast select-none hover:not-data-[pressed]:bg-muted hover:not-data-[pressed]:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] data-[pressed]:bg-accent data-[pressed]:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default: "h-8 min-w-8 px-2",
        sm: "h-7 min-w-7 px-1.5",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Toggle<Value extends string = string>({
  className,
  size,
  ...props
}: TogglePrimitive.Props<Value> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
