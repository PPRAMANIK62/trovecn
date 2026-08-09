"use client";

import { Switch } from "@/components/ui/switch";

export default function SwitchSettingsRowExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- Switch renders a real hidden <input> alongside its visual span, so wrapping it in <label> does associate a control; the rule can't see through the component boundary to confirm it. */}
      <label className="flex items-center justify-between gap-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-control text-foreground">Email notifications</span>
          <span className="text-caption text-muted-foreground">
            Get notified when someone mentions you.
          </span>
        </span>
        <Switch defaultChecked />
      </label>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- see above */}
      <label className="flex items-center justify-between gap-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-control text-foreground">Marketing emails</span>
          <span className="text-caption text-muted-foreground">
            Managed by your workspace admin.
          </span>
        </span>
        <Switch disabled />
      </label>
    </div>
  );
}
