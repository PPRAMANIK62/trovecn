import type { RegistryItem } from "@/lib/registry-types";

import PromptComposerDefaultExample from "./examples/default";

export const promptComposer: RegistryItem = {
  slug: "prompt-composer",
  title: "Prompt Composer",
  description:
    "A focused multiline prompt surface with attachment and model menus plus an explicit send/stop lifecycle.",
  category: "AI Workbench",
  dependencies: ["lucide-react", "@base-ui/react", "class-variance-authority"],
  registryDependencies: ["utils", "button", "menu"],
  file: "src/components/trovecn/ai-workbench/prompt-composer.tsx",
  isNew: true,
  examples: [
    {
      title: "Agent prompt",
      description:
        "The baseline writing experience with attachment and model menus plus Send-to-Stop handoff.",
      file: "registry/trovecn/prompt-composer/examples/default.tsx",
      Demo: PromptComposerDefaultExample,
    },
  ],
  api: [
    {
      component: "PromptComposer",
      props: [
        {
          prop: "value / defaultValue",
          type: "string",
          default: '""',
          description: "Controlled or uncontrolled draft text.",
        },
        {
          prop: "onSubmit",
          type: "(event: PromptComposerSubmitEvent) => void",
          default: "—",
          description: "Called with the trimmed prompt.",
        },
        {
          prop: "isRunning",
          type: "boolean",
          default: "false",
          description: "Replaces Send with the explicit Stop action.",
        },
        {
          prop: "onStop",
          type: "() => void",
          default: "—",
          description: "Cancels the active agent turn.",
        },
        {
          prop: "maxLength",
          type: "number",
          default: "—",
          description: "Optional maximum character count with a visible remaining count.",
        },
        {
          prop: "placeholder",
          type: "string",
          default: '"Message…"',
          description: "Instruction shown while the draft is empty.",
        },
        {
          prop: "models / model",
          type: "readonly string[] / string",
          default: "[] / —",
          description: "Optional compact model selector.",
        },
        {
          prop: "attachmentOptions / onAttachmentOptionSelect",
          type: "readonly PromptComposerAttachmentOption[] / (option) => void",
          default: "[] / —",
          description: "Attachment choices opened above the composer.",
        },
      ],
    },
  ],
};
