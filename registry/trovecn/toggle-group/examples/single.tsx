"use client";

import { useState } from "react";
import { List, LayoutGrid, Columns3 } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ToggleGroupSingleExample() {
  const [view, setView] = useState("list");

  return (
    <ToggleGroup type="single" value={view} onValueChange={setView} aria-label="View mode">
      <ToggleGroupItem value="list" aria-label="List view">
        <List />
        List
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid />
        Grid
      </ToggleGroupItem>
      <ToggleGroupItem value="board" aria-label="Board view">
        <Columns3 />
        Board
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
