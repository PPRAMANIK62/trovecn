"use client";

import {
  BellIcon,
  BoxIcon,
  KeyboardIcon,
  LayersIcon,
  LifeBuoyIcon,
  NewspaperIcon,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const product = [
  { title: "Primitives", description: "Structural building blocks.", icon: LayersIcon },
  { title: "Components", description: "Composed, real-product patterns.", icon: BoxIcon },
  { title: "Shortcuts", description: "Keyboard-first navigation.", icon: KeyboardIcon },
  { title: "Notifications", description: "Toasts, badges, live updates.", icon: BellIcon },
];

const resources = [
  { title: "Changelog", icon: NewspaperIcon },
  { title: "Support", icon: LifeBuoyIcon },
];

export default function NavigationMenuMegaMenuExample() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] grid-cols-2 gap-1">
              {product.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <NavigationMenuLink href="#" className="flex-col items-start gap-1">
                    <span className="flex items-center gap-2 text-foreground">
                      <Icon className="size-4" />
                      {title}
                    </span>
                    <span className="text-caption text-muted-foreground">{description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-40 flex-col gap-1">
              {resources.map(({ title, icon: Icon }) => (
                <li key={title}>
                  <NavigationMenuLink href="#">
                    <Icon className="size-4" />
                    {title}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            className="inline-flex h-8 w-max items-center rounded-lg px-2.5 text-control text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
