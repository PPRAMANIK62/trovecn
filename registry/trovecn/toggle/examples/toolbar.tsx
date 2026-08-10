"use client";

import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

/**
 * Three independent Toggles, not a ToggleGroup — each one flips on its own,
 * any combination can be active at once (bold + italic + underline all
 * pressed together is valid). Reach for ToggleGroup instead when the items
 * should behave as one linked control (single- or multi-select).
 */
export default function ToggleToolbarExample() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  const [underline, setUnderline] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <Toggle aria-label="Bold" size="sm" pressed={bold} onPressedChange={setBold}>
        <Bold />
      </Toggle>
      <Toggle aria-label="Italic" size="sm" pressed={italic} onPressedChange={setItalic}>
        <Italic />
      </Toggle>
      <Toggle aria-label="Underline" size="sm" pressed={underline} onPressedChange={setUnderline}>
        <Underline />
      </Toggle>
    </div>
  );
}
