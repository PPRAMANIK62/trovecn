import type { RegistryItem } from "@/lib/registry-types";

import ApprovalRequestAllStatesExample from "./examples/all-states";
import ApprovalRequestBasicExample from "./examples/basic";
import ApprovalRequestErrorRecoveryExample from "./examples/error-recovery";
import ApprovalRequestMessagePreviewExample from "./examples/message-preview";

export const approvalRequest: RegistryItem = {
  slug: "approval-request",
  title: "Approval Request",
  description:
    "A stable, explicit pause for a human decision inside an agent run — never a spinner standing in for consent.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  file: "src/components/trovecn/ai-workbench/approval-request.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "An irreversible action, its parameters, and a visible deadline — approve or deny to see the real transition.",
      file: "registry/trovecn/approval-request/examples/basic.tsx",
      Demo: ApprovalRequestBasicExample,
    },
    {
      title: "Message preview",
      description:
        "An external-facing request renders its content as body copy instead of the compact parameter list.",
      file: "registry/trovecn/approval-request/examples/message-preview.tsx",
      Demo: ApprovalRequestMessagePreviewExample,
    },
    {
      title: "Error and retry",
      description:
        "A rejected onApprove renders an anchored inline error next to the request it belongs to, not a toast.",
      file: "registry/trovecn/approval-request/examples/error-recovery.tsx",
      Demo: ApprovalRequestErrorRecoveryExample,
    },
    {
      title: "All states",
      description:
        "Every status value side by side — resolved treatments differ only in icon and label.",
      file: "registry/trovecn/approval-request/examples/all-states.tsx",
      Demo: ApprovalRequestAllStatesExample,
    },
  ],
  api: [
    {
      component: "ApprovalRequest",
      props: [
        {
          prop: "id",
          type: "string",
          default: "—",
          description: "Stable identifier for the request.",
        },
        {
          prop: "title",
          type: "ReactNode",
          default: "—",
          description: "The action being approved, stated as what will happen.",
        },
        {
          prop: "context",
          type: "ReactNode",
          default: "—",
          description: "Optional one-line requester line — which agent, and where in the run.",
        },
        {
          prop: "detail",
          type: "{ summary: ReactNode; items?: readonly ReactNode[]; preview?: ReactNode }",
          default: "—",
          description:
            "Optional expandable content. items is a compact mono parameter list; preview is full-sentence content (a message, a diff) in body copy. Either or both.",
        },
        {
          prop: "flag / flagTone",
          type: 'ReactNode / "default" | "critical"',
          default: '— / "default"',
          description:
            "Freeform category label and a binary tone — trove/cn has one semantic warning colour, reused rather than a new severity scale.",
        },
        {
          prop: "status",
          type: '"pending" | "approved" | "denied" | "expired" | "cancelled"',
          default: "—",
          description: "Caller-owned. The component renders it; it never sets it itself.",
        },
        {
          prop: "expiresAt",
          type: "Date",
          default: "—",
          description: "Renders a static deadline label. Not a timer — the caller drives expiry.",
        },
        {
          prop: "decidedBy / decidedAt",
          type: "ReactNode",
          default: "—",
          description: "Audit line shown once resolved.",
        },
        {
          prop: "onApprove / onDeny",
          type: "() => void | Promise<void>",
          default: "—",
          description: "A rejected promise renders the anchored inline error state with Retry.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the card root.",
        },
      ],
    },
  ],
};
