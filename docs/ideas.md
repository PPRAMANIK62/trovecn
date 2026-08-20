# Planned component collection

This is the planned direction for trove/cn: composed, source-distributed UX
components for real product work. The collection sits above the primitive
layer. A primitive solves one interaction correctly; a planned component
combines primitives, state, content hierarchy, and motion into a reusable
user task.

This is deliberately not a checklist of effects or a catalogue to recreate.
Every component should be built in-house, with its own API and visual
language, and must earn its motion through a clear behavioural purpose.

For the evidence, reference ecosystems, state-model guidance, and detailed
motion recommendations behind this plan, see
[Compound UX components research](research/ux-component-ecosystem.md).

What gets added to this roadmap is governed by the
[sourcing standard](sourcing.md). Vetted candidates that clear it are in
[signature components](signature-components.md). The AI workbench spine
below predates that standard and is exempt from it.

## Product principles

- **Own a job, not an element.** `ToolRun` owns a tool's lifecycle, approval,
  result, failure, and inspection; it is not simply a styled accordion.
- **Make state readable.** Async work distinguishes `idle`, `queued`,
  `working`, `needs input`, `completed`, `failed`, and `cancelled`.
- **Compose from the house primitives.** Patterns reuse the shared focus,
  keyboard, portal, elevation, and motion behaviour rather than reaching
  directly into Base UI.
- **Motion communicates.** Selection glides, expansion makes room then
  reveals, success settles, and errors stay anchored to their cause. One
  focal movement per component.
- **Keep user agency.** Streams can stop, work can retry or undo, and every
  gesture can reverse naturally from its current position.
- **Respect attention and accessibility.** Dense detail is progressively
  disclosed. Reduced motion retains status, opacity, colour, and final state
  while removing travel, bounce, and parallax.

