"use client";

import { useRef, useState } from "react";

import {
  ApprovalRequest,
  type ApprovalRequestStatus,
} from "@/components/trovecn/ai-workbench/approval-request";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ApprovalRequestErrorRecoveryExample() {
  const [status, setStatus] = useState<ApprovalRequestStatus>("pending");
  // The first Approve click fails on purpose, so the anchored error + Retry
  // state is reachable without waiting on a real backend.
  const hasFailedOnce = useRef(false);

  async function handleApprove() {
    await wait(650);
    if (!hasFailedOnce.current) {
      hasFailedOnce.current = true;
      throw new Error("network");
    }
    setStatus("approved");
  }

  async function handleDeny() {
    await wait(400);
    setStatus("denied");
  }

  return (
    <ApprovalRequest
      id="wire-payout"
      context="Requested by Payouts Agent · monthly run"
      title="Approve $4,230.00 payout to 3 contractors"
      detail={{
        summary: "View breakdown",
        items: ["Alex R. — $1,800.00", "Jamie K. — $1,430.00", "Priya S. — $1,000.00"],
      }}
      status={status}
      decidedBy={status !== "pending" ? "You" : undefined}
      decidedAt={status !== "pending" ? "just now" : undefined}
      onApprove={handleApprove}
      onDeny={handleDeny}
    />
  );
}
