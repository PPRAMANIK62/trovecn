import type { RegistryItem } from "@/lib/registry-types";

import ToolRunBasicExample from "./examples/basic";
import ToolRunErrorRecoveryExample from "./examples/error-recovery";
import ToolRunNeedsApprovalExample from "./examples/needs-approval";

export const toolRun: RegistryItem = {
  slug: "tool-run",
  title: "Tool Run",
  description:
    "A single tool call's lifecycle — queued, running, paused on approval, and resolved — with arguments and results one click away.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "approval-request", "springs"],
  file: "src/components/trovecn/ai-workbench/tool-run.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description: "A queued call runs and settles into a readable result behind disclosure.",
      file: "registry/trovecn/tool-run/examples/basic.tsx",
      Demo: ToolRunBasicExample,
    },
    {
      title: "Needs approval",
      description:
        "An irreversible call hands its card body to an embedded ApprovalRequest, then resumes on approval.",
      file: "registry/trovecn/tool-run/examples/needs-approval.tsx",
      Demo: ToolRunNeedsApprovalExample,
    },
    {
      title: "Error and retry",
      description: "A failed call renders an anchored inline error with Retry — never a toast.",
      file: "registry/trovecn/tool-run/examples/error-recovery.tsx",
      Demo: ToolRunErrorRecoveryExample,
    },
  ],
  api: [
    {
      component: "ToolRun",
      props: [
        {
          prop: "id",
          type: "string",
          default: "—",
          description:
            "Stable identifier for the call. Not rendered — for the caller's own keys/lookups.",
        },
        {
          prop: "tool",
          type: "ReactNode",
          default: "—",
          description: 'The tool being called, e.g. "search_docs" or "Read file".',
        },
        {
          prop: "summary",
          type: "ReactNode",
          default: "—",
          description:
            "A short call summary next to the tool name — an argument preview, not the full arguments.",
        },
        {
          prop: "status",
          type: '"queued" | "running" | "needs-approval" | "success" | "error" | "cancelled"',
          default: "—",
          description: "Caller-owned. The component renders it; it never sets it itself.",
        },
        {
          prop: "detail",
          type: "{ args?: readonly ReactNode[]; result?: ReactNode }",
          default: "—",
          description:
            'Optional expandable content. args is a compact mono parameter list; result is body copy, shown only once status is "success".',
        },
        {
          prop: "meta",
          type: "ReactNode",
          default: "—",
          description: "Trailing metadata — elapsed time, a timestamp.",
        },
        {
          prop: "errorMessage",
          type: "ReactNode",
          default: "—",
          description: 'Shown next to Retry when status is "error".',
        },
        {
          prop: "onRetry",
          type: "() => void | Promise<void>",
          default: "—",
          description: "A rejected retry re-renders the same anchored error — never a toast.",
        },
        {
          prop: "approval",
          type: 'Omit<ApprovalRequestProps, "variant" | "className">',
          default: "—",
          description:
            'Required while status is "needs-approval" — forwarded to an embedded ApprovalRequest, whose card body replaces this one for the duration of the pause.',
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
