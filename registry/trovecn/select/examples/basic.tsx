"use client";

import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const frameworks = ["Next.js", "Remix", "Astro", "SvelteKit"];

export default function SelectBasicExample() {
  return (
    <Select defaultValue="Next.js">
      <SelectTrigger>
        <SelectValue placeholder="Pick a framework" />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          {frameworks.map((framework) => (
            <SelectItem key={framework} value={framework}>
              {framework}
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
