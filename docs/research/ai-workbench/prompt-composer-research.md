# PromptComposer — UI/UX and motion research

Research pass for the planned AI-workbench `PromptComposer`: draft input,
attachments, context chips, model/tool choices, and immediate send/stop states
([`docs/ideas.md`](../../ideas.md#conversation-and-composition)). Sources below
are owned by the relevant standards body, framework, or product maintainer;
they are reference material for interaction decisions, not visual attribution
to render in the component docs.

## Recommended interaction model

Treat the composer as one persistent writing surface with two compact,
secondary rows: **context above the text** (attachments and explicit scope),
then **controls below it** (model/tools and the primary action). Do not make
attachments, scope, and model choice compete with the prompt itself.

| Element                     | Proposed behaviour                                                                                                                                                                                                                                                                                                                                                                             | Source / reason                                                                                                                                                                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft field                 | Use a native multiline `<textarea>` with an always-available visible prompt label or accessible name. Let the browser retain ordinary editing, selection, cursor and IME behaviour.                                                                                                                                                                                                            | WAI-ARIA advises that browser-native text editing is the robust route and that JavaScript must not capture editing keys ([APG combobox keyboard note](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)). This applies even more strongly to a freeform composer, which is **not** a combobox.                          |
| Send shortcut               | `Enter` sends only when the draft is non-empty and no suggestion menu is active; `Shift+Enter` always creates a newline. Ignore shortcuts while `event.isComposing` so IME text can commit. Show the shortcut in the send button tooltip/accessible description. Do not require key timing.                                                                                                    | All functionality needs a keyboard equivalent and no timing-dependent keystrokes ([WCAG 2.2 SC 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)). The conditional Enter policy preserves normal multiline writing while making the frequent action quick.                                                                    |
| Slash / mention suggestions | Keep focus in the textarea, expose the suggestions as a listbox, and give `Escape` a reliable dismiss-without-change path. Arrow keys navigate only while the popup is open; Enter accepts the active suggestion before it can submit.                                                                                                                                                         | The [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) specifies collapsed-by-default popups, `Escape` dismissal, arrow navigation, `Enter` acceptance, and maintaining DOM focus on the input with `aria-activedescendant`.                                                                                     |
| Attachments                 | Put attached files in removable, name-first chips above the textarea. Each chip needs its own remove button and status (`Uploading…`, `Ready`, `Couldn’t upload`); reject/error state must remain visible, not turn into a generic disabled send control.                                                                                                                                      | ChatGPT’s official [File Library guide](https://help.openai.com/en/articles/20001052-file-storage-and-library-in-chatgpt) describes adding saved files via the composer attachment/add menu; Vercel’s maintained [AI Chatbot template](https://github.com/vercel/ai-chatbot) is a usable implementation reference for a full AI chat surface. |
| Context chips               | Use tokens only for explicit, inspectable context: a file, selection, repository, or user-added instruction. Keep a concise label, icon/type, and remove affordance; overflow should summarize (for example, “+3”) and open a reviewable list.                                                                                                                                                 | Chips are compact controls, so each must stay keyboard-operable under [WCAG keyboard requirements](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html); the planned workbench specifically calls for attachments and context chips, not opaque implicit context ([ideas](../../ideas.md#conversation-and-composition)).                |
| Model/tool choices          | Keep choices adjacent to send but visually quieter. A model trigger opens a standard menu/select; a tools trigger should report the number enabled. Choices that change capability need a plain-language description, not icon-only state.                                                                                                                                                     | WAI’s [keyboard-interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) requires predictable tab order and visible focus; every pointer control needs a keyboard equivalent.                                                                                                                                       |
| Sending                     | On submit, immediately preserve the submitted user message, clear the editable draft only after acceptance, and replace the send control with a labelled **Stop** action. Keep model/tool controls disabled only if the runtime truly cannot accept changes; never replace a running state with an indefinite spinner.                                                                         | The planned component explicitly requires “immediate send/stop states” ([ideas](../../ideas.md#conversation-and-composition)). Vercel’s [agent session guidance](https://github.com/vercel/eve/blob/main/docs/guides/frontend/overview.mdx) models Stop as a real cancellation action for the active turn, not a decorative loader.           |
| Stop / progress             | Stop is a button whose label is stable and whose action is safe to invoke once. Announce state changes in a concise polite live region (for example, “Generating response” / “Generation stopped”); keep detailed tool activity in `AgentActivity`, not in the composer. Progress bars alone are not live regions, so announce upload/result changes too; reserve assertive alerts for errors. | Live, moving or auto-updating information must be pausable, stoppable, or hideable when relevant ([WCAG 2.2 SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)); W3C’s [ARIA25 technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA25) specifies `role=status` for status messages.                         |

## Visual direction to borrow, not copy

The strongest visual premise is **calm utility**: a raised, rounded composition
surface; context/readiness represented by small structured chips; one obvious
primary action at the lower-right. It should feel like an editor that can run
work, not a marketing chat bubble.

- Make prompt text the highest-contrast, largest visual element. Placeholder
  copy should describe a useful first action, not duplicate the field label.
- Use attachment/context chips for _reviewable inputs_, not status decoration.
  The user should be able to answer “what will the agent see?” before Send.
- Keep configuration progressively disclosed: model name and tool-count visible;
  fine-grained settings in their own menu/popover.
- Give Stop visual parity with Send while it is active: same physical location
  and hit area, square/stop icon plus text/accessible label. It is a control,
  not an error state.
- Keep the composer task-centric. ChatGPT’s [Canvas documentation](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt)
  is useful precedent for tool access and slash-command initiation, while
  Anthropic’s [Artifacts announcement](https://www.anthropic.com/news/artifacts)
  supports locating substantial output in an adjacent work surface instead of
  cramming artifact controls into the input.

## Motion contract

The repository already has the governing implementation contract in
[`docs/design-system.md`](../../design-system.md#motion--interaction-principles).
The composer should use that system rather than introduce a bespoke “AI is
thinking” animation.

| Moment                                   | Motion                                                                                                                                       | Token / reduced-motion behaviour                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Add or remove an attachment/context chip | One focal layout change: fade the chip and travel it 4px from the add-control side. Removal exits faster. Do not bounce every chip in a row. | `spring.quick` enter / its exit. With reduced motion, opacity only.                |
| Open a model/tools/suggestion surface    | Fade with 4px travel from its trigger. The field itself stays anchored; only the new surface arrives.                                        | `spring.moderate` for the small expansion/open; opacity only when reduced.         |
| Send ↔ Stop                              | Crossfade the action’s icon and label in place; do not rotate or morph the whole composer. Persist its width to prevent layout shift.        | `spring.quick`; opacity/colour only when reduced.                                  |
| Upload/agent active                      | Use a static status label and, if necessary, a small opacity pulse with a finite run. No perpetual spinner is required for comprehension.    | `spring.quick` feedback. Preserve the label and final status under reduced motion. |
| Validation/error                         | Change colour and show text immediately; one short opacity entrance for an error line is enough. Do not shake the composer.                  | `spring.quick`, opacity only.                                                      |

Motion for React supports this directly: `MotionConfig reducedMotion="user"`
honours the operating-system preference and `useReducedMotion` lets a component
replace transform animation when it needs a custom variant ([Motion accessibility
guide](https://motion.dev/docs/react-accessibility)). At the CSS boundary,
`prefers-reduced-motion: reduce` detects the user preference
([MDN reference](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
For this repository, retain opacity and colour feedback but remove travel,
scale, layout movement, and bounce as mandated by the local design system.

## Build-ready decisions

1. Build with `<textarea>` + buttons, not `contenteditable`; it protects text
   editing and makes multiline behaviour predictable.
2. Separate state axes: `draft`, `attachments`, `context`, `isSending`, and
   `canStop`. Sending must not erase attachment upload failures or context.
3. Define exact keyboard precedence: an open suggestion menu owns arrows /
   Enter / Escape; otherwise `Enter` submits and `Shift+Enter` adds a line;
   neither intercepts an in-progress IME composition.
4. Treat Stop as an explicit callback (`onStop`), expose it in the API, and
   announce its result. Do not conflate Stop with disabling the form.
5. Implement animations with transform/opacity only and local `spring` tokens;
   test with the OS reduced-motion preference before registering examples.
