"use client";

import { useState } from "react";

import { Slider } from "@/components/ui/slider";

export default function SliderBasicExample() {
  const [volume, setVolume] = useState(40);

  return (
    <div className="w-full max-w-sm">
      <Slider
        label="Volume"
        value={volume}
        onValueChange={(value) => setVolume(value as number)}
        formatValue={(value) => `${Math.round(value)}%`}
      />
    </div>
  );
}
