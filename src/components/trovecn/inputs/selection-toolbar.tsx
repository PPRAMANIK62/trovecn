"use client";

/**
 * SelectionToolbar formats a text selection, in an editor or a comment box.
 *
 * The signature detail is where it lands, not how it moves. Anchoring is the
 * hard part of this pattern and the part cheaper versions get wrong: the
 * toolbar arrives on the line the drag ended on, and flips below that line
 * when the line above is selected too. See `focusLineFor` and `sideFor`.
 *
 * Motion is minimal on purpose. The playbook says why.
 *
 * - **What changed?** A surface opened over a selection. That is the house
 *   popover's fade-and-travel from the trigger side, and nothing more. It runs
 *   on `spring.quick` where the house popover uses `spring.moderate`. A 36px
 *   strip that appears on every selection belongs to the tooltip tier, and
 *   `springs.ts` scopes the two tiers that way.
 * - **How often is this seen?** Every time you select text. At that frequency,
 *   a reviewer who notices the animation has found too much of it.
 *
 * An earlier version had a link mode, a URL field that replaced the controls
 * in place. It is gone, and so is the `CSS.highlights` repaint that existed
 * only to survive it. What is left formats a selection and nothing else.
 * `docs/decisions.md` keeps the findings from that version. They still hold
 * for the platform, but they no longer describe this file.
 *
 * Three things measured in Chrome 150 rather than assumed. The candidate entry
 * in `docs/signature-components.md` guessed most of them wrong, which is the
 * `ScrubField` lesson in `docs/decisions.md` repeating itself.
 *
 * 1. A toolbar button taking focus does not destroy the selection, but it
 *    does move the caret, so controls refuse focus on `mousedown`. Only an
 *    editable control collapses a selection outright, and the URL field was
 *    the only one this component had.
 * 2. Base UI's Positioner has no `middleware` prop, so floating-ui's
 *    `inline()` is unreachable even though Base UI re-exports it. So
 *    `focusLineFor` builds the anchor rect by hand from
 *    `range.getClientRects()`, which is the better answer anyway. See
 *    `focusLineFor` and `sideFor`.
 * 3. Opening synchronously on `pointerup` puts the popup on screen before the
 *    `click` that follows, and Base UI reads that click as an outside press.
 *    See the note in `commit`.
 */

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { motion, useReducedMotion } from "motion/react";
import { Bold, Italic, Strikethrough } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";

/** Stand-in for "no selection yet". A plain object rather than
 *  `new DOMRect()`, because this module is evaluated during SSR and `DOMRect`
 *  is not defined in Node. Base UI only ever calls `getBoundingClientRect`,
 *  so the shape is all it needs. */
const EMPTY_RECT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  toJSON: () => ({}),
} as DOMRect;

/** What an action is handed. The range is live on the document by the time
 *  `run` is called, so `document.execCommand` and editor APIs that read the
 *  selection both work without further setup. */
export interface SelectionContext {
  range: Range;
  text: string;
}

export interface SelectionAction {
  /** Stable across renders; used for React keys and pressed state. */
  id: string;
  /** Accessible name of the control. */
  label: string;
  icon: React.ReactNode;
  run: (context: SelectionContext) => void;
  /** Reflected as `aria-pressed` and a filled control. Evaluated while the
   *  selection is still live, never after focus has moved. */
  isActive?: (context: SelectionContext) => boolean;
}

/**
 * The `contenteditable` convenience set, and the default.
 *
 * `document.execCommand` is deprecated and still the only thing that formats
 * a bare `contenteditable` without pulling in an editor framework. It sits
 * outside the component body on purpose. Pass your own `actions` and the
 * component never calls it. A Tiptap or ProseMirror caller runs its own
 * commands here, and this list is dead code they can delete.
 */
export const richTextActions: SelectionAction[] = [
  {
    id: "bold",
    label: "Bold",
    icon: <Bold className="size-3.5" />,
    run: () => document.execCommand("bold"),
    isActive: () => document.queryCommandState("bold"),
  },
  {
    id: "italic",
    label: "Italic",
    icon: <Italic className="size-3.5" />,
    run: () => document.execCommand("italic"),
    isActive: () => document.queryCommandState("italic"),
  },
  {
    id: "strikethrough",
    label: "Strikethrough",
    icon: <Strikethrough className="size-3.5" />,
    // Emits `<strike>`, not `<s>` and not a `text-decoration` style. Checked
    // in the browser. Callers who want either one pass their own `actions`.
    run: () => document.execCommand("strikeThrough"),
    isActive: () => document.queryCommandState("strikeThrough"),
  },
];

interface FocusLine {
  rect: DOMRect;
  /** Index of that rect among the selection's line boxes. */
  index: number;
}

