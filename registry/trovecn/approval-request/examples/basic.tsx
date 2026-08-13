"use client";

import { useState } from "react";

import {
  ApprovalRequest,
  type ApprovalRequestStatus,
} from "@/components/trovecn/ai-workbench/approval-request";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ApprovalRequestBasicExample() {
  const [status, setStatus] = useState<ApprovalRequestStatus>("pending");

  async function handleApprove() {
    await wait(700);
    setStatus("approved");
  }

  async function handleDeny() {
    await wait(500);
    setStatus("denied");
  }

  return (
    <ApprovalRequest
      id="del-90d-drafts"
      context="Requested by Cleanup Agent · step 3 of 5"
      title="Delete 12 draft files older than 90 days"
      flag="Irreversible"
      flagTone="critical"
      expiresAt={new Date(Date.now() + 4 * 60_000)}
      detail={{
        summary: "View parameters",
        items: [
          "path — /drafts/**/*.md",
          "filter — modified < 90d, status = draft",
          "count — 12 files, 340 KB total",
        ],
      }}
      status={status}
      decidedBy={status !== "pending" ? "You" : undefined}
      decidedAt={status !== "pending" ? "just now" : undefined}
      onApprove={handleApprove}
      onDeny={handleDeny}
    />
  );
}
