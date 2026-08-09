"use client";

import type { ComponentProps } from "react";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";

import { cn } from "@/lib/utils";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@/components/ui/menu";

/**
 * Every top-level menu here is just the dropdown Menu (`menu.tsx`) — same
 * popup, same `spring.moderate` motion, same proximity-hover pill — nested
 * inside Base UI's `Menubar` container instead of a standalone trigger.
 * `Menubar` wires the macOS/Windows "hover switches once one menu is
 * already open, hovering with nothing open does nothing" behavior into its
 * child `Menu.Root`s internally (docs/research/overlay-menu-motion-research.md
 * — "Menubar": this is the one technique Radix's own Menubar treats as
 * load-bearing, and Base UI's primitive already implements it, so nothing
 * below re-derives it), so this file only supplies the bar chrome and the
 * trigger's row styling.
 */

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-background p-1 shadow-well",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: ComponentProps<typeof Menu>) {
  return <Menu data-slot="menubar-menu" {...props} />;
}

function MenubarTrigger({ className, ...props }: ComponentProps<typeof MenuTrigger>) {
  return (
    <MenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "flex cursor-default items-center rounded-md px-2.5 py-1 text-control text-muted-foreground outline-none select-none transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Wider sideOffset than a plain dropdown's — the trigger sits inside the
 * bar's own padding, so the content needs to clear that gap too. */
function MenubarContent({
  align = "start",
  alignOffset = -3,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof MenuContent>) {
  return (
    <MenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenuPortal as MenubarPortal,
  MenuGroup as MenubarGroup,
  MenuLabel as MenubarLabel,
  MenuItem as MenubarItem,
  MenuCheckboxItem as MenubarCheckboxItem,
  MenuRadioGroup as MenubarRadioGroup,
  MenuRadioItem as MenubarRadioItem,
  MenuSeparator as MenubarSeparator,
  MenuShortcut as MenubarShortcut,
  MenuSub as MenubarSub,
  MenuSubTrigger as MenubarSubTrigger,
  MenuSubContent as MenubarSubContent,
};
