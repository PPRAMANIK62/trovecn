"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DrawerNavContent } from "./nav-content";

export default function DrawerStandaloneExample() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerContent side="left">
        <DrawerNavContent />
      </DrawerContent>
    </Drawer>
  );
}
