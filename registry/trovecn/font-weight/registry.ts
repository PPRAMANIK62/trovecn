import type { RegistryManifestItem } from "@/lib/registry-types";

export const fontWeight: RegistryManifestItem = {
  name: "font-weight",
  type: "registry:lib",
  title: "Font weight",
  description: "Geist variable-font weight tokens for animated font-weight transitions.",
  files: [{ path: "src/lib/font-weight.ts", type: "registry:lib" }],
};
