# Conversation — clean UI, interaction, and API research

Research brief for the AI-workbench `Conversation` component. It is the next
step after [`PromptComposer`](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx):
the composer owns a draft and its send/stop handoff; Conversation owns the
durable, readable record of that turn. The planned collection explicitly gives
Conversation message rows, markdown/code, message actions, and response
branches ([roadmap](../../ideas.md#conversation-and-composition)). The initial
release intentionally proves only the transcript baseline before those later
extensions.

The goal is **calm utility**, not a familiar chat product imitation: a clean,
left-aligned reading column that makes authored content primary and keeps
controls quiet until they are useful. External claims below link to the
standards body or library maintainer that owns the guidance.

## Decision in one view

| Concern            | Build decision                                                                                                                                                      | Why it follows PromptComposer                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversation shape | One vertical `feed` of semantic message articles; no enclosing card around the whole transcript.                                                                    | The composer is the one deliberately raised work surface. Letting every message become another large rounded card would make the vertical slice feel heavy. The WAI feed pattern defines dynamic content as labelled `article` units inside a `feed` ([W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)). |
| Author distinction | User turns use a muted, right-inset reading block. Assistant turns are mostly unboxed, with a compact identity/status line above content.                           | This preserves a clear authored/reply hierarchy while retaining the composer’s neutral palette and avoiding decorative avatars/bubbles.                                                                                                                                                                           |
| Content hierarchy  | The response body is the largest and highest-contrast element; metadata and actions use compact text and lower contrast.                                            | PromptComposer makes the text field dominant and moves configuration into its small footer. Conversation should make the response dominant and move controls to a low-attention footer.                                                                                                                           |
| Action disclosure  | Use a compact copy/retry row after assistant content, visible on keyboard focus and hover; use regular labelled/icon buttons, never a hidden right-click-only menu. | PromptComposer uses compact, accessible `Button` controls and menus only for optional configuration. The same hierarchy prevents actions from competing with the answer.                                                                                                                                          |
| Streaming          | Render one stable assistant article immediately and update its body in place; show a quiet `Generating` status line, not a typing-dot loop.                         | PromptComposer already treats active generation as an actionable state (`isRunning` + Stop), not a decorative loader. Status changes that do not move focus need programmatic notification ([WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).                        |
| Branches           | Keep branches out of the baseline and introduce them later through the dedicated `BranchPicker`.                                                                    | Alternatives change the transcript navigation model; the initial component should prove durable response states before absorbing that complexity.                                                                                                                                                                 |

## PromptComposer patterns to preserve

The component implementation, its registry metadata, and the house design
system form the local source of truth. These are direct derivations, not
generic recommendations.

| Existing pattern                                                                 | Evidence                                                                                                                                                                                                                   | Conversation derivation                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Optional enhancements are controlled props, not required internal product state. | [`PromptComposerProps`](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L37-L60) makes attachments and model choice optional and callback-driven.                                                         | Require only `messages`; expose copy and retry callbacks. Do not embed request, markdown, or model-provider logic.                                                                                                                                                                                                                 |
| The running state is explicit and has a cancellation counterpart.                | [`isRunning` / `onStop`](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L43-L48) swaps Send for Stop and prevents editing.                                                                               | Model an assistant message’s `streaming` / `stopped` / `error` state directly. Conversation displays state; the parent still owns cancellation through the composer or application runtime.                                                                                                                                        |
| Interaction uses a small, neutral surface and one emphatic primary control.      | The composer’s root is a `bg-card`, bordered, 20px-radius surface; its send/stop control stays in one lower-right position ([implementation](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L129-L267)). | Keep the composer visually dominant at the bottom. Conversation should use spacing, a small user inset, and code blocks for structure—not repeated primary fills or prominent containers.                                                                                                                                          |
| Accessibility state is announced without moving focus.                           | The composer has a polite `role="status"` live region ([implementation](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L136-L138)).                                                                      | Announce lifecycle boundaries, not every streamed token: “Response started”, “Response complete”, “Response stopped”, or an actionable failure summary. WCAG warns that excessive live-region updates become noisy ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#other-uses-of-live-regions-or-alerts)). |
| Tiny feedback gets tokenized, reduced-motion-aware animation.                    | The composer fades the sent draft up by 8px with `spring.quick`, and disables travel under `useReducedMotion` ([implementation](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L145-L153)).              | Add just one focal motion: a newly submitted/created row settles into place. Content streaming itself must not animate character by character.                                                                                                                                                                                     |
| Reusable primitives own control semantics.                                       | It composes house `Button` and `Menu`, rather than recreating bindings ([implementation](../../../src/components/trovecn/ai-workbench/prompt-composer.tsx#L13-L24)).                                                       | Compose `Button` for actions and `Menu` only for overflow actions. Do not introduce a custom dropdown or pressable abstraction.                                                                                                                                                                                                    |

## Visual specification

Follow the repository’s neutral, typography-led visual language
([design system](../../design-system.md#visual-language)). The following is
intentionally specific enough to implement and review.

- **Frame:** `w-full`, with a readable maximum width set by the consuming
  layout. The root itself is transparent. Stack messages with approximately
  24px between distinct turns and 8px between an assistant label and body.
  Do not invent a second page-width panel or an enclosing shadow.
- **Assistant turn:** left-aligned. Use a 10.5px mono/meta status line for
  `Assistant · Generating` or `Assistant · 10:42`; render the response in
  `text-body` with comfortable reading line height. The answer is visually
  quiet, confident, and not boxed by default.
- **User turn:** preserve the actual prompt as a compact, muted `bg-muted`
  block, inset from the left (or aligned to the content column’s right edge
  when the layout has room). It may have a modest `rounded-xl` radius, but no
  bright fill, gradient, avatar, or shadow. It should look like submitted
  input, not a competing response card.
- **Code:** render code in its own `bg-card` + border surface with the house
  `font-mono`, a language label, and a low-profile copy button. Code is a
  content boundary, so it may be visibly surfaced; prose is not. Keep
  horizontal scrolling confined to the code block.
- **Actions and metadata:** put copy and retry (only when supported) after
  the response in DOM order. Default to subdued `Button variant="ghost"
size="2xs"`; show labels in the demo at narrow widths and on focus so no
  action is ambiguous. Use `text-meta` for timestamps.
- **Error and stopped states:** retain the partial response. Add a small,
  anchored text line such as `Stopped` or `Couldn’t complete the response`
  beside an available retry action. Do not replace the answer with a global
  banner, spinner, or empty placeholder.
- **Empty state:** supply no default marketing copy. The parent may pass an
  `emptyState`; the normal workbench leaves the space visually open for the
  composer’s first prompt.

Use only semantic colour tokens (`foreground`, `muted-foreground`, `muted`,
`card`, `border`, `destructive`, and focus `ring`) and the repository type
tokens. This matches the design system’s rule against hard-coded colours and
its small type scale ([tokens](../../design-system.md#design-tokens-srcappglobalscss),
[type scale](../../design-system.md#type-scale)).

## Public API proposal

Keep this a presentational transcript component. A parent owns transport,
markdown parsing/sanitisation, persistence, and scroll policy; that makes the
component usable with any AI SDK or application backend.

```ts
type ConversationMessageRole = "user" | "assistant";
type ConversationMessageStatus = "streaming" | "complete" | "stopped" | "error";

interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  /** Pre-rendered or consumer-rendered parts; no Markdown parser dependency in v1. */
  content: React.ReactNode;
  status?: ConversationMessageStatus;
  label?: string;
  timestamp?: React.ReactNode;
  error?: { message: string };
}

interface ConversationProps {
  messages: readonly ConversationMessage[];
  onCopy?: (message: ConversationMessage) => void;
  onRetry?: (message: ConversationMessage) => void;
  emptyState?: React.ReactNode;
  className?: string;
}
```

### API boundaries

- `messages` is controlled and immutable by convention: streaming updates
  replace the relevant message object while preserving its `id`. Stable IDs
  are also required if a later implementation uses Motion presence; its
  direct children need unique keys ([Motion `AnimatePresence`](https://motion.dev/docs/react-animate-presence#changing-key)).
- `content` is deliberately `ReactNode` in v1. Markdown and syntax
  highlighting are rendering concerns, not a hard runtime dependency. The
  repository already uses Shiki for server-rendered highlighted code
  ([design system](../../design-system.md#stack)); a future helper may accept
  structured markdown parts without changing Conversation’s ownership.
- Do not infer `retry` from `status === "error"`: a retry may be unavailable
  for a deleted context, exhausted budget, or policy refusal. Its callback is
  the parent’s explicit capability signal.
- Do not include `isAtBottom`, `onScroll`, request cancellation, or automatic
  scroll-to-latest in v1. Those are page/runtime policies. A future
  `ConversationViewport` can own the explicit “new messages” affordance
  without coupling this transcript to a particular scroll container.

## State, accessibility, and keyboard contract

| State               | Visible contract                                                                  | Assistive-technology contract                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty               | No transcript chrome unless the consumer supplies `emptyState`.                   | Do not announce a decorative empty message.                                                                                                                                                                                                                                                                                                                                                                |
| User turn           | Submitted prompt stays readable as a muted, compact block.                        | A labelled `article` identifies it as “You” and describes its content.                                                                                                                                                                                                                                                                                                                                     |
| Assistant streaming | One stable assistant row with the growing response and a quiet `Generating` line. | Put the transcript in a labelled `feed`; set `aria-busy="true"` only while its DOM update is in progress, then reset it. WAI’s feed guidance requires this reset or assistive technology may not expose changes ([W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/#wai-aria-roles-states-and-properties)). Announce start/finish once through a separate polite status region, never token updates. |
| Complete            | Body and actions become available without layout jump.                            | Actions have accessible names with the message identity where needed, e.g. “Copy assistant response”. Do not steal focus.                                                                                                                                                                                                                                                                                  |
| Stopped / error     | Preserve partial content, anchored status, and retry if supported.                | Use `role="status"` for ordinary completion/stopped state; reserve an alert for time-sensitive errors that need interruption. The WCAG technique distinguishes status from alerts ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#techniques)).                                                                                                                                    |

Implement the feed only when the conversation is genuinely dynamic or
incrementally loaded. WAI defines it as a structural pattern for dynamic
article content, with `article` labels/descriptions and position metadata
([APG](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)). For a short static
transcript, semantic `<section aria-label="Conversation">` plus `<article>`
rows is the simpler valid baseline.

Keep the DOM and visual reading order identical: assistant metadata, content,
then actions; then the next message. Sequential focus must preserve meaning
and operation ([WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)). Do not apply `role="toolbar"` to a two-button action row; WAI advises that the toolbar grouping is for groups of three or more controls and requires its own roving-focus contract ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)).

## Motion contract

The local motion system is authoritative: use transform/opacity only, import
`spring` from `@/lib/springs`, make exits faster than entrances, and honour
reduced motion ([house rules](../../design-system.md#motion--interaction-principles)).

| Moment                                                | Standard motion                                                                                                                                                  | Reduced-motion version      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| User message accepted / assistant placeholder created | Each new row fades from `opacity: 0` and travels 4px vertically toward its reading position on `spring.quick.enter`. This is the component’s one focal movement. | Opacity only, duration `0`. |
| Streaming text                                        | No per-token, typing-dot, shimmer, height, or cursor animation. Let normal reflow communicate progress.                                                          | Same.                       |
| Actions become relevant                               | Fade the row’s action opacity in on complete/focus/hover; no travel.                                                                                             | Same.                       |
| Copy confirmation                                     | Swap the copy icon/label once, then restore after a short local confirmation period; use opacity only.                                                           | Same.                       |

`useReducedMotion()` is already the component-level pattern in PromptComposer,
and Motion documents that it maps to the user’s device preference
([Motion accessibility guide](https://motion.dev/docs/react-accessibility)).
Avoid `layout` animation for streamed height changes: it turns ordinary text
growth into persistent movement and makes a long answer visually restless.

## Implementation and demo checklist

1. Create `src/components/trovecn/ai-workbench/conversation.tsx` with
   `data-slot="conversation"`; import `Button`, `cn`, `spring`, and Motion
   only where the small row transitions are actually rendered.
2. Build `Conversation` and a private/default `MessageRow`; prove the small
   baseline before extracting public `Message`, `MessageActions`, or
   `BranchPicker` APIs.
3. Add a realistic registry demo with: a user question, a completed response,
   a streaming response, and a stopped/error partial response with retry. The collection acceptance
   standard requires states, keyboard/screen-reader behaviour, motion, and
   dependencies to be documented ([component standard](../../ideas.md#component-acceptance-standard)).
4. Verify light and dark modes, keyboard-only copy/retry operation, and reduced motion. Ensure partial messages
   remain in the DOM after stop/error.
5. Keep the component’s registry dependencies minimal: `utils`, `button`,
   and `springs`; add `menu` only if an actual overflow menu ships. Do not add
   a markdown renderer or AI SDK solely for v1.

## Deliberate non-goals for v1

- Full markdown parsing, sanitisation, citations, source previews, and
  branches — render through `content` now; build `Citation`, `Sources`, and
  `BranchPicker` as dedicated components when their behaviour is proven.
- Tool progress, reasoning, approval, and artifact rendering — these belong
  to the following `AgentActivity`, `ToolRun`, `ApprovalRequest`, and
  `ArtifactDock` components, not inside message prose.
- Message editing, reactions, multi-user identity, avatars, and auto-scroll.
  Each changes the interaction model enough to warrant a separate contract.
