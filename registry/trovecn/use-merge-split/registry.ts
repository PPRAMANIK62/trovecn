import type { RegistryManifestItem } from "@/lib/registry-types";

export const useMergeSplit: RegistryManifestItem = {
  name: "use-merge-split",
  type: "registry:hook",
  title: "useMergeSplit",
  description:
    "Groups a checked-item list's contiguous rows into runs and reports one spring-animated background block per run, so adjacent selections read as one continuous shape that merges and splits instead of separate highlighted rows.",
  files: [{ path: "src/hooks/use-merge-split.ts", type: "registry:hook" }],
};
