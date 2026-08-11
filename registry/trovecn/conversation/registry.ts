import type { RegistryManifestItem } from "@/lib/registry-types";

export const conversation: RegistryManifestItem = {
  name: "conversation",
  type: "registry:ui",
  title: "Conversation",
  description:
    "A quiet conversation surface with authored hierarchy and contextual message actions.",
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["utils", "button", "springs"],
  files: [{ path: "src/components/trovecn/ai-workbench/conversation.tsx", type: "registry:ui" }],
};
