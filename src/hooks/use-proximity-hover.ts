"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

export interface ItemRect {
  top: number;
  height: number;
  left: number;
  width: number;
}

/**
 * Shared visual for every proximity-hover consumer's transient "nearest
 * item" wash (Accordion, Tabs, DocsSidebar, DocsMobileSidebar, the Drawer
 * examples' nav/settings lists — anywhere `useProximityHover` drives a
 * pill). A faint --foreground tint reused as-is everywhere.
 */
export const proximityHoverWashClassName = "bg-hover";

/**
 * Cap on that wash's peak layer-opacity while animating in. At 1 (full
 * layer-opacity) the already-translucent wash lands close enough to a
 * persistent selected/expanded state built from a similarly light neutral
 * token (bg-card, bg-muted, bg-accent/20) to read as the same color,
 * especially in dark mode. 0.4 keeps it a clearly subordinate preview.
 */
export const proximityHoverWashOpacity = 0.4;

interface UseProximityHoverOptions {
  /**
   * Which direction to resolve the nearest item along.
   *   "y"  — vertical lists (default): closest by top/height
   *   "x"  — horizontal strips: closest by left/width
   *   "xy" — 2-D grids: closest card across both rows AND columns,
   *          measured by Euclidean distance to each item's center
   */
  axis?: "x" | "y" | "xy";
}

interface UseProximityHoverReturn {
  activeIndex: number | null;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
  itemRects: ItemRect[];
  /**
   * True once every registered item has been measured and no remeasure is
   * pending, i.e. `itemRects` describes the current item set. Gate absolutely
   * positioned overlays on it: an overlay that mounts against a rect a later
   * pass still corrects animates from the wrong place to the right one, which
   * reads as the highlight sliding in from another row.
   */
  isMeasured: boolean;
  sessionRef: RefObject<number>;
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  registerItem: (index: number, element: HTMLElement | null) => void;
  /**
   * Invalidates the published rects and runs the hook's coalesced measurement
   * pass again, holding `isMeasured` false until it settles. Reach for it when
   * something other than item registration invalidates layout — a popup that
   * stays mounted between opens keeps its items registered, so nothing else
   * would notice that its rects were taken while it was hidden.
   */
  remeasure: () => void;
  measureItems: () => void;
}

/**
 * How many frames the coalesced remeasure retries while the registered items
 * still have no layout box. A popup can be in the DOM one frame before it is
 * laid out; retrying beats publishing zeroed rects, and the cap keeps a list
 * that stays hidden for good from spinning frames forever.
 */
const measurementAttempts = 3;

/**
 * Drives "proximity hover": in an interactive list/grid, highlight the item
 * nearest the cursor before the user clicks, rather than only lighting up
 * on direct :hover. Consumers register their item elements by index and get
 * back the nearest index plus its rect, to position a moving highlight
 * behind the list.
 */
