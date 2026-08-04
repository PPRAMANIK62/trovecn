"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

function toggle() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("trovecn-theme", next ? "dark" : "light");
  } catch {
    // storage unavailable — theme just won't persist across visits
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      variant="elevated"
      size="icon"
      className={className}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
