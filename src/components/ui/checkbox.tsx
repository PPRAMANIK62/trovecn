"use client";

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { useMergeSplit } from "@/hooks/use-merge-split";

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "inputRef">;

const Checkbox = forwardRef<HTMLElement, CheckboxProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      indeterminate = false,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false);
    const checked = checkedProp ?? uncontrolledChecked;

    const applyChecked = (
      next: boolean,
      eventDetails: CheckboxPrimitive.Root.ChangeEventDetails,
    ) => {
      if (checkedProp === undefined) setUncontrolledChecked(next);
      onCheckedChange?.(next, eventDetails);
    };

    const hasMountedRef = useRef(false);
    useEffect(() => {
      hasMountedRef.current = true;
    }, []);

    const reduceMotion = useReducedMotion();
    const markEnterTransition =
      reduceMotion || !hasMountedRef.current
        ? { duration: 0 }
        : { ...spring.quick.enter, delay: 0.06 };
    const markExitTransition = reduceMotion ? { duration: 0 } : spring.fast.exit;

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        checked={checked}
        disabled={disabled}
        indeterminate={indeterminate}
        onCheckedChange={applyChecked}
        className={cn(
          "relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-input bg-transparent outline-none transition-colors duration-fast hover:border-foreground/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-primary data-checked:hover:bg-primary/90 data-indeterminate:border-primary data-indeterminate:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:border-input aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          keepMounted
          data-slot="checkbox-indicator"
          className="pointer-events-none flex items-center justify-center text-primary-foreground"
        >
          <AnimatePresence initial={false}>
            {indeterminate ? (
              <motion.svg
                key="indeterminate"
                viewBox="0 0 24 24"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 12H19"
                  initial={{ pathLength: hasMountedRef.current ? 0 : 1 }}
                  animate={{ pathLength: 1, transition: markEnterTransition }}
                  exit={{ pathLength: 0, transition: markExitTransition }}
                />
              </motion.svg>
            ) : (
              checked && (
                <motion.svg
                  key="check"
                  viewBox="0 0 24 24"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M4 12L9 17L20 6"
                    // Reads hasMountedRef during render (not inside an
                    // effect): the very first render of an already-checked
                    // item happens before the mount effect below has had a
                    // chance to flip the ref, so it starts fully drawn
                    // (pathLength 1) instead of drawing in from 0.
                    initial={{ pathLength: hasMountedRef.current ? 0 : 1 }}
                    animate={{
                      pathLength: 1,
                      transition: markEnterTransition,
                    }}
                    exit={{ pathLength: 0, transition: markExitTransition }}
                  />
                </motion.svg>
              )
            )}
          </AnimatePresence>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = "Checkbox";

// ─── Contexts (CheckboxGroup) ─────────────────────────────────────────────────

interface CheckboxGroupContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  registerName: (index: number, name: string | null) => void;
  activeIndex: number | null;
  disabled: boolean;
  value: string[];
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

function useCheckboxGroupContext() {
  const ctx = useContext(CheckboxGroupContext);
  if (!ctx) throw new Error("CheckboxGroupItem must be used within a CheckboxGroup");
  return ctx;
}

type CheckboxGroupProps = Omit<CheckboxGroupPrimitive.Props, "children"> & {
  children: ReactNode;
};

const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      children,
      className,
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      ...rest
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
    const value = valueProp ?? uncontrolledValue;

    const namesRef = useRef<Map<number, string>>(new Map());
    const [namesTick, setNamesTick] = useState(0);

    const { activeIndex, itemRects, sessionRef, handlers, registerItem, measureItems } =
      useProximityHover(containerRef);

    const registerName = useCallback((index: number, name: string | null) => {
      if (name !== null) namesRef.current.set(index, name);
      else namesRef.current.delete(index);
      setNamesTick((t) => t + 1);
    }, []);

    useEffect(() => {
      measureItems();
    }, [measureItems, children]);

    const checkedIndices = useMemo(() => {
      const indices: number[] = [];
      namesRef.current.forEach((name, index) => {
        if (value.includes(name)) indices.push(index);
      });
      return indices;
      // namesTick invalidates the memo when the (ref-backed) names map
      // changes shape, since the map itself isn't a stable dependency.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, namesTick]);

    const { blocks, change } = useMergeSplit(checkedIndices, itemRects, activeIndex);
    const reduceMotion = useReducedMotion();

    const handleValueChange = useCallback(
      (next: string[], eventDetails: CheckboxGroupPrimitive.ChangeEventDetails) => {
        if (valueProp === undefined) setUncontrolledValue(next);
        onValueChange?.(next, eventDetails);
      },
      [valueProp, onValueChange],
    );

    // Scopes arrow-key row navigation to `[data-proximity-index]` row
    // wrappers rather than the inner `role="checkbox"` element — mirrors
    // Accordion's `data-proximity-index` on AccordionItem.
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const container = containerRef.current;
      if (!container) return;
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-proximity-index]");
      if (!row || !container.contains(row)) return;

      const rows = Array.from(
        container.querySelectorAll<HTMLElement>("[data-proximity-index]"),
      ).toSorted((a, b) => Number(a.dataset.proximityIndex) - Number(b.dataset.proximityIndex));
      const currentPos = rows.indexOf(row);
      if (currentPos === -1) return;
      const nextRow = rows[e.key === "ArrowDown" ? currentPos + 1 : currentPos - 1];
      if (!nextRow) return;

      e.preventDefault();
      nextRow.querySelector<HTMLElement>('[role="checkbox"]')?.focus();
    }, []);

    // Memoized: the group re-renders on every proximity-hover mousemove; a
    // fresh context object each time would re-render every item with it.
    const contextValue = useMemo<CheckboxGroupContextValue>(
      () => ({ registerItem, registerName, activeIndex, disabled, value }),
      [registerItem, registerName, activeIndex, disabled, value],
    );

    // Auto-index children by position, same as Accordion's indexedChildren —
    // callers never hand-thread an `index` prop just to get proximity hover.
    const indexedChildren = Children.map(children, (child, position) => {
      if (!isValidElement(child)) return child;
      const el = child as ReactElement<{ index?: number }>;
      return el.props.index !== undefined ? el : cloneElement(el, { index: position });
    });

    return (
      <CheckboxGroupContext.Provider value={contextValue}>
        <CheckboxGroupPrimitive
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          ref={(node: HTMLDivElement | null) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          data-slot="checkbox-group"
          onMouseEnter={handlers.onMouseEnter}
          onMouseMove={handlers.onMouseMove}
          onMouseLeave={handlers.onMouseLeave}
          onKeyDown={handleKeyDown}
          className={cn("relative flex w-full flex-col gap-0.5", className)}
          {...rest}
        >
          {/* Merged-selection background updates to its final shape
              immediately. The temporary overlay below supplies the local
              absorption/release cue for the row that actually changed. */}
          {blocks.map((block) => (
            <div
              key={block.key}
              className="pointer-events-none absolute rounded-lg bg-accent/20 dark:bg-accent/12"
              style={{
                top: block.top,
                left: block.left,
                width: block.width,
                height: block.height,
              }}
            />
          ))}

          <AnimatePresence initial={false}>
            {change && (
              <motion.div
                key={change.key}
                className="pointer-events-none absolute rounded-lg bg-accent/20 dark:bg-accent/12"
                style={{
                  top: change.rect.top,
                  left: change.rect.left,
                  width: change.rect.width,
                  height: change.rect.height,
                  transformOrigin: "center",
                }}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: change.checked ? 0 : 1, scaleY: change.checked ? 0.82 : 1 }
                }
                animate={{ opacity: 0, scaleY: change.checked ? 1 : 0.82 }}
                exit={{ opacity: 0, transition: spring.fast.exit }}
                transition={reduceMotion ? { duration: 0 } : spring.quick.enter}
              />
            )}
          </AnimatePresence>

          {/* Hover pill — tracks the item nearest the cursor, same faint
              foreground-tinted wash every proximity-hover consumer uses,
              capped below full layer-opacity so it stays subordinate to the
              persistent merge/split background above. */}
          <ProximityHoverPill
            activeRect={activeIndex !== null ? (itemRects[activeIndex] ?? null) : null}
            sessionKey={sessionRef.current}
          />

          {indexedChildren}
        </CheckboxGroupPrimitive>
      </CheckboxGroupContext.Provider>
    );
  },
);
CheckboxGroup.displayName = "CheckboxGroup";

