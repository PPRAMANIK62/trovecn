import type { RegistryManifestItem } from "@/lib/registry-types";

const checkboxGroupItem: RegistryManifestItem = {
  name: "checkbox-group",
  type: "registry:ui",
  title: "Checkbox Group",
  description:
    "A multi-select list of Base UI checkboxes with proximity hover across every row and a merge/split background that reads contiguous checked rows as one continuous block.",
  dependencies: ["@base-ui/react", "motion"],
  registryDependencies: ["utils", "springs", "use-proximity-hover", "use-merge-split"],
  files: [{ path: "src/components/ui/checkbox.tsx", type: "registry:ui" }],
};

export { checkboxGroupItem as checkboxGroup };
