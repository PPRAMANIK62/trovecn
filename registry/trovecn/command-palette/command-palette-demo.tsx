"use client";

import * as React from "react";
import {
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  UserPlus,
} from "lucide-react";

import { CommandPalette, type CommandPaletteItem } from "./command-palette";

export default function CommandPaletteDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isToggleCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isToggleCombo) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const items: CommandPaletteItem[] = [
    {
      id: "home",
      label: "Home",
      group: "Navigate",
      icon: <Home />,
      onSelect: () => setOpen(false),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      group: "Navigate",
      icon: <LayoutDashboard />,
      onSelect: () => setOpen(false),
    },
    {
      id: "inbox",
      label: "Inbox",
      group: "Navigate",
      icon: <Inbox />,
      onSelect: () => setOpen(false),
    },
    {
      id: "docs",
      label: "Documentation",
      group: "Navigate",
      icon: <FileText />,
      onSelect: () => setOpen(false),
    },
    {
      id: "invite",
      label: "Invite teammate",
      group: "Actions",
      icon: <UserPlus />,
      onSelect: () => setOpen(false),
    },
    {
      id: "theme",
      label: "Toggle dark mode",
      group: "Actions",
      icon: <Moon />,
      onSelect: () => setOpen(false),
    },
    {
      id: "settings",
      label: "Open settings",
      group: "Actions",
      icon: <Settings />,
      onSelect: () => setOpen(false),
    },
    {
      id: "logout",
      label: "Log out",
      group: "Actions",
      icon: <LogOut />,
      onSelect: () => setOpen(false),
    },
  ];

  return (
    <div className="flex w-full items-center justify-center py-10">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" />
          Search or jump to...
        </span>
        <kbd className="flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandPalette items={items} open={open} onOpenChange={setOpen} />
    </div>
  );
}
