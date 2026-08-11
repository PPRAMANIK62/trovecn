import type { RegistryManifestItem } from "@/lib/registry-types";

export const agentActivity: RegistryManifestItem = {
  name: "agent-activity",
  type: "registry:ui",
  title: "Agent Activity",
  description:
    "A collapsible agent-run timeline with streaming steps, sources, details, and inline visual artifacts.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "springs"],
  files: [{ path: "src/components/trovecn/ai-workbench/agent-activity.tsx", type: "registry:ui" }],
};
