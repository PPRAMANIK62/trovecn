"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function NavigationMenuResizeExample() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Short</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-32 flex-col gap-1">
              <li>
                <NavigationMenuLink href="#">One</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Two</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Long</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex w-72 flex-col gap-1">
              <li>
                <NavigationMenuLink href="#">A much longer row of content</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  Forces the shared viewport to resize
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Instead of jumping between sizes</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
