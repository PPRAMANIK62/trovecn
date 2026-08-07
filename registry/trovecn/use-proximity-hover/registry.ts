import type { RegistryManifestItem } from "@/lib/registry-types";

export const useProximityHover: RegistryManifestItem = {
  name: "use-proximity-hover",
  type: "registry:hook",
  title: "useProximityHover",
  description:
    "Tracks cursor distance across a list of items to preview the nearest one before it's clicked.",
  files: [{ path: "src/hooks/use-proximity-hover.ts", type: "registry:hook" }],
};
