import type { RegistryManifestItem } from "@/lib/registry-types";

export const notificationStack: RegistryManifestItem = {
  name: "notification-stack",
  type: "registry:ui",
  title: "Notification Stack",
  description:
    "A persistent notification centre whose items collapse into a pile with uniform peeking edges and fan out on a pull.",
  dependencies: ["motion", "lucide-react"],
  registryDependencies: ["utils", "springs"],
  files: [
    {
      path: "src/components/trovecn/feedback/notification-stack.tsx",
      type: "registry:ui",
    },
  ],
};
