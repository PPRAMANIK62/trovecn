import type { RegistryManifestItem } from "@/lib/registry-types";

export const toolRun: RegistryManifestItem = {
  name: "tool-run",
  type: "registry:ui",
  title: "Tool Run",
  description:
    "A single tool call's lifecycle — queued, running, paused on approval, and resolved — with arguments and results one click away.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "approval-request", "springs"],
  files: [{ path: "src/components/trovecn/ai-workbench/tool-run.tsx", type: "registry:ui" }],
};
