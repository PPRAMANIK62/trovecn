"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    value: "getting-started",
    title: "Getting started",
    body: "Install the primitive and compose Accordion/AccordionItem/AccordionTrigger/AccordionContent — every item gets proximity hover automatically.",
  },
  {
    value: "proximity",
    title: "Proximity hover",
    body: "Move the cursor down the list — the highlight follows the nearest row before you click, previewing where it will land.",
  },
  {
    value: "keyboard",
    title: "Keyboard & accessibility",
    body: "Built on Base UI's Accordion primitive: full keyboard navigation, focus management, and ARIA wiring come for free.",
  },
];

export default function AccordionSingleExpandExample() {
  return (
    <Accordion type="single" defaultValue="proximity" className="max-w-sm">
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
