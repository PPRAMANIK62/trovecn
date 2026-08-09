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
      <span className="relative inline-flex size-4">
        <Sun className="absolute inset-0 size-4 rotate-0 opacity-100 transition-[opacity,transform] duration-fast dark:-rotate-90 dark:opacity-0" />
        <Moon className="absolute inset-0 size-4 rotate-90 opacity-0 transition-[opacity,transform] duration-fast dark:rotate-0 dark:opacity-100" />
      </span>
    </Button>
  );
}
