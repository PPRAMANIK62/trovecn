"use client";

import { useState } from "react";

import { ElasticSlider } from "@/components/trovecn/inputs/elastic-slider";

export default function ElasticSliderZoomExample() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-border">
        <span
          className="text-title text-foreground"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          trove/cn
        </span>
      </div>
      <ElasticSlider
        label="Zoom"
        value={zoom}
        onValueChange={setZoom}
        min={0.5}
        max={2}
        step={0.01}
        formatValue={(value) => `${value.toFixed(2)}×`}
      />
    </div>
  );
}
