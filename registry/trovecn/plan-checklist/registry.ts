import type { RegistryManifestItem } from "@/lib/registry-types";

export const planChecklist: RegistryManifestItem = {
  name: "plan-checklist",
  type: "registry:ui",
  title: "Plan Checklist",
  description:
    "The agent's stated intentions before and while it acts — pending, in-progress, and done steps, live-editable and reorderable while they're still ahead.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  files: [{ path: "src/components/trovecn/ai-workbench/plan-checklist.tsx", type: "registry:ui" }],
};
