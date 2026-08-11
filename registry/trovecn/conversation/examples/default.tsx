"use client";

import {
  Conversation,
  type ConversationMessage,
} from "@/components/trovecn/ai-workbench/conversation";

const messages: ConversationMessage[] = [
  {
    id: "opening-question",
    role: "user",
    content:
      "The layout is working, but the conversation still feels a little assembled. How would you polish it without adding more UI?",
    timestamp: "Wednesday 6:04 PM",
  },
  {
    id: "first-response",
    role: "assistant",
    content:
      "Reduce the distance between related things. The message, its timestamp, and its actions should read as one small unit; everything else should stay out of the way.",
  },
  {
    id: "follow-up-question",
    role: "user",
    content: "So the actions should feel attached to the message, not like a separate toolbar?",
    timestamp: "Wednesday 6:08 PM",
  },
  {
    id: "final-response",
    role: "assistant",
    content:
      "Exactly. Keep them quiet until they are useful, then let alignment and spacing do the work. Polish is usually less about adding detail and more about removing the gaps that make an interface hesitate.",
  },
];

export default function ConversationDefaultExample() {
  return (
    <div className="w-full max-w-2xl py-3">
      <Conversation messages={messages} onEdit={() => undefined} onRegenerate={() => undefined} />
    </div>
  );
}
