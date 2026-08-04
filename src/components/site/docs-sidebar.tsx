"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getComponentsByCategory } from "@/lib/components-registry";
import { cn } from "@/lib/utils";

const groups = getComponentsByCategory();

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 text-sm">
      <Link
        href="/docs"
        className={cn(
          "font-medium transition-colors",
          pathname === "/docs" ? "text-link" : "text-foreground hover:text-link",
        )}
      >
        Introduction
      </Link>

      {groups.map((group) => (
        <div key={group.category}>
          <p className="text-xs font-medium text-muted-foreground">{group.category}</p>
          <ul className="mt-2.5 flex flex-col gap-0.5 border-l border-border">
            {group.items.map((item) => {
              const href = `/docs/components/${item.slug}`;
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "-ml-px block border-l py-1 pl-3 transition-colors",
                      active
                        ? "border-link font-medium text-link"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
