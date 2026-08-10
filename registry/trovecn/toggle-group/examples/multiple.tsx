"use client";

import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ToggleGroupMultipleExample() {
  const [marks, setMarks] = useState<string[]>(["italic"]);

  return (
    <ToggleGroup
      type="multiple"
      value={marks}
      onValueChange={setMarks}
      aria-label="Text formatting"
    >
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
