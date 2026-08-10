"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const components = [
  {
    title: "Accordion",
    description: "Progressive disclosure with anchored content.",
  },
  {
    title: "Combobox",
    description: "Searchable choices in a stable surface.",
  },
  {
    title: "Context Menu",
    description: "Pointer-originated actions and submenus.",
  },
  {
    title: "Drawer",
    description: "Edge-attached panels with drag dismissal.",
  },
  {
    title: "Navigation Menu",
    description: "Shared viewport for richer site navigation.",
  },
  {
    title: "Tabs",
    description: "A selection indicator that preserves momentum.",
  },
];

function ListItem({
  title,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof NavigationMenuLink> & { title: string; children: ReactNode }) {
  return (
    <li>
      <NavigationMenuLink className="flex-col items-start gap-1 p-2.5" {...props}>
        <span className="text-control font-medium text-foreground">{title}</span>
        <span className="text-caption leading-snug text-muted-foreground">{children}</span>
      </NavigationMenuLink>
    </li>
  );
}

export default function NavigationMenuMegaMenuExample() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] grid-cols-[0.8fr_1fr] gap-1">
              <li className="row-span-3">
                <NavigationMenuLink
                  href="#"
                  className="flex h-full min-h-48 flex-col items-start justify-end rounded-md bg-muted p-4"
                >
                  <span className="text-title font-medium text-foreground">trovecn</span>
                  <span className="mt-2 text-caption leading-snug text-muted-foreground">
                    Motion-first primitives for interfaces that feel inevitable.
                  </span>
                </NavigationMenuLink>
              </li>
              <ListItem href="#" title="Installation">
                Add the pieces you need and keep full ownership of the code.
              </ListItem>
              <ListItem href="#" title="Motion principles">
                Origin, continuity, restraint, and reduced motion.
              </ListItem>
              <ListItem href="#" title="Documentation">
                Explore the components, APIs, and implementation details.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[460px] grid-cols-2 gap-1">
              {components.map(({ title, description }) => (
                <ListItem key={title} href="#" title={title}>
                  {description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            className="inline-flex h-8 w-max items-center rounded-lg px-2.5 text-control text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
