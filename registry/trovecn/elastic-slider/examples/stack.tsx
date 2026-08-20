"use client";

import { useState } from "react";

import { ElasticSlider } from "@/components/trovecn/inputs/elastic-slider";

export default function ElasticSliderStackExample() {
  const [settings, setSettings] = useState({ volume: 72, brightness: 45, warmth: 18 });

  const update = (key: keyof typeof settings) => (value: number) =>
    setSettings((current) => ({ ...current, [key]: value }));

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <ElasticSlider
        label="Volume"
        value={settings.volume}
        onValueChange={update("volume")}
        formatValue={(value) => `${Math.round(value)}%`}
      />
      <ElasticSlider
        label="Brightness"
        value={settings.brightness}
        onValueChange={update("brightness")}
        formatValue={(value) => `${Math.round(value)}%`}
      />
      <ElasticSlider
        label="Warmth"
        value={settings.warmth}
        onValueChange={update("warmth")}
        formatValue={(value) => `${Math.round(value)}%`}
      />
    </div>
  );
}