/**
 * The line box holding the end of the selection, not the box around all of
 * them. `getClientRects()` returns one rect per line, and the last one is
 * wrong for a backwards selection, so this goes by the focus point.
 *
 * Measured case: a two-line selection with rects at x=297 and x=49, bounding
 * box x=49 w=545 centring at 321, focus point at 251. A bounding-box anchor
 * puts the toolbar 70px from where the drag ended, on a line nobody was
 * looking at.
 */
function focusLineFor(range: Range, focusNode: Node | null, focusOffset: number): FocusLine {
  const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 || r.height > 0);
  if (rects.length === 0) return { rect: range.getBoundingClientRect(), index: 0 };
  if (rects.length === 1) return { rect: rects[0], index: 0 };

  const last = { rect: rects[rects.length - 1], index: rects.length - 1 };
  if (!focusNode) return last;

  const caret = document.createRange();
  try {
    caret.setStart(focusNode, focusOffset);
  } catch {
    return last;
  }
  caret.collapse(true);
  const point = caret.getBoundingClientRect();

  // A one pixel tolerance: the caret rect is a hair taller than the text run.
  const index = rects.findIndex((r) => point.top >= r.top - 1 && point.bottom <= r.bottom + 1);
  return index === -1 ? last : { rect: rects[index], index };
}

/**
 * Above the focus line, unless that would cover selected text.
 *
 * Anchoring to the focus line puts the toolbar where the drag ended, which is
 * the point, but on a downward multi-line selection the line above is
 * selected. Measured: a two-line selection anchored `top` had the toolbar
 * bottom at y=154 with the focus line starting at y=162, sitting squarely on
 * the selected first line. Any focus line that is not the topmost one flips
 * the toolbar below, so it never hides what it is about to format.
 */
function sideFor(line: FocusLine): "top" | "bottom" {
  return line.index === 0 ? "top" : "bottom";
}

/**
 * The editing host the range lives in.
 *
 * Restoring a range is not enough on its own. `execCommand` and most editor
 * commands operate on the *focused* editable, so a range sitting on the
 * document while focus is elsewhere looks correct and formats nothing. That
 * failure is silent, which is how it survived a round of testing back when
 * link mode could move focus. Focus should never leave now, since every
 * control refuses it on `mousedown`. But `run` promises a focused host, and a
 * custom action that moves focus should not break the next press. Walking up
 * to the element that carries the attribute matters too, because
 * `isContentEditable` is true for every descendant and a `<b>` is not
 * focusable.
 */
function editingHostFor(node: Node): HTMLElement | null {
  let el: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  while (el) {
    if (el.hasAttribute("contenteditable") && el.isContentEditable) return el;
    el = el.parentElement;
  }
  return null;
}

/** Every control refuses focus. The caret has to stay where it was. */
function holdFocus(e: React.MouseEvent) {
  e.preventDefault();
}

export interface SelectionToolbarProps {
  /** The editable region to watch. Rendered inside a wrapper this component
   *  owns; a selection whose common ancestor falls outside it is ignored. */
  children: React.ReactNode;
  /** Controls shown in the toolbar, left to right. */
  actions?: SelectionAction[];
  className?: string;
}

