"use client";

import { useState } from "react";

import { Slider } from "@/components/ui/slider";

export default function SliderRangeExample() {
  const [range, setRange] = useState<number[]>([120, 480]);

  return (
    <div className="w-full max-w-sm">
      <Slider
        label="Price range"
        min={0}
        max={600}
        step={10}
        value={range}
        onValueChange={(value) => setRange(value as number[])}
        thumbLabels={["Minimum price", "Maximum price"]}
        formatValue={(value) => `$${Math.round(value)}`}
      />
    </div>
  );
}
