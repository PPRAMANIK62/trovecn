"use client";

import { useState } from "react";

import {
  ApprovalRequest,
  type ApprovalRequestStatus,
} from "@/components/trovecn/ai-workbench/approval-request";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ApprovalRequestMessagePreviewExample() {
  const [status, setStatus] = useState<ApprovalRequestStatus>("pending");

  return (
    <ApprovalRequest
      id="renewal-reminder"
      context="Requested by Lifecycle Agent · campaign step 2"
      title="Send renewal reminder to 214 customers"
      flag="Customer-facing"
      detail={{
        summary: "View message",
        preview: (
          <>
            <strong className="font-medium">Subject:</strong> Your plan renews in 3 days
            <br />
            <br />
            {
              "Hi {{first_name}}, just a heads up that your subscription renews on Aug 16. No action needed if you'd like to continue."
            }
          </>
        ),
      }}
      status={status}
      decidedBy={status !== "pending" ? "You" : undefined}
      decidedAt={status !== "pending" ? "just now" : undefined}
      onApprove={async () => {
        await wait(600);
        setStatus("approved");
      }}
      onDeny={async () => {
        await wait(400);
        setStatus("denied");
      }}
    />
  );
}
