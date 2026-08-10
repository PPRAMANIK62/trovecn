"use client";

import { useState } from "react";

import { CheckboxGroup, CheckboxGroupItem } from "@/components/ui/checkbox";

const permissions = [
  {
    name: "read",
    title: "Read access",
    description: "View files and folders in this workspace.",
  },
  {
    name: "comment",
    title: "Comment",
    description: "Leave comments on shared documents.",
  },
  {
    name: "write",
    title: "Write access",
    description: "Create and edit files.",
  },
  {
    name: "invite",
    title: "Invite members",
    description: "Add new people to this workspace.",
  },
  {
    name: "billing",
    title: "Manage billing",
    description: "View and change the subscription plan.",
  },
];

export default function CheckboxGroupSettingsExample() {
  const [value, setValue] = useState<string[]>(["read", "comment"]);

  return (
    <div className="w-full max-w-sm">
      <CheckboxGroup value={value} onValueChange={setValue}>
        {permissions.map((permission) => (
          <CheckboxGroupItem key={permission.name} name={permission.name}>
            <span className="flex flex-col gap-0.5">
              <span className="text-control text-foreground">{permission.title}</span>
              <span className="text-caption text-muted-foreground">{permission.description}</span>
            </span>
          </CheckboxGroupItem>
        ))}
      </CheckboxGroup>
    </div>
  );
}
