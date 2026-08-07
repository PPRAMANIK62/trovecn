"use client";

import { Bold, Italic, Underline } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
];

export default function TooltipStandaloneExample() {
  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {actions.map(({ icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <Icon />
              <span className="sr-only">{label}</span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
