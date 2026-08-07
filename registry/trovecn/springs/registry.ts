import type { RegistryManifestItem } from "@/lib/registry-types";

export const springs: RegistryManifestItem = {
  name: "springs",
  type: "registry:lib",
  title: "Springs",
  description: "Three-tier spring/tween motion tokens — fast, moderate, slow.",
  dependencies: ["framer-motion"],
  files: [{ path: "src/lib/springs.ts", type: "registry:lib" }],
};
