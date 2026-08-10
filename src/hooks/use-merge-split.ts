"use client";

import { useEffect, useMemo, useRef } from "react";

import type { ItemRect } from "@/hooks/use-proximity-hover";

/**
 * Groups the currently-checked rows of a proximity-hover list into
 * contiguous "runs" (checked indices `[1,2,4,5,6]` → runs `[[1,2],[4,5,6]]`)
 * and reports one background-block rect per run, spanning from the top of
 * the run's first item to the bottom of its last — so contiguous checked
 * rows read as one continuous selection block instead of N separately
 * highlighted rows. Reuses `useProximityHover`'s own `itemRects` measurement
 * plumbing rather than measuring anything itself.
 *
 * The technique (not the file) is ported from fluidfunctionalism.com's
 * `useMergeSplitBlocks` (MIT, `registry/default/hooks/use-merge-split.tsx`)
 * — reimplemented here from a written description of the behavior (no
 * network access to the original source), and deliberately simpler than
 * their exact "instant zero-shift swap on commit" micro-choreography: a run
 * keeps its identity (and springs to its new extent) across renders where it
 * shares at least one checked index with a run from the previous commit;
 * when a run instead needs a *fresh* identity — because a single run just
 * split into two — the newly split-off piece is handed the old shared
 * run's rect as `initialRect`, so consumers can start its spring from there
 * instead of popping in already at its own smaller size. Merged-away runs
 * simply drop out of the returned array while the surviving block springs
 * outward to cover them. Reconciliation also guarantees unique output keys:
 * a split can otherwise reuse a prior run's geometry-derived key for both
 * pieces in the same render.
 */

export interface MergeSplitBlock {
  /** Stable identity across renders — reused by a run's continuation
   *  (growing/shrinking in place) so Framer Motion animates it instead of
   *  remounting; changes only when a run has no relationship to a run from
   *  the previous commit. */
  key: string;
  /** The checked indices this block currently spans. */
  indices: number[];
  top: number;
  left: number;
  width: number;
  height: number;
  /** Present only on the commit a run is first split off from a larger
   *  shared block — the old, larger rect it should spring apart *from*
   *  instead of mounting fresh already at its own smaller extent. */
  initialRect?: { top: number; left: number; width: number; height: number };
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface RunRecord {
  key: string;
  indices: number[];
  rect: Rect;
}

function computeRuns(
  checkedIndices: readonly number[],
  itemRects: readonly ItemRect[],
): RunRecord[] {
  const sorted = [...checkedIndices].toSorted((a, b) => a - b);
  const groups: number[][] = [];
  for (const idx of sorted) {
    const current = groups[groups.length - 1];
    if (current && idx === current[current.length - 1] + 1) {
      current.push(idx);
    } else {
      groups.push([idx]);
    }
  }

  const runs: RunRecord[] = [];
  for (const indices of groups) {
    const first = itemRects[indices[0]];
    const last = itemRects[indices[indices.length - 1]];
    // Not measured yet (item just registered, layout pending) — skip this
    // run for now rather than publish a zeroed rect; it appears once
    // useProximityHover's own measurement pass settles.
    if (!first || !last) continue;
    runs.push({
      key: `run:${indices[0]}-${indices[indices.length - 1]}`,
      indices,
      rect: {
        top: first.top,
        left: first.left,
        width: first.width,
        height: last.top + last.height - first.top,
      },
    });
  }
  return runs;
}

function claimUniqueKey(preferredKey: string, claimedKeys: Set<string>) {
  if (!claimedKeys.has(preferredKey)) {
    claimedKeys.add(preferredKey);
    return preferredKey;
  }

  let suffix = 2;
  while (claimedKeys.has(`${preferredKey}:${suffix}`)) suffix += 1;
  const key = `${preferredKey}:${suffix}`;
  claimedKeys.add(key);
  return key;
}

function reconcile(newRuns: RunRecord[], prevRuns: RunRecord[]): MergeSplitBlock[] {
  const claimedPrimaryKeys = new Set<string>();
  const outputKeys = new Set<string>();

  return newRuns.map((run) => {
    const runIndexSet = new Set(run.indices);
    const overlapping = prevRuns.filter((p) => p.indices.some((i) => runIndexSet.has(i)));

    if (overlapping.length === 0) {
      // No relationship to any previous run — a brand new isolated block.
      return { key: claimUniqueKey(run.key, outputKeys), indices: run.indices, ...run.rect };
    }

    // Prefer the previous run with the most shared indices as the
    // "primary" continuation — the one that keeps its key and springs to
    // the new extent (this is the growing side of a merge, or the
    // continuing side of a split). Ties break toward the first found
    // (lowest starting index, since prevRuns is index-sorted).
    let primary = overlapping[0];
    for (const candidate of overlapping) {
      if (candidate.indices.length > primary.indices.length) primary = candidate;
    }

    if (!claimedPrimaryKeys.has(primary.key) && !outputKeys.has(primary.key)) {
      claimedPrimaryKeys.add(primary.key);
      outputKeys.add(primary.key);
      return { key: primary.key, indices: run.indices, ...run.rect };
    }

    // `primary.key` was already claimed by another new run this pass: one
    // previous run's indices now span two-plus new runs — a split. This run
    // is the secondary piece peeling off, so start it from the old shared
    // rect rather than popping in already at its own smaller size.
    return {
      key: claimUniqueKey(run.key, outputKeys),
      indices: run.indices,
      ...run.rect,
      initialRect: primary.rect,
    };
  });
}

export function useMergeSplit(
  checkedIndices: readonly number[],
  itemRects: readonly ItemRect[],
): MergeSplitBlock[] {
  const prevRunsRef = useRef<RunRecord[]>([]);
  const checkedKey = useMemo(
    () => [...checkedIndices].toSorted((a, b) => a - b).join(","),
    [checkedIndices],
  );

  const blocks = useMemo(() => {
    const newRuns = computeRuns(checkedIndices, itemRects);
    return reconcile(newRuns, prevRunsRef.current);
    // checkedKey/itemRects are the real dependencies (checkedIndices is
    // content-compared via checkedKey since a fresh array reference is
    // expected on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedKey, itemRects]);

  // Commit the new runs as "previous" only after render, never while
  // computing this render's own value — mutating a ref mid-render isn't
  // safe under strict-mode's double-invoked renders. Preserve the reconciled
  // key here, not computeRuns' extent-derived temporary key: the next
  // grow/shrink must continue the same Motion element rather than remount it.
  useEffect(() => {
    prevRunsRef.current = blocks.map(({ key, indices, top, left, width, height }) => ({
      key,
      indices,
      rect: { top, left, width, height },
    }));
  }, [blocks]);

  return blocks;
}
