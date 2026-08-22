"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";

const items = ["Wi-Fi", "Bluetooth", "Location Services", "Notifications"];

export default function CheckboxBasicExample() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({ "Wi-Fi": true });

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- see Checkbox's own note in single.tsx
        <label key={item} className="flex items-center gap-2.5">
          <Checkbox
            checked={checkedItems[item] ?? false}
            onCheckedChange={(next) => setCheckedItems((prev) => ({ ...prev, [item]: next }))}
          />
          <span className="text-body text-foreground">{item}</span>
        </label>
      ))}
    </div>
  );
}
