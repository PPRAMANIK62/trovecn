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
agent:

```text
PromptComposer → Conversation → AgentActivity → ToolRun / Approval → ArtifactDock
```

It is the best first slice because it proves the important contracts in one
coherent environment: streaming, asynchronous work, errors and recovery,
provenance, progressive disclosure, and a context-preserving inspector.

### Conversation and composition

- `PromptComposer` — draft input, attachments, context chips, model/tool
  choices, and immediate send/stop states.
- `Conversation` — message rows, markdown and code, message actions, and
  response branches.
- `BranchPicker` — compare or return to alternative responses without losing
  the conversation anchor.
- `Citation` and `Sources` — inline provenance with source preview and an
  inspectable source list.

### Agent execution

- `AgentActivity` — readable live plan and stage list.
- `ReasoningDisclosure` — a controllable summary/detail surface that can be
  live while work runs and compact once it completes.
- `ToolRun` — queued/running/approval/success/error states, input/output
  summaries, and inspectable parameters.
- `ApprovalRequest` — a stable, explicit pause for a user decision; never a
  spinner standing in for consent.
- `TaskQueue`, `AgentHandoff`, and `RunHistory` — background work, ownership,
  recovery, and durable history.

### Results and artifacts

- `ArtifactDock` — a dockable result surface for code, documents, images, or
  structured data.
- `CodePreview`, `FileTree`, `TerminalTranscript`, and `TestReport` —
  focused artifact viewers that can also stand alone in developer products.

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
  resolution, and review summary.
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
  credentials, and explicit destructive confirmation.

## Supporting components to extract when proven

The workflow collections should lead. Once used across two or more domains,
extract stable building blocks rather than generalizing early:

- `StatusBadge` and `ActivityRow`
- `InspectorPanel` and `ResizableShell`
- `EmptyState` and `BulkActionTray`
- `ProgressNarrative` and `ErrorRecovery`
- `SourcePreview` and `ArtifactHeader`

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
