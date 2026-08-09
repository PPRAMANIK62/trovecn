"use client";

import { CopyIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

export default function MenuStandaloneExample() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" size="icon" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">Open menu</span>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          <PencilIcon />
          Rename
          <MenuShortcut>⌘R</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <CopyIcon />
          Duplicate
          <MenuShortcut>⌘D</MenuShortcut>
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <Trash2Icon />
          Delete
          <MenuShortcut>⌘⌫</MenuShortcut>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
