"use client";

import { ScrubField } from "@/components/trovecn/inputs/scrub-field";

export default function ScrubFieldPropertyPanelExample() {
  return (
    <div className="w-fit rounded-lg border border-border bg-card p-3 shadow-panel">
      <p className="pb-2 text-label uppercase text-muted-foreground">Layout</p>
      <div className="flex flex-col gap-1.5">
        <ScrubField label="X" defaultValue={24} suffix="px" />
        <ScrubField label="Y" defaultValue={16} suffix="px" />
        <ScrubField label="W" defaultValue={320} suffix="px" min={0} />
        <ScrubField label="H" defaultValue={180} suffix="px" min={0} />
        <ScrubField label="Radius" defaultValue={8} suffix="px" min={0} max={64} />
      </div>
    </div>
  );
}
