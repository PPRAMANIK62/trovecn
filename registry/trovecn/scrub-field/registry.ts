import type { RegistryManifestItem } from "@/lib/registry-types";

export const scrubField: RegistryManifestItem = {
  name: "scrub-field",
  type: "registry:ui",
  title: "Scrub Field",
  description: "A number input whose label is the drag handle, scrubbing under pointer lock.",
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["utils"],
  files: [
    {
      path: "src/components/trovecn/inputs/scrub-field.tsx",
      type: "registry:ui",
    },
  ],
};
