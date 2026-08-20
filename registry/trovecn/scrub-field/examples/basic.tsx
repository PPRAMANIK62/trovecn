"use client";

import { ScrubField } from "@/components/trovecn/inputs/scrub-field";

export default function ScrubFieldBasicExample() {
  return <ScrubField label="Amount" defaultValue={100} min={0} max={999} />;
}
