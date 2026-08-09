"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxIcon,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxSearchIcon,
} from "@/components/ui/combobox";

const timezoneGroups = [
  { region: "Americas", items: ["New York", "Chicago", "Denver", "Los Angeles"] },
  { region: "Europe", items: ["London", "Berlin", "Madrid", "Istanbul"] },
  { region: "Asia", items: ["Tokyo", "Singapore", "Mumbai", "Dubai"] },
];

export default function ComboboxGroupsExample() {
  const [value, setValue] = useState<string | null>(null);
  // ComboboxList hands back an index per group, not per leaf item — groups
  // render their own items via a plain `.map()` here, so proximity hover's
  // index (which needs to be unique across the *whole* popup, not restart
  // at 0 per group) is tracked with a running counter instead.
  let index = 0;

  return (
    <div className="w-full max-w-xs">
      <Combobox items={timezoneGroups} value={value} onValueChange={setValue}>
        <ComboboxInputGroup>
          <ComboboxSearchIcon />
          <ComboboxInput placeholder="Search timezones…" />
          <ComboboxIcon />
        </ComboboxInputGroup>
        <ComboboxContent>
          <ComboboxEmpty>No timezone found.</ComboboxEmpty>
          <ComboboxList>
            {(group: { region: string; items: string[] }) => (
              <ComboboxGroup key={group.region} items={group.items}>
                <ComboboxGroupLabel>{group.region}</ComboboxGroupLabel>
                {group.items.map((timezone) => (
                  <ComboboxItem key={timezone} value={timezone} index={index++}>
                    {timezone}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
