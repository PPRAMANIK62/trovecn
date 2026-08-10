"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timezoneGroups = [
  {
    region: "Americas",
    zones: ["New York", "Chicago", "Denver", "Los Angeles"],
  },
  {
    region: "Europe",
    zones: ["London", "Berlin", "Athens"],
  },
  {
    region: "Asia / Pacific",
    zones: ["Tokyo", "Singapore", "Sydney"],
  },
];

export default function SelectGroupedExample() {
  return (
    <Select defaultValue="Berlin">
      <SelectTrigger>
        <SelectValue placeholder="Pick a timezone" />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          {timezoneGroups.map((group) => (
            <SelectGroup key={group.region}>
              <SelectGroupLabel>{group.region}</SelectGroupLabel>
              {group.zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
