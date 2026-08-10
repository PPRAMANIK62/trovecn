import type { RegistryManifestItem } from "@/lib/registry-types";

export const radioGroup: RegistryManifestItem = {
  name: "radio-group",
  type: "registry:ui",
  title: "Radio Group",
  description:
    "Base UI radio group with a spring-driven selected background and proximity hover across every row.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover"],
  files: [{ path: "src/components/ui/radio-group.tsx", type: "registry:ui" }],
};
