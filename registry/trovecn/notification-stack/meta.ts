import type { RegistryItem } from "@/lib/registry-types";

import NotificationStackBasicExample from "./examples/basic";
import NotificationStackClearingExample from "./examples/clearing";
import NotificationStackGroupedExample from "./examples/grouped";

export const notificationStack: RegistryItem = {
  slug: "notification-stack",
  title: "Notification Stack",
  description:
    "Notifications collapse into a pile with the edges underneath peeking out. Pull to fan them apart; throw one sideways and the rest close the gap, then restack.",
  category: "Components",
  dependencies: ["motion", "lucide-react"],
  registryDependencies: ["utils", "springs"],
  file: "src/components/trovecn/feedback/notification-stack.tsx",
  isNew: true,
  examples: [
    {
      title: "Basic",
      description:
        "Pull down to open. The separation tracks your finger and commits only past halfway, so a hesitant drag springs shut. Dismiss one and watch two beats: the gap closes, then depth re-ramps.",
      file: "registry/trovecn/notification-stack/examples/basic.tsx",
      Demo: NotificationStackBasicExample,
    },
    {
      title: "Grouped by source",
      description:
        "The job it was built for. One stack per app, each with its own collapsed state. Grouping stays in the caller, since a stack that owned it would need sorting and headers too.",
      file: "registry/trovecn/notification-stack/examples/grouped.tsx",
      Demo: NotificationStackGroupedExample,
    },
    {
      title: "Controlled, and cleared",
      description:
        "`expanded` driven from outside, and the other dismissal. A thrown card leaves sideways at the speed you released it. A cleared one falls backwards into the pile and blurs out there.",
      file: "registry/trovecn/notification-stack/examples/clearing.tsx",
      Demo: NotificationStackClearingExample,
    },
  ],
  api: [
    {
      component: "NotificationStack",
      props: [
        {
          prop: "notifications",
          type: "NotificationItem[]",
          default: "—",
          description:
            "The items, newest first. Index 0 is the front of the pile. Each needs a stable `id`. The card renders `title`, `body`, `meta`, and `icon` and nothing else, because a notification centre that accepted arbitrary children could not clip its buried cards to a uniform peek.",
        },
        {
          prop: "onDismiss",
          type: "(id: string) => void",
          default: "—",
          description:
            "Fires once a card has finished leaving, not when the gesture crosses the threshold. Remove the item from your list here. The component never mutates what you pass it.",
        },
        {
          prop: "expanded / defaultExpanded",
          type: "boolean",
          default: "false",
          description:
            "Controlled and uncontrolled open state. The pull gesture and the header button both route through it, so a controlled stack keeps both.",
        },
        {
          prop: "onExpandedChange",
          type: "(expanded: boolean) => void",
          default: "—",
          description: "Fires when a pull commits or the header button is pressed.",
        },
        {
          prop: "label",
          type: "ReactNode",
          default: '"Notifications"',
          description:
            "Heading above the pile, and the accessible name of the region when it is a string.",
        },
        {
          prop: "maxCollapsed",
          type: "number",
          default: "3",
          description:
            "Cards painted in the collapsed pile, including the front one. Three is the number this is tuned for; past it the rungs stop reading as depth and start reading as a list that failed to lay out. Anything beyond the cap stays mounted and unpainted, so opening reveals it rather than mounting it.",
        },
        {
          prop: "dismissible",
          type: "boolean",
          default: "true",
          description:
            "Enables the swipe and the per-card close button. The button gives the keyboard the route the throw gives a pointer.",
        },
        {
          prop: "emptyState",
          type: "ReactNode",
          default: '"Nothing new"',
          description: "Shown once the last card leaves. The stack collapses itself first.",
        },
        {
          prop: "className",
          type: "string",
          default: "—",
          description: "Extends the outer region, meaning the header row and the stack below it.",
        },
      ],
    },
    {
      component: "NotificationItem",
      props: [
        {
          prop: "id",
          type: "string",
          default: "—",
          description:
            "Stable identity across renders. Reused ids will cross-fade into each other rather than restacking.",
        },
        {
          prop: "title",
          type: "ReactNode",
          default: "—",
          description: "Single line, truncated. The only required piece of content.",
        },
        {
          prop: "body",
          type: "ReactNode",
          default: "—",
          description:
            "Clamped to two lines. Cards of different heights are fine, since the pile solves each peek from the bottom edge up so they stay even.",
        },
        {
          prop: "meta",
          type: "ReactNode",
          default: "—",
          description: "Timestamp or source, right-aligned against the title in tabular figures.",
        },
        {
          prop: "icon",
          type: "ReactNode",
          default: "—",
          description: "Rendered into a 28px tile at the leading edge. Sized to 14px by the card.",
        },
      ],
    },
  ],
};
