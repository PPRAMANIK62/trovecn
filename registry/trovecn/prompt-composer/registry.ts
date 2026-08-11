import type { RegistryManifestItem } from "@/lib/registry-types";

export const promptComposer: RegistryManifestItem = {
  name: "prompt-composer",
  type: "registry:ui",
  title: "Prompt Composer",
  description:
    "A focused multiline prompt surface with attachment and model menus plus an explicit send/stop lifecycle.",
  dependencies: ["lucide-react", "@base-ui/react", "class-variance-authority"],
  registryDependencies: ["utils", "button", "menu"],
  files: [{ path: "src/components/trovecn/ai-workbench/prompt-composer.tsx", type: "registry:ui" }],
};
