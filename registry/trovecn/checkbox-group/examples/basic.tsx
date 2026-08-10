"use client";

import { useState } from "react";

import { CheckboxGroup, CheckboxGroupItem } from "@/components/ui/checkbox";

const todos = [
  { name: "wireframes", label: "Sketch wireframes" },
  { name: "review", label: "Review with design" },
  { name: "copy", label: "Write onboarding copy" },
  { name: "build", label: "Build the empty states" },
  { name: "qa", label: "QA on staging" },
  { name: "ship", label: "Ship to production" },
];

// Pre-checked non-contiguously (rows 1, 3, 4, 5) so checking "Write
// onboarding copy" (row 2) bridges two existing runs into one merged block,
// and unchecking any interior row splits it back apart.
export default function CheckboxGroupBasicExample() {
  const [value, setValue] = useState<string[]>(["review", "build", "qa", "ship"]);

  return (
    <div className="w-full max-w-sm">
      <CheckboxGroup value={value} onValueChange={setValue}>
        {todos.map((todo) => (
          <CheckboxGroupItem key={todo.name} name={todo.name}>
            {todo.label}
          </CheckboxGroupItem>
        ))}
      </CheckboxGroup>
    </div>
  );
}
