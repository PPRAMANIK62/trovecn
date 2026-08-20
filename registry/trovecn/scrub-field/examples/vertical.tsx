"use client";

import { ScrubField } from "@/components/trovecn/inputs/scrub-field";

export default function ScrubFieldVerticalExample() {
  return (
    <div className="flex flex-col gap-2">
      <ScrubField label="Zoom" defaultValue={100} min={10} max={400} suffix="%" />
      <ScrubField
        label="Zoom"
        direction="vertical"
        defaultValue={100}
        min={10}
        max={400}
        suffix="%"
      />
    </div>
  );
}
