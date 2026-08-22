"use client";

import { SelectionToolbar } from "@/components/trovecn/inputs/selection-toolbar";

/**
 * A narrow column, so any selection worth formatting wraps onto a second
 * line. Drag downward across the wrap and the toolbar flips below the line
 * the drag ended on, rather than sitting on top of the text it is about to
 * format.
 */
export default function SelectionToolbarWrappedExample() {
  return (
    <div className="w-full max-w-[19rem]">
      <SelectionToolbar>
        <div
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="rounded-lg border border-border p-4 text-body leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p>
            A selection that wraps has one client rect per line and a bounding box as wide as the
            whole column, which is why the anchor is a line rather than the box.
          </p>
        </div>
      </SelectionToolbar>
    </div>
  );
}
