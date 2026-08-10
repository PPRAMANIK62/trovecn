"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const plans = [
  { value: "starter", name: "Starter", price: "$9/mo" },
  { value: "pro", name: "Pro", price: "$29/mo" },
  { value: "team", name: "Team", price: "$79/mo" },
];

export default function RadioGroupBasicExample() {
  return (
    <RadioGroup defaultValue="pro" className="w-full max-w-xs">
      {plans.map((plan) => (
        <RadioGroupItem key={plan.value} value={plan.value}>
          <span className="flex items-center justify-between">
            <span>{plan.name}</span>
            <span className="text-caption text-muted-foreground">{plan.price}</span>
          </span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
