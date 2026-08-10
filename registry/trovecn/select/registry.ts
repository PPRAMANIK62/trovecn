import type { RegistryManifestItem } from "@/lib/registry-types";

export const select: RegistryManifestItem = {
  name: "select",
  type: "registry:ui",
  title: "Select",
  description:
    "Base UI select with a spring-driven popup, a sliding selected-row highlight, and a checkmark that draws itself in.",
  dependencies: ["@base-ui/react", "motion", "lucide-react"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/select.tsx", type: "registry:ui" }],
};
