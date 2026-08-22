"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxSingleExample() {
  const [checked, setChecked] = useState(false);

  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Checkbox renders a real hidden <input> beside its visual span, so wrapping it in <label> does associate a control; the rule can't see through the component boundary to confirm it.
    <label className="flex max-w-sm items-start gap-2.5">
      <Checkbox checked={checked} onCheckedChange={setChecked} className="mt-0.5" />
      <span className="text-body text-foreground">
        I agree to the <span className="text-link underline">terms of service</span> and{" "}
        <span className="text-link underline">privacy policy</span>.
      </span>
    </label>
  );
}
