# What to build

Read this before proposing a component.

## The test

1. Would someone reach for this while building a product? Not while building a
   portfolio.
2. Describe how it behaves under the hand, in one sentence. Not what it looks
   like. What it does while you drag it, and what happens if you let go
   halfway.
3. Is that better to use than the best version anywhere, web or native?

Question 2 is the bar. "A fresh take on tabs" says nothing and fails. "You drag
across the tabs and the content follows your finger, and releasing halfway
springs it back" passes, and it also tells you what to build.

A new idea passes the same way a fix does. It has to survive question 2.

## What you are competing with

Native, not other registries.

Native controls track your finger the whole time, can be grabbed
mid-animation, and have weight. Most web components fire once on click and
cannot be interrupted. That gap is why mobile apps feel better, and closing it
is what makes an interaction worth installing. So the answer to question 3 is
usually a native app.

## Before you start

Find the best existing version. Search the registries (Aceternity, Cult UI,
SmoothUI, Magic UI, Skiper UI, Kibo UI, Origin UI) and the single-purpose
libraries (Sonner, Vaul, cmdk, NumberFlow, input-otp, dnd-kit,
react-resizable-panels, Leva).

You are not checking whether you are allowed to build it. You are finding what
you have to beat. Use it, then write the question 2 sentence twice, once for
their version and once for yours.

If both sentences say the same thing, there is nothing to build.

If two ideas both pass, build the one nobody has done. That is efficiency, not
a rule.

## The silent clip

Record the interaction, crop to the element, mute it, loop it for three
seconds. Show it to someone who has never seen the site. If they need a
caption, the detail is buried. That is usually a problem with the component,
not the clip.

## Deprioritise

- **Primitives a trusted library already owns.** Command palettes, data tables,
  toasts, date pickers. Build one when a demo needs it. Do not lead with it.
- **Shapes rather than behaviours.** A bulk action tray or an undo snackbar has
  no answer to question 2. They belong inside a composed example.
- **Effects with no job.** A visual trick with nothing to install behind it
  gets shared once and used never.
- **Collections that need every part to be worth anything.** They only pay off
  on the last piece, so you cannot tell early whether starting was right.

## Next

**ListDetailMorph.** List to detail navigation, the most common transition in
software. The row you tapped becomes the detail view, and it is interruptible.
Hit back halfway and it reverses from where it is. View Transitions demos are
everywhere and none of them can do that, because the API cannot. Motion's
layout animations can, which is the whole opening.

Interruption has to work from the first commit, not be added later. Content
inside the morphing container has to crossfade at a fixed size while the
container animates, or the text stretches and it reads as a scale. Scroll
position has to survive the return trip.

## Backlog

Not tested yet. Ordered by fit.

- A container that grows to fit the decision inside it instead of swapping to a
  new screen. Family's tray.
- A preview card that morphs into the full record instead of dismissing and
  navigating. Builds on `preview-card`.
- Resizable panels with elastic snap points instead of a hard clamp.
- Word-level text rewrite. Old words fade out, the container width animates,
  new words fade in.
- Swipe triage card stack with throw physics, for review queues and inboxes.
- Marquee drag-select across a grid, with the count following the cursor.
- Time range brush dragged straight over a chart.

## Rejected

One line each, so the same ideas do not come back.

- **Dynamic Island.** The original plus four registry copies. Nothing left to
  claim.
- **CommandPalette.** cmdk owns it and every registry ships a wrapper.
- **UndoToast, BulkActionTray.** Shapes, not behaviours. Put them in a composed
  example.
- **DataTable.** TanStack owns the logic and the hard part is responsive
  layout, not interaction.
- **The AI workbench spine.** Six components shipped and stay maintained. The
  rest were a change review, an error state, a session list, and a usage meter.
  Do not extend the collection. Any one of them can come back as its own entry
  if it passes the test alone.

## Shipping

A component leaves this file with a real demo and a file header covering
everything `design-system.md` asks for.

Then delete its entry here. The site is the list of what is built, and this
file only answers what is next.
