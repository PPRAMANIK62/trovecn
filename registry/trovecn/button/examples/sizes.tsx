"use client";

import { Button } from "@/components/ui/button";

export default function ButtonSizesExample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="2xs">2xs</Button>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">Default</Button>
      <Button size="lg">lg</Button>
    </div>
  );
}
