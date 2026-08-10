"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

export default function ToggleBasicExample() {
  const [favorited, setFavorited] = useState(false);

  return (
    <Toggle
      aria-label="Favorite"
      pressed={favorited}
      onPressedChange={setFavorited}
      className="data-[pressed]:text-amber-500"
    >
      <Star className="fill-current" />
    </Toggle>
  );
}
