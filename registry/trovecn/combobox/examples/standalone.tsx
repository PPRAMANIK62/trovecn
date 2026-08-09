"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxIcon,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxSearchIcon,
} from "@/components/ui/combobox";

const frameworks = ["Next.js", "Remix", "Astro", "SvelteKit", "Nuxt", "SolidStart"];

export default function ComboboxStandaloneExample() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xs">
      <Combobox items={frameworks} value={value} onValueChange={setValue}>
        <ComboboxInputGroup>
          <ComboboxSearchIcon />
          <ComboboxInput placeholder="Search frameworks…" />
          <ComboboxClear />
          <ComboboxIcon />
        </ComboboxInputGroup>
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string, index) => (
              <ComboboxItem key={item} value={item} index={index}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
