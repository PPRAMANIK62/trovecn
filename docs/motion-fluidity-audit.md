# Motion fluidity audit

Visual and interaction review of the live component gallery. This is not a
compliance checklist: it asks whether a transition makes a user want to see
it again because it feels inevitable, responsive, and easy on the eye.

## Quality bar

Every motion should answer these questions:

1. **What changed?** The visual response must make the new state obvious.
2. **Where did it come from?** A surface should originate at its trigger,
   edge, pointer, or existing selected element.
3. **What stays still?** Preserve the user's point of reference; avoid
   moving the whole interface to explain a local change.
4. **What leads?** A containing surface makes room before its contents
   appear. Old content leaves faster than replacement content arrives.
5. **How often is it seen?** Repeated controls should be almost invisible;
   rare overlays can take a slightly more deliberate beat.
6. **How does it stop?** Reversing a hover, selection, or close action must
   continue naturally from the current state. With reduced motion, retain
   opacity and state feedback while removing travel and geometry motion.

The guiding principle is: users should understand _why_ an element moved,
then barely notice that it moved at all.

## Recommendations by component

| Component       | Recommended refinement                                                                                                              | Reason                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Accordion       | Open the row container first; fade and raise content by 2–4px just after it has space. Keep height easing bounce-free.              | It preserves the trigger as the anchor and prevents copy from appearing before its surface is ready.             |
| Button          | Retain the tiny press compression, but make release a touch softer than press.                                                      | Immediate acknowledgement stays crisp while the return feels cushioned instead of clicky.                        |
| Checkbox        | Settle the checked fill, then draw the check/indeterminate mark a fraction later.                                                   | A two-step sequence gives the mark a clear destination and a pleasing, readable finish.                          |
| Checkbox Group  | Apply the selected tint immediately and let merge/split geometry follow subtly.                                                     | Selection remains instant; visual grouping becomes supporting feedback rather than the event itself.             |
| Combobox        | Keep the popup footprint stable while filtering; crossfade or move result rows inside it instead of visibly animating its height.   | It prevents typing from causing a local layout reflow and makes filtering feel calm.                             |
| Context Menu    | Prefer a 3–4px pointer-origin travel plus fade to broad scale.                                                                      | Context menus should feel placed at the click point, not enlarged into the interface.                            |
| Dialog          | Fade the backdrop first, then introduce the panel from a small resting-point offset rather than scaling from nowhere. Close faster. | A centered modal still needs a spatial cue; this makes it read as a surface arriving, not a generic pop.         |
| Drawer          | Preserve the edge-attached entrance and drag behavior; reduce backdrop blur/weight slightly.                                        | The drawer has a strong physical origin already. A lighter backdrop keeps attention on the panel and its travel. |
| Menu            | Use slight trigger-side travel with opacity; keep scale nearly imperceptible, if present at all.                                    | Menus are frequent. Small origin-aware movement feels faster and becomes enjoyable through repetition.           |
| Navigation Menu | Crossfade/directionally move incoming content first, then settle viewport dimensions quickly behind it.                             | The surface should not look like it is reflowing; content continuity is more important than visible resizing.    |
| Popover         | Done — a 4px resolved-side offset and fade replace the generic scale-in.                                                            | The floating surface stays attached to its trigger even when collision handling changes its placement.           |
| Slider          | Done — the value label is thumb-anchored, tracks the live motion value, and dismisses with a quick fade on release.                 | The label remains a direct consequence of the drag rather than a separate floating animation.                    |
| Switch          | Use translation for the thumb and only a tiny press squash; reduce width/height morphing.                                           | Binary controls are used repeatedly. Clear, immediate travel feels more natural than expressive shape change.    |
| Tabs            | Done — the indicator retargets continuously, while outgoing content leaves slightly faster than the incoming panel settles.         | It prevents a succession of clicks from looking like resets and gives content swaps a clean handoff.             |
| Tooltip         | Done — a short hover-intent delay, resolved-side travel, and a faster dismissal keep the tooltip quiet.                             | Tooltips become helpful rather than sticky or attention-seeking during normal pointer movement.                  |

## Highest-impact work

1. **Overlays:** Dialog, Popover, Menu, and Context Menu should use origin-aware
   travel plus opacity instead of generic scale as their dominant cue.
2. **Dynamic surfaces:** Combobox and Navigation Menu should hide geometry
   changes behind a stable outer surface and transition content within it.
3. **Repeated controls:** Switch and Checkbox Group should simplify so instant
   state clarity wins over expressive shape choreography.
4. **Motion accessibility:** Apply the same reduced-motion contract to every
   component: snap/remove travel and geometry changes, but retain opacity and
   colour/state feedback.

## Implementation constraints

- Prefer `transform` and `opacity` for motion. Avoid directly animating
  `width`, `height`, `top`, or `left` where a stable shell plus child
  transition can communicate the change.
- Use the shared `spring.fast`, `spring.quick`, `spring.moderate`, and
  `spring.slow` tokens rather than creating component-specific timing.
- Keep feedback under 200ms, except for deliberate large-surface movement.
- Make exits faster than entrances.
- Test a rapid reversal for every hover, selected state, popup, and drawer;
  the next state should continue from the current position rather than snap.
