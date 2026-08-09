"use client";

import { useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

export default function MenuCheckboxesExample() {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>
        <SlidersHorizontalIcon />
        View
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuLabel>Show</MenuLabel>
          <MenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
            Bookmarks bar
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
            Full URLs
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <MenuLabel>Sort by</MenuLabel>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date">Date modified</MenuRadioItem>
          <MenuRadioItem value="size">Size</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
