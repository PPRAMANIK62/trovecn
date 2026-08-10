"use client";

import { useEffect, useMemo, useRef } from "react";

import type { ItemRect } from "@/hooks/use-proximity-hover";

export interface MergeSplitBlock {
  key: string;
  indices: number[];
  top: number;
  left: number;
  width: number;
  height: number;
  initialRect?: { top: number; left: number; width: number; height: number };
}

export interface MergeSplitChange {
  index: number;
  rect: Rect;
  checked: boolean;
  key: string;
}

export interface MergeSplitResult {
  blocks: MergeSplitBlock[];
  change: MergeSplitChange | null;
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

function reconcile(
  newRuns: RunRecord[],
  prevRuns: RunRecord[],
  originIndex: number | null,
  itemRects: readonly ItemRect[],
): MergeSplitBlock[] {
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

    // A click on the hovered gap joins selected runs above and below it.
    // Preserve that row as the visual origin instead of retaining either
    // existing run's key, which would make the merged geometry grow from
    // only one side.
    const originRect = originIndex === null ? undefined : itemRects[originIndex];
    const originBridgesRuns =
      originRect !== undefined &&
      originIndex !== null &&
      run.indices.includes(originIndex) &&
      !prevRuns.some((previous) => previous.indices.includes(originIndex)) &&
      overlapping.length > 1;
    if (originBridgesRuns) {
      // This must be a new Motion element, even if a prior bridge used the
      // same geometry-derived `:origin` name. Reusing a currently rendered
      // split piece's key would preserve its one-sided layout state and skip
      // the center-origin `initialRect` on a repeated bridge.
      const occupiedKeys = new Set([...prevRuns.map((previous) => previous.key), ...outputKeys]);
      const key = claimUniqueKey(`${run.key}:origin`, occupiedKeys);
      outputKeys.add(key);
      return {
        key,
        indices: run.indices,
        ...run.rect,
        initialRect: originRect,
      };
    }

    // The reverse transition: removing the hovered middle row splits one
    // selected surface into two. Mount both result blocks from that old
    // surface, so their inner edges pull apart together and open the gap at
    // the clicked row rather than continuing from one retained side.
    const originPreviousRun =
      originIndex === null
        ? undefined
        : prevRuns.find((previous) => previous.indices.includes(originIndex));
    const originSplitsRun =
      originPreviousRun !== undefined &&
      !run.indices.includes(originIndex!) &&
      newRuns.filter((nextRun) =>
        nextRun.indices.some((index) => originPreviousRun.indices.includes(index)),
      ).length > 1;
    if (originSplitsRun) {
      const occupiedKeys = new Set([...prevRuns.map((previous) => previous.key), ...outputKeys]);
      const key = claimUniqueKey(`${run.key}:origin-split`, occupiedKeys);
      outputKeys.add(key);
      return {
        key,
        indices: run.indices,
        ...run.rect,
        initialRect: originPreviousRun.rect,
      };
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
  originIndex: number | null = null,
): MergeSplitResult {
  const prevRunsRef = useRef<RunRecord[]>([]);
  const checkedKey = useMemo(
    () => [...checkedIndices].toSorted((a, b) => a - b).join(","),
    [checkedIndices],
  );

  const result = useMemo(() => {
    const newRuns = computeRuns(checkedIndices, itemRects);
    const blocks = reconcile(newRuns, prevRunsRef.current, originIndex, itemRects);
    const previousIndices = prevRunsRef.current.flatMap((run) => run.indices);
    const changedIndices = [...new Set([...previousIndices, ...checkedIndices])].filter(
      (index) => previousIndices.includes(index) !== checkedIndices.includes(index),
    );
    const index = changedIndices.length === 1 ? changedIndices[0] : null;
    const rect = index === null ? undefined : itemRects[index];

    return {
      blocks,
      change:
        index === null || rect === undefined
          ? null
          : {
              index,
              rect,
              checked: checkedIndices.includes(index),
              key: `${checkedKey}:${index}`,
            },
    };
    // checkedKey/itemRects/originIndex are the real dependencies (checkedIndices is
    // content-compared via checkedKey since a fresh array reference is
    // expected on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedKey, itemRects, originIndex]);

  // Commit the new runs as "previous" only after render, never while
  // computing this render's own value — mutating a ref mid-render isn't
  // safe under strict-mode's double-invoked renders. Preserve the reconciled
  // key here, not computeRuns' extent-derived temporary key: the next
  // grow/shrink must continue the same Motion element rather than remount it.
  useEffect(() => {
    prevRunsRef.current = result.blocks.map(({ key, indices, top, left, width, height }) => ({
      key,
      indices,
      rect: { top, left, width, height },
    }));
  }, [result.blocks]);

  return result;
}
