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

| Component       | Recommended refinement                                                                                                                        | Reason                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Accordion       | Open the row container first; fade and raise content by 2–4px just after it has space. Keep height easing bounce-free.                        | It preserves the trigger as the anchor and prevents copy from appearing before its surface is ready.             |
| Button          | Retain the tiny press compression, but make release a touch softer than press.                                                                | Immediate acknowledgement stays crisp while the return feels cushioned instead of clicky.                        |
| Checkbox        | Settle the checked fill, then draw the check/indeterminate mark a fraction later.                                                             | A two-step sequence gives the mark a clear destination and a pleasing, readable finish.                          |
| Checkbox Group  | Apply the selected tint immediately and let merge/split geometry follow subtly.                                                               | Selection remains instant; visual grouping becomes supporting feedback rather than the event itself.             |
| Combobox        | Keep the popup footprint stable while filtering; crossfade or move result rows inside it instead of visibly animating its height.             | It prevents typing from causing a local layout reflow and makes filtering feel calm.                             |
| Context Menu    | Prefer a 3–4px pointer-origin travel plus fade to broad scale.                                                                                | Context menus should feel placed at the click point, not enlarged into the interface.                            |
| Dialog          | Fade the backdrop first, then introduce the panel from a small resting-point offset rather than scaling from nowhere. Close faster.           | A centered modal still needs a spatial cue; this makes it read as a surface arriving, not a generic pop.         |
| Drawer          | Preserve the edge-attached entrance and drag behavior; reduce backdrop blur/weight slightly.                                                  | The drawer has a strong physical origin already. A lighter backdrop keeps attention on the panel and its travel. |
| Menu            | Use slight trigger-side travel with opacity; keep scale nearly imperceptible, if present at all.                                              | Menus are frequent. Small origin-aware movement feels faster and becomes enjoyable through repetition.           |
| Menubar         | Keep the outer popup stable when moving between top-level menus; directionally swap only inner content.                                       | It maintains the user's visual reference point and avoids a full-surface restart for every menu change.          |
| Navigation Menu | Crossfade/directionally move incoming content first, then settle viewport dimensions quickly behind it.                                       | The surface should not look like it is reflowing; content continuity is more important than visible resizing.    |
| Popover         | Add a 3–4px trigger-side offset and fade; avoid relying on a generic scale-in.                                                                | It makes the floating surface feel attached to the initiating control.                                           |
| Preview Card    | Limit hover feedback to a nearly imperceptible transform/opacity cue.                                                                         | This is frequently encountered reference UI; a full entrance on hover becomes tiring.                            |
| Radio Group     | Bring in the newly selected dot quickly and dismiss the old one faster.                                                                       | Changing one's mind feels direct, while the selected state remains the obvious focal point.                      |
| Select          | Keep the popup shell calm. Let the selected-row highlight glide, while option-list changes crossfade.                                         | Selection feedback stays fluid without making the entire option list shift or jitter.                            |
| Slider          | Anchor the value label to the thumb, let it track continuously, and dismiss it with a quick fade on release.                                  | The label remains a direct consequence of the drag rather than a separate floating animation.                    |
| Switch          | Use translation for the thumb and only a tiny press squash; reduce width/height morphing.                                                     | Binary controls are used repeatedly. Clear, immediate travel feels more natural than expressive shape change.    |
| Tabs            | Preserve the indicator's in-flight movement during rapid switching; let outgoing content leave slightly faster than incoming content arrives. | It prevents a succession of clicks from looking like resets and gives content swaps a clean handoff.             |
| Toggle          | Keep the state change almost immediate, with only a short pressed-depth response.                                                             | Toolbar actions benefit from certainty and speed; extra motion makes a simple binary action feel slow.           |
| Toggle Group    | Keep one shared selection indicator and add a subtle opacity handoff as it arrives at its destination.                                        | The indicator lands as a selected surface instead of merely sliding across controls.                             |
| Tooltip         | Keep minimal directional travel, use a short hover-intent delay, and dismiss faster than it enters.                                           | Tooltips become helpful rather than sticky or attention-seeking during normal pointer movement.                  |

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