export function SelectionToolbar({
  children,
  actions = richTextActions,
  className,
}: SelectionToolbarProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /** The saved selection. `focusNode`/`focusOffset` are kept alongside the
   *  range because a Range is always start-to-end in document order and so
   *  cannot say which end the user finished on. */
  const savedRef = React.useRef<{ range: Range; focusNode: Node; focusOffset: number } | null>(
    null,
  );

  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"top" | "bottom">("top");
  const [activeIds, setActiveIds] = React.useState<string[]>([]);

  const reduceMotion = useReducedMotion();

  const close = React.useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
    setOpen(false);
    setActiveIds([]);
    savedRef.current = null;
  }, []);

  /** Put the saved range back and focus its host before an action runs, so
   *  `run` gets the context it promises no matter what the previous action
   *  did. See `editingHostFor`. */
  const restoreSelection = React.useCallback((): SelectionContext | null => {
    const saved = savedRef.current;
    const sel = window.getSelection();
    if (!saved || !sel) return null;
    const range = saved.range.cloneRange();
    editingHostFor(range.startContainer)?.focus({ preventScroll: true });
    sel.removeAllRanges();
    sel.addRange(range);
    return { range, text: range.toString() };
  }, []);

  /** Snapshot the live selection, work out which side the toolbar takes, and
   *  read each action's pressed state. All three need the selection alive. */
  const save = React.useCallback(
    (sel: Selection, range: Range) => {
      const focusNode = sel.focusNode ?? range.endContainer;
      const focusOffset = sel.focusNode ? sel.focusOffset : range.endOffset;
      savedRef.current = { range: range.cloneRange(), focusNode, focusOffset };
      setSide(sideFor(focusLineFor(range, focusNode, focusOffset)));

      const context: SelectionContext = { range, text: range.toString() };
      setActiveIds(actions.filter((action) => action.isActive?.(context)).map((a) => a.id));
    },
    [actions],
  );

  const readSelection = React.useCallback(() => {
    const sel = window.getSelection();
    const root = rootRef.current;
    if (!sel || !root || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    return { sel, range };
  }, []);

  // Open on release, never mid-drag. A toolbar that tracks a growing
  // selection is chasing a target the user is still aiming.
  React.useEffect(() => {
    function commit() {
      const found = readSelection();
      if (!found) {
        close();
        return;
      }
      save(found.sel, found.range);
      // Deferred by one task, not for taste. Opening synchronously on
      // `pointerup` puts the popup on screen before the `click` that follows
      // it, and Base UI reads that click as a press outside the popup and
      // dismisses it in the same beat. Measured: `onOpenChange(false)` fired
      // with no event attached, immediately after every open. Letting the
      // gesture's events drain first costs a frame nobody can see.
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = setTimeout(() => setOpen(true), 0);
    }

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) {
        draggingRef.current = true;
        close();
      }
    }
    function onPointerUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      commit();
    }
    function onKeyUp(e: KeyboardEvent) {
      if (!e.shiftKey && e.key !== "Shift") return;
      if (!rootRef.current?.contains(document.activeElement)) return;
      commit();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("keyup", onKeyUp);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, [close, readSelection, save]);

  const anchor = React.useMemo(
    () => ({
      getBoundingClientRect: () => {
        const saved = savedRef.current;
        if (!saved) return EMPTY_RECT;
        return focusLineFor(saved.range, saved.focusNode, saved.focusOffset).rect;
      },
    }),
    [],
  );

  function runAction(action: SelectionAction) {
    const context = restoreSelection();
    if (!context) return;
    action.run(context);
    const found = readSelection();
    if (found) save(found.sel, found.range);
  }

  return (
    <>
      <div ref={rootRef} data-slot="selection-toolbar-root" className={className}>
        {children}
      </div>

      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            data-slot="selection-toolbar-positioner"
            anchor={anchor}
            side={side}
            align="center"
            sideOffset={8}
            className="z-50"
          >
            <PopoverPrimitive.Popup
              data-slot="selection-toolbar"
              initialFocus={false}
              finalFocus={false}
              render={(popupProps, state) => {
                const exiting = state.transitionStatus === "ending";
                const travel = reduceMotion ? 0 : state.side === "bottom" ? -4 : 4;
                return (
                  <motion.div
                    {...(popupProps as Record<string, unknown>)}
                    className="flex h-9 items-center gap-0.5 rounded-lg bg-popover px-1 shadow-popover outline-none"
                    initial={{ opacity: 0, y: travel }}
                    animate={{ opacity: exiting ? 0 : 1, y: exiting ? travel : 0 }}
                    transition={exiting ? spring.quick.exit : spring.quick.enter}
                  >
                    {actions.map((action) => (
                      <ToolbarButton
                        key={action.id}
                        label={action.label}
                        pressed={activeIds.includes(action.id)}
                        onMouseDown={holdFocus}
                        onClick={() => runAction(action)}
                      >
                        {action.icon}
                      </ToolbarButton>
                    ))}
                  </motion.div>
                );
              }}
            />
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  );
}

/**
 * The house `Button` at `icon-sm`, already the 28px control this wants.
 *
 * A hand-rolled version drifted, which is the argument for not hand-rolling
 * one. It paired `active:scale` with a `transition-colors` that does not
 * cover `transform`, so the press snapped in and snapped back with no
 * duration at all, and it shipped no focus ring. Press feedback, the focus
 * ring, and disabled handling now come from one place.
 *
 * The washes are the one override. `ghost` hovers to `--muted`, which
 * `globals.css` says goes nearly invisible on `--popover`: 0.295 against
 * popover's 0.3 in dark mode. `--hover` and `--active` are the
 * foreground-tinted washes for that case, so a control on a floating surface
 * reads like one on the page. Restate the `dark:` variant or `ghost`'s own
 * `dark:hover:bg-muted/50` outranks the override.
 */
function ToolbarButton({
  label,
  pressed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; pressed?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-pressed={pressed}
      data-slot="selection-toolbar-button"
      className={cn(
        "text-popover-foreground hover:bg-hover dark:hover:bg-hover",
        "aria-pressed:bg-active aria-pressed:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
