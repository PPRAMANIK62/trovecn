"use client";

import { useState } from "react";

import type { ApprovalRequestStatus } from "@/components/trovecn/ai-workbench/approval-request";
import { ToolRun, type ToolRunStatus } from "@/components/trovecn/ai-workbench/tool-run";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ToolRunNeedsApprovalExample() {
  // Opens straight on the pause this example exists to demonstrate — no
  // running intro to sit through first.
  const [status, setStatus] = useState<ToolRunStatus>("needs-approval");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalRequestStatus>("pending");

  async function handleApprove() {
    await wait(500);
    setApprovalStatus("approved");
    await wait(300);
    setStatus("running");
    await wait(800);
    setStatus("success");
  }

  async function handleDeny() {
    await wait(400);
    setApprovalStatus("denied");
    setStatus("cancelled");
  }

  return (
    <ToolRun
      id="issue-refund-4821"
      tool="issue_refund"
      summary="$84.00 to order #4821"
      status={status}
      meta={status === "success" ? "0.9s" : undefined}
      detail={{
        args: ["order — #4821", "amount — $84.00"],
        result: "Refund issued and receipt emailed to the customer.",
      }}
      approval={{
        id: "issue-refund-4821",
        context: "Requested by Support Agent · step 2 of 3",
        title: "Issue a $84.00 refund for order #4821",
        flag: "Irreversible",
        flagTone: "critical",
        detail: {
          summary: "View parameters",
          items: ["order — #4821", "amount — $84.00", "reason — customer request"],
        },
        status: approvalStatus,
        onApprove: handleApprove,
        onDeny: handleDeny,
      }}
    />
  );
}
