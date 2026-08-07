"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const sides = ["top", "right", "bottom", "left"] as const;

export default function PopoverPlacementExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button variant="outline" className="capitalize" />}>
            {side}
          </PopoverTrigger>
          <PopoverContent side={side} className="w-auto">
            Anchored to the <span className="font-medium text-foreground">{side}</span>.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
