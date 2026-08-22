"use client";

import { SelectionToolbar } from "@/components/trovecn/inputs/selection-toolbar";

/**
 * Prose wide enough that a selection can stay on one line. This is the case
 * where the toolbar takes its conventional place above the text, because
 * nothing selected sits above the line the drag ended on.
 */
export default function SelectionToolbarBasicExample() {
  return (
    <div className="w-full max-w-lg">
      <SelectionToolbar>
        <div
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="rounded-lg border border-border p-4 text-body leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p>
            Sonner spread the way it did because the stacking animation had been done before and
            never open sourced. Recognition and availability, both halves.
          </p>
        </div>
      </SelectionToolbar>
    </div>
  );
}
