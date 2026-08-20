"use client";

import { useState } from "react";

import { ElasticSlider } from "@/components/trovecn/inputs/elastic-slider";

export default function ElasticSliderBasicExample() {
  const [volume, setVolume] = useState(40);

  return (
    <div className="w-full max-w-sm">
      <ElasticSlider
        label="Volume"
        value={volume}
        onValueChange={setVolume}
        formatValue={(value) => `${Math.round(value)}%`}
      />
    </div>
  );
}
