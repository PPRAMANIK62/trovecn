"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SheetNavContent } from "./nav-content";

export default function SheetStandaloneExample() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetNavContent />
      </SheetContent>
    </Sheet>
  );
}
