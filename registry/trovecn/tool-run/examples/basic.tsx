"use client";

import { useEffect, useState } from "react";

import { usePausableWait } from "@/components/site/demo-playback";
import { ToolRun, type ToolRunStatus } from "@/components/trovecn/ai-workbench/tool-run";

export default function ToolRunBasicExample() {
  const { wait } = usePausableWait();
  const [status, setStatus] = useState<ToolRunStatus>("queued");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus("queued");
      await wait(500);
      if (cancelled) return;
      setStatus("running");
      await wait(1100);
      if (cancelled) return;
      setStatus("success");
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [wait]);

  return (
    <ToolRun
      id="search-docs"
      tool="search_docs"
      summary='query: "reduced motion"'
      status={status}
      meta={status === "success" ? "1.2s" : undefined}
      detail={{
        args: ['query — "reduced motion"', "scope — docs/, src/lib/"],
        result: "Found 3 matches across design-system.md and springs.ts.",
      }}
    />
  );
}
