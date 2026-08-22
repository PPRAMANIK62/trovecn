"use client";

import { Switch } from "@/components/ui/switch";

export default function SwitchSizesExample() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders a real hidden <input> alongside its visual span, so wrapping it in <label> does associate a control; the rule can't see through the component boundary to confirm it. */}
      <label className="flex items-center gap-2">
        <Switch size="sm" />
        <span className="text-caption text-muted-foreground">sm</span>
      </label>
      {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- see above */}
      <label className="flex items-center gap-2">
        <Switch size="default" />
        <span className="text-caption text-muted-foreground">default</span>
      </label>
    </div>
  );
}
