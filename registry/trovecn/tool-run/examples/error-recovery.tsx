"use client";

import { useEffect, useState } from "react";

import { usePausableWait } from "@/components/site/demo-playback";
import { ToolRun, type ToolRunStatus } from "@/components/trovecn/ai-workbench/tool-run";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ToolRunErrorRecoveryExample() {
  const { wait: pausableWait } = usePausableWait();
  const [status, setStatus] = useState<ToolRunStatus>("running");

  // The scripted run fails on purpose, so the anchored error + Retry state
  // is reachable without waiting on a real backend.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus("running");
      await pausableWait(900);
      if (cancelled) return;
      setStatus("error");
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [pausableWait]);

  async function handleRetry() {
    await wait(700);
    setStatus("success");
  }

  return (
    <ToolRun
      id="deploy-preview"
      tool="deploy_preview"
      summary="branch: feat/tool-run"
      status={status}
      meta={status === "success" ? "2.1s" : undefined}
      errorMessage="Deploy failed: build exited with code 1."
      onRetry={handleRetry}
      detail={{
        args: ["branch — feat/tool-run", "target — preview"],
        result: "Preview deployed to tool-run-feat.preview.trovecn.dev",
      }}
    />
  );
}
