import type { RegistryManifestItem } from "@/lib/registry-types";

export const approvalRequest: RegistryManifestItem = {
  name: "approval-request",
  type: "registry:ui",
  title: "Approval Request",
  description:
    "A stable, explicit pause for a human decision inside an agent run — never a spinner standing in for consent.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  files: [
    { path: "src/components/trovecn/ai-workbench/approval-request.tsx", type: "registry:ui" },
  ],
};
