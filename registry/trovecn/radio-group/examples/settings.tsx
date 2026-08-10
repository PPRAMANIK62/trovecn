"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const options = [
  {
    value: "everyone",
    label: "Everyone",
    description: "Anyone can see and reply to this post.",
  },
  {
    value: "followers",
    label: "Followers",
    description: "Only people who follow you can reply.",
  },
  {
    value: "mentioned",
    label: "Only people you mention",
    description: "Replies are limited to accounts you tag.",
  },
];

export default function RadioGroupSettingsExample() {
  return (
    <RadioGroup defaultValue="followers" className="w-full max-w-sm">
      {options.map((option) => (
        <RadioGroupItem key={option.value} value={option.value}>
          <span className="flex flex-col gap-0.5">
            <span className="text-control text-foreground">{option.label}</span>
            <span className="text-caption text-muted-foreground">{option.description}</span>
          </span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