// ─── CheckboxGroupItem ───────────────────────────────────────────────────────
// A row wrapping Checkbox — the whole row is the proximity-hover/merge-split
// unit (data-proximity-index), same shape as AccordionItem wrapping
// AccordionTrigger/AccordionContent.

interface CheckboxGroupItemProps extends Omit<HTMLAttributes<HTMLLabelElement>, "onChange"> {
  /** Identifies this row within the group — passed straight through to the inner Checkbox's `name`. */
  name: string;
  /** Position for proximity hover/merge-split — auto-assigned from child order; pass explicitly only to override it. */
  index?: number;
  disabled?: boolean;
  children: ReactNode;
}

const CheckboxGroupItem = forwardRef<HTMLLabelElement, CheckboxGroupItemProps>(
  ({ name, index, disabled = false, children, className, ...props }, ref) => {
    const ctx = useCheckboxGroupContext();
    const internalRef = useRef<HTMLLabelElement>(null);

    useEffect(() => {
      if (index === undefined) return;
      ctx.registerItem(index, internalRef.current);
      return () => ctx.registerItem(index, null);
    }, [index, ctx]);

    useEffect(() => {
      if (index === undefined) return;
      ctx.registerName(index, name);
      return () => ctx.registerName(index, null);
    }, [index, ctx, name]);

    return (
      // eslint-disable-next-line jsx-a11y/label-has-associated-control -- Checkbox renders a real hidden <input> beside its visual span, so wrapping it in <label> does associate a control; the rule can't see through the component boundary to confirm it.
      <label
        ref={(node: HTMLLabelElement | null) => {
          (internalRef as React.MutableRefObject<HTMLLabelElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLLabelElement | null>).current = node;
        }}
        data-slot="checkbox-group-item"
        data-proximity-index={index}
        className={cn(
          "relative z-10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 select-none",
          disabled || ctx.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
        {...props}
      >
        <Checkbox name={name} checked={ctx.value.includes(name)} disabled={disabled} />
        <span className="flex-1 text-body text-foreground">{children}</span>
      </label>
    );
  },
);
CheckboxGroupItem.displayName = "CheckboxGroupItem";

export { Checkbox, CheckboxGroup, CheckboxGroupItem };