The timing and reduced-motion contract in
[the design system](design-system.md#motion--interaction-principles) remains
the source of truth for implementation.

## First planned collection: AI workbench

The first collection is an end-to-end workspace for collaborating with an AI
agent. Each component earns its place by owning a distinct job in that
lifecycle — not by matching a feature list from an existing product.

```text
PromptComposer → Conversation → PlanChecklist → ToolRun → ApprovalRequest →
ChangeReview → ErrorRecovery → RunHistory → ContextMeter → ArtifactDock
```

This is the required spine for a regular agent workflow: capture intent,
show history, state the plan, do the work, gate consequential actions, let
the user review and accept what changed, recover cleanly when it breaks,
resume past runs, and stay aware of the context/cost budget. Everything
under "Deferred" below is conditional on a vertical (retrieval grounding,
branching chat, multi-agent orchestration) and should wait for a real demo
that needs it, rather than being built ahead of use.

### Built

- `PromptComposer` — draft input, attachments, context chips, model/tool
  choices, and immediate send/stop states.
- `Conversation` — message rows, markdown and code, message actions, and
  response branches.
- `AgentActivity` — readable live plan and stage list, including inline
  streaming reasoning text. Supersedes the separate `ReasoningDisclosure`
  idea this document used to list — the two shared one job.
- `ToolRun` — queued/running/approval/success/error states, input/output
  summaries, and inspectable parameters.
- `ApprovalRequest` — a stable, explicit pause for a user decision; never a
  spinner standing in for consent.

### Next

- `PlanChecklist` — the agent's stated intentions before and while it acts:
  pending/in-progress/done items, live-editable and reorderable. Distinct
  from `AgentActivity`: that component narrates what already happened, this
  one states what's about to happen.
- `ChangeReview` — proposed edits (code, prose, config, a record's fields —
  not just files) presented for accept/reject/amend, hunk by hunk. This is
  where most agent products actually earn trust, not only in `ArtifactDock`.
  The fuller PR-style `DiffReview` under Developer workspace below composes
  this primitive rather than duplicating it.
- `ErrorRecovery` — anchored failure state with retry/rollback for any of
  the above. Promoted out of "supporting components to extract" below: every
  one of the spine's stateful pieces will fail sometimes, and how failure
  surfaces is not a polish pass, it's core trust infrastructure.
- `RunHistory` — resume a past run or session. Promoted for the same reason:
  almost no agent product ships without a session list.
- `ContextMeter` — a live, per-run signal (tokens/context window/cost so
  far). Distinct job from the billing-page `UsageMeter` below — this one
  answers "is my context about to fall off a cliff mid-task," not "what's my
  plan limit."

### Composed demo: Codex-style workbench

Once `PlanChecklist` and `ChangeReview` exist, add a single composed
Examples-page recipe (alongside `steered-conversation`) that assembles the
spine into one screen: a sidebar listing mock projects and chats, and an
active conversation pane running a plan → tool call → approval → change
review loop. State-only sidebar, no real routing — it proves the components
work together, it isn't a mini-app.

### Deferred — conditional on a vertical, not core to a regular workflow

- `BranchPicker` — compare or return to alternative responses without losing
  the conversation anchor. Real, but specific to chat-regenerate UX; most
  agent apps don't expose branching.
- `Citation` and `Sources` — inline provenance with source preview and an
  inspectable source list. Only matters once a demo is grounded in
  retrieval.
- `ArtifactDock` — a dockable result surface for code, documents, images, or
  structured data. Still the spine's last node, but lower priority than the
  items above; build it once a demo needs a result surface beyond
  `ChangeReview`.
- `CodePreview`, `FileTree`, `TerminalTranscript`, and `TestReport` — focused
  artifact viewers. IDE-specific instantiations of `ArtifactDock`; build
  each only once a developer-workspace demo needs that exact artifact type.
- `TaskQueue` and `AgentHandoff` — background job ownership and multi-agent
  handoff. Real trend, but most people building agent apps today run one
  agent, not a fleet.

## Planned domain collections

### Developer workspace

Components for building, reviewing, and diagnosing software without turning
the registry into a full IDE template.

- `WorkbenchShell` — resizable navigation, tab strip, content pane, and
  inspector.
- `CommandPalette` — commands, search, grouped results, recent history, and
  keyboard-first selection.
- `FileTree` and `FileTabs` — hierarchy, active state, pinned items, and
  context actions.
- `DiffReview` — unified/side-by-side changes, line comments, threads,
  resolution, and review summary. Composes the workbench's `ChangeReview`
  primitive rather than duplicating its accept/reject job.
- `TerminalTranscript` — commands, output, live runs, copy/re-run, and
  deliberate auto-follow behaviour.
- `TestReport`, `StackTrace`, and `RunActivity` — summary-first diagnosis with
  failing detail available in place.

### Data and operations

Components for high-density work where context, bulk action, and long-running
status matter more than visual novelty.

- `SmartTable` — saved views, column controls, filters, selection, inline
  state, and a bulk-action tray.
- `FilterBuilder` and `QueryBuilder` — nested conditions, live previews,
  validation, and readable errors.
- `RecordInspector` — context-preserving read/edit/audit work beside a list.
- `JobMonitor`, `ImportMapper`, and `IncidentConsole` — lifecycle, progress,
  failure, metrics, and details at the relevant row.

### Collaboration and decisions

Components that make ownership, discussion, and outcomes obvious.

- `ActivityTimeline` and `CommentThread` — a readable event history and
  focused discussion surface.
- `PresenceCluster` and `NotificationCenter` — calm awareness of people and
  changes without persistent distraction.
- `DecisionCard` and `ApprovalRequest` — options, evidence, owner, due state,
  and a durable decision record.
- `WorkspaceSwitcher`, `RoleEditor`, and `InviteFlow` — administrative tasks
  with progressive disclosure and confidence-building state changes.

### Configuration, billing, and onboarding

Components for consequential setup and account decisions, designed to explain
progress and consequences clearly.

- `SetupChecklist` and `ConfigurationWizard` — prerequisites, validation,
  progress, and safe return-later state.
- `IntegrationConnect` — provider selection, permissions, redirect/return,
  verification, and recovery.
- `PlanSelector`, `UsageMeter`, and `APIKeyLifecycle` — plans, limits,
  credentials, and explicit destructive confirmation. `UsageMeter` here is
  the account/billing view; the workbench's `ContextMeter` is a different,
  live per-run job and is not replaced by this one.

## Supporting components to extract when proven

The workflow collections should lead. Once used across two or more domains,
extract stable building blocks rather than generalizing early:

- `StatusBadge` and `ActivityRow`
- `InspectorPanel` and `ResizableShell`
- `EmptyState` and `BulkActionTray`
- `ProgressNarrative`
- `SourcePreview` and `ArtifactHeader`

`ErrorRecovery` used to be listed here; it moved to the AI workbench spine
above once the acceptance-standard cost of "not core" stopped applying to
it.

## Component acceptance standard

Every planned component ships with a realistic demo and documents:

1. Its user job and public API.
2. Its state model, including loading, error, empty, and recovery paths.
3. Keyboard, focus, and screen-reader behaviour.
4. Its motion story, shared spring tier, and reduced-motion version.
5. The primitives and dependencies it composes.

The collection grows through complete workflow units—not disconnected visual
effects. A component should leave a user with a better understanding of what
is happening, what they can do next, and how to recover when work fails.
