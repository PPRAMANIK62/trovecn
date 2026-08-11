import type { RegistryManifestItem } from "@/lib/registry-types";

export const conversation: RegistryManifestItem = {
  name: "conversation",
  type: "registry:ui",
  title: "Conversation",
  description:
    "An editorial AI transcript with stable streaming states and anchored response branches.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  files: [{ path: "src/components/trovecn/ai-workbench/conversation.tsx", type: "registry:ui" }],
};