export function useProximityHover<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseProximityHoverOptions = {},
): UseProximityHoverReturn {
  const { axis = "y" } = options;
  const itemsRef = useRef(new Map<number, HTMLElement>());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [itemRects, setItemRects] = useState<ItemRect[]>([]);
  const [isMeasured, setIsMeasured] = useState(false);
  const [registerTick, setRegisterTick] = useState(0);
  const itemRectsRef = useRef<ItemRect[]>([]);
  const sessionRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const remeasureRafIdRef = useRef<number | null>(null);

  /**
   * Publishes a rect for every registered item. Returns false when the
   * measurement could not be completed (no container, or an item without a
   * layout box) — nothing is published in that case, so the last complete
   * measurement stands instead of being overwritten with zeroes.
   */
  const runMeasurement = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;
    const rects: ItemRect[] = [];
    let everyItemHasLayout = true;
    itemsRef.current.forEach((element, index) => {
      // An element inside a display:none / not-yet-laid-out popup has no
      // offsetParent and reports every offset as 0. Publishing that would pin
      // overlays to the top of the list, so treat the whole pass as
      // incomplete. A boxless element is the only case: `position: fixed`
      // items also have no offsetParent but do have a size.
      const hasLayoutBox =
        element.offsetParent !== null || element.offsetWidth > 0 || element.offsetHeight > 0;
      if (!hasLayoutBox) {
        everyItemHasLayout = false;
        return;
      }
      // Use offset* instead of getBoundingClientRect so measurements are
      // unaffected by CSS transforms (e.g. scaleY animation on the parent
      // motion.div). offsetTop/offsetLeft are layout values relative to the
      // offsetParent (the scroll container), matching the coordinate space
      // used by `position: absolute` children.
      rects[index] = {
        top: element.offsetTop,
        height: element.offsetHeight,
        left: element.offsetLeft,
        width: element.offsetWidth,
      };
    });
    if (!everyItemHasLayout) return false;
    // Skip the state update when nothing moved (a cheap top/left/width/height
    // compare) so redundant remeasures don't churn re-renders.
    const prev = itemRectsRef.current;
    let changed = prev.length !== rects.length;
    for (let i = 0; !changed && i < rects.length; i++) {
      const p = prev[i];
      const r = rects[i];
      if (p === r) continue; // both undefined (sparse slot)
      changed =
        !p ||
        !r ||
        p.top !== r.top ||
        p.left !== r.left ||
        p.width !== r.width ||
        p.height !== r.height;
    }
    if (changed) {
      itemRectsRef.current = rects;
      setItemRects(rects);
    }
    return true;
  }, [containerRef]);

  const measureItems = useCallback(() => {
    runMeasurement();
  }, [runMeasurement]);

  /**
   * The hook's single measurement pass: coalesces every trigger (item
   * registration, container resize) into one remeasure on the next frame and
   * is the only place readiness is reported, so `isMeasured` can never turn
   * true while another pass is still queued.
   */
  const scheduleMeasurement = useCallback(
    (attemptsLeft: number) => {
      if (remeasureRafIdRef.current !== null) {
        cancelAnimationFrame(remeasureRafIdRef.current);
      }
      remeasureRafIdRef.current = requestAnimationFrame(() => {
        remeasureRafIdRef.current = null;
        if (runMeasurement()) {
          setIsMeasured(true);
        } else if (attemptsLeft > 1) {
          scheduleMeasurement(attemptsLeft - 1);
        }
      });
    },
    [runMeasurement],
  );

  const remeasure = useCallback(() => {
    // Readiness drops first: until the pass below settles, the published rects
    // may not describe what is on screen, and an overlay positioned from them
    // would be corrected after mounting — which animates as a slide.
    setIsMeasured(false);
    scheduleMeasurement(measurementAttempts);
  }, [scheduleMeasurement]);

  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      itemsRef.current.set(index, element);
    } else {
      itemsRef.current.delete(index);
    }
    // Bump a tick rather than calling remeasure() directly. Consumers that
    // register items from a `useLayoutEffect` (e.g. Tabs) all fire within the
    // same pre-paint commit; React batches the resulting setState calls, so
    // the effect below runs once, after every sibling has registered, still
    // before the browser paints — no bare-then-populated flash on mount, and
    // no per-item measurement pass reading a still-partial item set.
    setRegisterTick((t) => t + 1);
  }, []);

  // Coalesced pass for registration changes specifically (see registerItem
  // above). Falls back to the rAF retry loop only when an item exists but
  // hasn't been laid out yet (e.g. it's inside a not-yet-visible popup) —
  // the same case `runMeasurement`/`scheduleMeasurement` already handle.
  useLayoutEffect(() => {
    if (registerTick === 0) return;
    if (runMeasurement()) {
      setIsMeasured(true);
    } else {
      setIsMeasured(false);
      scheduleMeasurement(measurementAttempts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerTick]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // React bubbles synthetic events along the component tree, not the DOM
      // tree, so a portaled descendant (e.g. NavigationMenuContent, teleported
      // into a shared Viewport elsewhere in the DOM) still reaches this
      // handler. Guard on real DOM containment so hovering that portaled
      // content can't drag the pill across unrelated trigger rects.
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        return;
      }

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();

        // ── 2-D grid path ──────────────────────────────────────────
        // When items wrap into rows and columns, a single-axis nearest pick
        // can't tell which card the cursor is closest to. Resolve by
        // Euclidean distance to each item's center, and prefer any item the
        // cursor is actually inside (point-in-rect).
        if (axis === "xy") {
          let closestIndex: number | null = null;
          let closestDistance = Infinity;
          let containingIndex: number | null = null;

          const rects = itemRectsRef.current;
          const scrollX = container.scrollLeft;
          const scrollY = container.scrollTop;
          const borderX = container.clientLeft;
          const borderY = container.clientTop;
          // Map layout coords into visual/viewport space, accounting for any
          // cumulative ancestor transform: scale (see the single-axis note
          // below). X and Y scale independently.
          const scaleX =
            container.offsetWidth > 0 ? containerRect.width / container.offsetWidth : 1;
          const scaleY =
            container.offsetHeight > 0 ? containerRect.height / container.offsetHeight : 1;

          for (let index = 0; index < rects.length; index++) {
            const r = rects[index];
            if (!r) continue;

            const left = containerRect.left + (borderX + r.left - scrollX) * scaleX;
            const top = containerRect.top + (borderY + r.top - scrollY) * scaleY;
            const width = r.width * scaleX;
            const height = r.height * scaleY;

            if (
              mouseX >= left &&
              mouseX <= left + width &&
              mouseY >= top &&
              mouseY <= top + height
            ) {
              containingIndex = index;
            }

            const dx = mouseX - (left + width / 2);
            const dy = mouseY - (top + height / 2);
            const distance = Math.hypot(dx, dy);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }

          setActiveIndex(containingIndex ?? closestIndex);
          return;
        }

        const mousePos = axis === "x" ? mouseX : mouseY;

        let closestIndex: number | null = null;
        let closestDistance = Infinity;
        let containingIndex: number | null = null;

        const rects = itemRectsRef.current;
        // Convert content-relative rects to viewport coords using live scroll.
        const scrollOffset = axis === "x" ? container.scrollLeft : container.scrollTop;
        const borderOffset = axis === "x" ? container.clientLeft : container.clientTop;
        const containerEdge = axis === "x" ? containerRect.left : containerRect.top;
        // Item rects are layout values (offset*); the container's bounding
        // rect reflects any cumulative ancestor transform: scale. Compute the
        // scale factor so we can map layout coords into the same visual
        // viewport space the mouse cursor lives in.
        const layoutSize = axis === "x" ? container.offsetWidth : container.offsetHeight;
        const visualSize = axis === "x" ? containerRect.width : containerRect.height;
        const scale = layoutSize > 0 ? visualSize / layoutSize : 1;

        for (let index = 0; index < rects.length; index++) {
          const r = rects[index];
          if (!r) continue;

          const contentPos = axis === "x" ? r.left : r.top;
          const itemStart = containerEdge + (borderOffset + contentPos - scrollOffset) * scale;
          const itemSize = (axis === "x" ? r.width : r.height) * scale;
          const itemEnd = itemStart + itemSize;

          if (mousePos >= itemStart && mousePos <= itemEnd) {
            containingIndex = index;
          }

          const itemCenter = itemStart + itemSize / 2;
          const distance = Math.abs(mousePos - itemCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }

        setActiveIndex(containingIndex ?? closestIndex);
      });
    },
    [axis, containerRef],
  );

  const handleMouseEnter = useCallback(() => {
    sessionRef.current += 1;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setActiveIndex(null);
  }, []);

  // Remeasure when the container resizes — a reflow moves items even though
  // the registered set is unchanged, which would otherwise leave itemRects
  // stale. Coalesced through the same rAF as register/unregister. Readiness
  // is deliberately not dropped: the item set is unchanged, so the published
  // rects stay usable, and hiding overlays on every reflow would flicker them.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => scheduleMeasurement(measurementAttempts));
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, scheduleMeasurement]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (remeasureRafIdRef.current !== null) {
        cancelAnimationFrame(remeasureRafIdRef.current);
      }
    };
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    itemRects,
    isMeasured,
    sessionRef,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    registerItem,
    remeasure,
    measureItems,
  };
}
