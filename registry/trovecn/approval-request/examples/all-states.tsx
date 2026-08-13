"use client";

import {
  ApprovalRequest,
  type ApprovalRequestStatus,
} from "@/components/trovecn/ai-workbench/approval-request";

const STATES: {
  status: ApprovalRequestStatus;
  decidedBy?: string;
  decidedAt?: string;
}[] = [
  { status: "pending" },
  { status: "approved", decidedBy: "Priya", decidedAt: "2m ago" },
  { status: "denied", decidedBy: "Priya", decidedAt: "2m ago" },
  { status: "expired" },
  { status: "cancelled", decidedBy: "Priya", decidedAt: "5m ago" },
];

export default function ApprovalRequestAllStatesExample() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {STATES.map((state) => (
        <ApprovalRequest
          key={state.status}
          id={`ref-${state.status}`}
          context="Requested by Ops Agent"
          title="Restart the ingestion worker"
          status={state.status}
          decidedBy={state.decidedBy}
          decidedAt={state.decidedAt}
        />
      ))}
    </div>
  );
}
