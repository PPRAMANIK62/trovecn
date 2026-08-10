# Compound UX components — ecosystem research and in-house direction

Research date: 2026-08-11. This is an idea and interaction study, **not a
catalog to reproduce**. The goal is a house collection of workflow-level,
accessible components that composes the repo's Base UI primitives and follows
the existing motion tokens in [`docs/design-system.md`](../design-system.md).

## The useful abstraction: a component can own a job, not just an element

The common opportunity across current libraries is the layer between a
primitive and a full product page: a reusable, opinionated interaction that
owns a real user job. shadcn defines a block as either a single component or a
complex unit such as a dashboard with multiple components, hooks and utilities
([Blocks authoring](https://ui.shadcn.com/docs/_blocks)). Its dashboard example
actually ships an app sidebar, interactive chart, data table and section cards
as one coherent starting point ([Dashboard block](https://ui.shadcn.com/blocks)).

That is the right target for this registry. A `ToolRun` is not a styled
accordion; it owns pending/running/approval/success/error states, a compact
summary, keyboard disclosure and an inspectable result. A `PromptComposer` is
not a textarea; it owns attachments, model/context choices, send/stop state and
the transition from a draft to a queued message.

### What the reference ecosystems contribute

| Ecosystem                                                                  | Worth learning                                                                                                                                                                                                                                                                                                                                           | Do not inherit blindly                                                                                                                                                                  |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [beUI](https://beui.dev/)                                                  | Treat motion as behaviour: its catalog includes a sign-up flow that validates after blur then clears immediately on correction, layout-aware toast stacks, morphing modal views, a draggable sheet, stateful action buttons and a command palette. It frames the component as a small interaction system, not a visual skin.                             | Its individual visual motifs (dynamic-island, bloom, 3D tilt) are references only. They must not become a default style.                                                                |
| [Aceternity UI categories](https://ui.aceternity.com/categories)           | A broad prompt for where expressive interaction can add identity: contextual tooltips, terminal/code surfaces, upload, empty states, cards, navigation, scrolling and data visualization. Its [terminal](https://ui.aceternity.com/components/terminal) pairs syntax treatment, incremental output and auto-scroll—useful behaviour beyond a code block. | The library is intentionally promotional and high-spectacle: beams, parallax, shaders, and many text effects should be reserved for a rare, meaningful moment, never normal app chrome. |
| [AI Elements](https://elements.ai-sdk.dev/)                                | A sharply useful taxonomy for AI-native work: conversation, prompt input, citations, sources, reasoning, plans, queues, tools, artifacts, file trees, code previews, terminal, test results and workflow canvas parts. The library is composable rather than a single hard-coded chat screen.                                                            | Do not couple our components to its SDK types or visual styling. Keep state adapters and render slots ours.                                                                             |
| [Base UI animation guidance](https://base-ui.com/react/handbook/animation) | Behaviour must survive interruption: transitions can reverse or settle cleanly, unlike one-shot keyframe animations. Anchored surfaces can reveal direction/placement for direction-aware transitions ([Popover](https://base-ui.com/react/components/popover)).                                                                                         | Base UI provides behaviour; the house system remains responsible for visual language and motion tokens.                                                                                 |

## North-star principles

1. **Build state machines users can read.** Every async component must make
   `idle → queued → working → needs input → completed | failed | cancelled`
   distinguishable. Never use a decorative loop as a substitute for status.
   AI Elements' [Tool](https://elements.ai-sdk.dev/components/tool) is good
   precedent: it models pending, running, approval, completed, error and denied
   states, while keeping parameters and results inspectable.
2. **Give an event a spatial cause.** A result unfolds below the action that
   requested it; a panel grows from its trigger; selection glides between peer
   choices. Do not fade unrelated content in from nowhere. The system should
   answer “what changed, and where did it come from?” before it tries to
   delight.
3. **One focal movement per component.** Parent surface first, then only a
   small stagger for newly meaningful children. A tool card may unfold;
   meanwhile its status icon should settle quietly, not bounce, shimmer and
   glow at once.
4. **Motion has semantic grammar.** `select = glide`; `expand = make room,
then reveal`; `success = settle`; `error = firm, brief lateral nudge plus
persistent explanation`; `background work = quiet progress/pulse`;
   `handoff = explicit ownership change`. Reusing this grammar lets motion
   “talk” without becoming theatrical.
5. **Density is earned by progressive disclosure.** Keep the primary answer,
   current status and next action visible. Put JSON, logs, raw tool arguments,
   metadata and rare actions behind an in-place disclosure. AI Elements'
   [Reasoning](https://elements.ai-sdk.dev/components/reasoning) follows a
   useful version: it opens while streamed, closes on completion, and remains
   manually controllable.
6. **No loss of agency.** Interactions must be interruptible: hover reversal,
   close during open, drag release, stream stop, retry and undo should continue
   from current state rather than snap or restart. Keyboard and pointer must
   reach the same states.
7. **Premium means composure.** Clear hierarchy, quiet base surfaces, real
   elevation, tight type, and a deliberate accent do more work than a gradient
   or shadow. Spend expressive motion on a completed milestone, a first-run
   teaching moment, or a genuinely spatial task—not every hover.
8. **Reduced motion preserves meaning.** Keep colour, opacity, labels and
   final-state changes; remove travel, bounce, parallax and layout animation.
   Motion's [accessibility guidance](https://motion.dev/docs/react-accessibility)
   supports reduced-motion user preferences, consistent with the repo's root
   `MotionConfig` policy.

## House motion contract

These recommendations intentionally map to the already-defined token system,
rather than inventing a second timing vocabulary.

| Moment                                                                      | In-house treatment                                                            | Token             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------- |
| Pointer-following highlight / drag tracking                                 | Direct, continuously interruptible tracking. No perceptible lag.              | `spring.fast`     |
| Press acknowledgement, icon/label swap, hover-revealed secondary affordance | Small transform or opacity change; a label crossfades instead of teleporting. | `spring.quick`    |
| Selection movement, local disclosure, compact async card opening            | Preserve the shell; it makes room, then its content reveals.                  | `spring.moderate` |
| Side panel, inspector, step change, substantial artifact surface            | Backdrop first, surface from its spatial origin, faster exit.                 | `spring.slow`     |

The repo rules remain non-negotiable: animate transform/opacity rather than
layout properties; exits are faster than entrances; do not animate mid-drag;
and map a label change through a crossfade. This also fits Base UI's
transition-over-one-shot-animation recommendation. A useful additional rule:
**streaming is content arrival, not typing theatre**. Reveal incoming text at
the stream's natural cadence; use a subtle live cursor or status indicator,
not per-character spring animation.

## Component domains to build

Prioritize components with repeated product value and clear composition from
existing primitives. Each should be source-distributed, slots-first, typed by
domain state, and usable independently—not a locked-in app template.

### 1. AI workbench — first priority

AI Elements explicitly demonstrates that chat becomes a system of separate
parts, not just bubbles: its overview covers chat, workflows, IDEs and voice
agents ([AI Elements](https://elements.ai-sdk.dev/)). Build this as the first
compound domain.

| Component family                                            | Job and composition                                                                                                                                                                                                     | Motion story                                                                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Conversation`, `Message`, `MessageActions`, `BranchPicker` | Scroll area + message rows + markdown/code + actions + alternatives.                                                                                                                                                    | New message settles from its author edge; branch changes crossfade/directionally swap only the response body. |
| `PromptComposer`                                            | Textarea, attachment shelf, model selector, context chips, tool toggles, send/stop. The reference [Prompt Input](https://elements.ai-sdk.dev/components/prompt-input) validates attachments + model choice as one task. | Attachments merge into the composer; send turns draft into a queued row; stop becomes available immediately.  |
| `AgentActivity` / `ReasoningDisclosure`                     | Collapsible step list for a plan, reasoning summary and live stage.                                                                                                                                                     | Compact live state pulses quietly; completed detail folds away rather than vanishing.                         |
| `ToolRun` / `ApprovalRequest`                               | Tool header, status, summary, parameter inspector, result/error, approve/deny.                                                                                                                                          | The shell expands before input/output appears; approval uses a clear held state, never a spinner.             |
| `Sources`, `Citation`, `ArtifactDock`                       | Provenance preview plus a dockable code/document/image result surface.                                                                                                                                                  | Citation opens from its inline anchor; artifact panel comes from the selected result edge.                    |
| `TaskQueue`, `AgentHandoff`, `RunHistory`                   | Queued work, ownership, progress and recoverable history.                                                                                                                                                               | A task moves between labelled states; ownership handoff is explicit, not a silent avatar swap.                |

### 2. Developer workspace — second priority

This complements agent workflows and produces high-value components that are
useful outside AI. AI Elements already treats file trees, terminals, commits,
test results and stack traces as separate components
([component catalog](https://elements.ai-sdk.dev/)).

- `WorkbenchShell`: resizable sidebar, tab strip, content pane and inspector.
- `FileTree` + `FileTabs`: reveal hierarchy in-place, animate only active
  indicator and newly opened content—not every tree node.
- `CommandPalette`: composed dialog + combobox + command groups + recent
  history; selection glides continuously.
- `DiffReview`: side-by-side/unified diff, line comments, resolved threads,
  change navigation and a compact review summary.
- `TerminalTranscript`: command/input/output, running state, copy/re-run and
  auto-follow that yields immediately when the reader scrolls up.
- `TestReport`, `StackTrace`, `RunActivity`: aggregate summary first; reveal
  only failing detail. AI Elements' [Tool status model](https://elements.ai-sdk.dev/components/tool)
  is directly applicable to run states.

### 3. Data and operations

- `SmartTable`: saved views, column controls, filter builder, selection,
  inline state and bulk-action tray.
- `FilterBuilder` / `QueryBuilder`: condition rows, nesting, previews and
  validation; added rows unfold from the add control, invalid parts remain
  visibly anchored to their error.
- `RecordInspector`: a side drawer for context-preserving read/edit/audit
  work; avoid navigating away from the table for routine edits.
- `JobMonitor` / `ImportMapper` / `IncidentConsole`: explicit lifecycle,
  metrics and failures with details disclosed by row.

### 4. Collaboration and decision-making

- `ActivityTimeline`, `CommentThread`, `PresenceCluster`, `NotificationCenter`.
- `DecisionCard` and `ApprovalRequest`: options, supporting evidence,
  owners, due state and immutable decision result.
- `WorkspaceSwitcher`, `RoleEditor`, `InviteFlow`: administrative work that
  benefits from guided, confidence-building transitions instead of generic
  form pages.

### 5. Configuration, commerce and onboarding

- `SetupChecklist` / `ConfigurationWizard`: progress, prerequisites,
  validation and return-to-later state.
- `IntegrationConnect`: provider choice, permissions, redirect/return state,
  success verification and recovery.
- `PlanSelector`, `UsageMeter`, `APIKeyLifecycle`: clarify changes and
  consequences; success settles, destructive actions require a calm,
  explicit confirmation rather than dramatic motion.

## Delivery strategy

Start with an **AI workbench vertical slice**: `PromptComposer` → streamed
`Conversation` → `AgentActivity` → `ToolRun`/approval → `ArtifactDock`.
It exercises the most important interaction contracts—streaming, async state,
disclosure, provenance, error/retry, and an inspector—while drawing heavily on
already shipped primitives (Dialog, Drawer, Popover, Menu, Combobox,
Accordion, Tabs, ScrollArea once available).

Then extract stable cross-domain pieces (`StatusBadge`, `ActivityRow`,
`InspectorPanel`, `ResizableShell`, `EmptyState`, `BulkActionTray`) rather than
prematurely generalizing the AI-specific components. The collection should
grow by proven workflow units, each with a state table, accessibility contract,
motion story, reduced-motion version and a realistic demo—not disconnected
“cool effects.”

## Source index

- [beUI — official component overview](https://beui.dev/)
- [Aceternity UI — official categories](https://ui.aceternity.com/categories)
- [Aceternity UI — Terminal](https://ui.aceternity.com/components/terminal)
- [shadcn/ui — Blocks](https://ui.shadcn.com/blocks)
- [shadcn/ui — Blocks authoring](https://ui.shadcn.com/docs/_blocks)
- [Vercel AI Elements — official overview](https://elements.ai-sdk.dev/)
- [Vercel AI Elements — Prompt Input](https://elements.ai-sdk.dev/components/prompt-input)
- [Vercel AI Elements — Reasoning](https://elements.ai-sdk.dev/components/reasoning)
- [Vercel AI Elements — Tool](https://elements.ai-sdk.dev/components/tool)
- [Base UI — Animation handbook](https://base-ui.com/react/handbook/animation)
- [Base UI — Popover](https://base-ui.com/react/components/popover)
- [Motion for React — accessibility](https://motion.dev/docs/react-accessibility)
