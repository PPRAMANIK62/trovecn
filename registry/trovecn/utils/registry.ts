import type { RegistryManifestItem } from "@/lib/registry-types";

export const utils: RegistryManifestItem = {
  name: "utils",
  type: "registry:lib",
  title: "Utils",
  description:
    "cn() class merger, extended with the custom text-* font-size scale from globals.css so tailwind-merge doesn't drop it.",
  dependencies: ["clsx", "tailwind-merge"],
  files: [{ path: "src/lib/utils.ts", type: "registry:lib" }],
};
