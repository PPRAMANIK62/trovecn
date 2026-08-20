"use client";

import { ScrubField } from "@/components/trovecn/inputs/scrub-field";

export default function ScrubFieldFormatsExample() {
  return (
    <div className="flex flex-col gap-2">
      <ScrubField
        label="Opacity"
        defaultValue={0.8}
        min={0}
        max={1}
        step={0.01}
        smallStep={0.001}
        largeStep={0.1}
        format={{ style: "percent", maximumFractionDigits: 1 }}
        pixelSensitivity={4}
      />
      <ScrubField
        label="Budget"
        defaultValue={2500}
        min={0}
        step={50}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
      <ScrubField label="Delay" defaultValue={240} min={0} max={2000} step={10} suffix="ms" />
    </div>
  );
}
