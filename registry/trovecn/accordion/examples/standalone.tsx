"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AccordionStandaloneExample() {
  return (
    <Accordion type="single" defaultValue="what" className="max-w-sm">
      <AccordionItem value="what">
        <AccordionTrigger>What is this component?</AccordionTrigger>
        <AccordionContent>
          A collapsible accordion with animated expand/collapse and a spring-driven chevron.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="motion">
        <AccordionTrigger>How does the motion work?</AccordionTrigger>
        <AccordionContent>
          Height animates to a measured pixel target with spring.moderate, not height: auto — that
          keeps the spring from overshooting.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
