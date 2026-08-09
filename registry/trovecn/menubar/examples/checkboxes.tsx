"use client";

import { useState } from "react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function MenubarCheckboxesExample() {
  const [toolbar, setToolbar] = useState(true);
  const [statusBar, setStatusBar] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={toolbar} onCheckedChange={setToolbar}>
            Toolbar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status bar
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value={theme} onValueChange={setTheme}>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            <MenubarRadioItem value="system">System</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Window</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Minimize</MenubarItem>
          <MenubarItem>Zoom</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
