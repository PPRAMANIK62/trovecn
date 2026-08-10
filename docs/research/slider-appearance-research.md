# Slider appearance research

Date: 2026-08-10

## What exists here

`src/components/ui/slider.tsx` is a deliberately quiet horizontal form slider: a 6px rounded rail, ink fill, 16px circular outlined thumb, label plus value readout, and a value tooltip for hover, focus, and drag. It supports one value or a two-thumb range. Motion is already purposeful: the thumb tracks directly while dragging and only spring-settles when the value changes outside that gesture. This is an excellent **precision rail** baseline, so a new appearance should change the _reading model_, not merely swap a circle for a novelty thumb.

The current public API omits Base UI's `orientation` prop, although the underlying primitive supports horizontal and vertical controls, edge thumb alignment, and several multi-thumb collision policies. [Base UI Slider documentation](https://base-ui.com/react/components/slider)

## Reference patterns, distilled

| Pattern                   | What official guidance/source establishes                                                                                                                                                                                                                                                                                                                                                                                                          | Distinctive use, rather than default decoration                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Continuous rail           | Apple defines sliders as a finite continuous or discrete range and recommends live feedback when the changed value has a visible result. [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2)                                                                                                                                                                                                            | Keep the present component as the low-noise setting control for opacity, volume, etc.                                |
| Calibrated/discrete rail  | Apple recommends tick marks and selective labels for clarity and nonlinear scales; MUI supports marks and a marks-only selection mode. [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2), [MUI Slider](https://mui.com/material-ui/react-slider/)                                                                                                                                                     | Use a visible scale only when values are named or intentionally sparse—e.g. 1×, 2×, 4×, 8×—not for every `step={1}`. |
| Inverted / remaining rail | MUI explicitly supports normal, inverted, and absent track presentations. [MUI Slider API](https://mui.com/material-ui/api/slider/)                                                                                                                                                                                                                                                                                                                | Remaining capacity, headroom, and budgets read more honestly with the unfilled/remnant portion emphasized.           |
| Range / interval          | Base UI provides two-thumb ranges and collision behavior; W3C calls out independent thumb names, stable tab order, and dynamically updated min/max semantics. [Base UI Slider](https://base-ui.com/react/components/slider), [W3C multi-thumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)                                                                                                                                | Treat the selected area as an interval object, not two copies of a single-value control.                             |
| Vertical fader            | Both Base UI and Salesforce expose vertical orientation; Apple reserves vertical controls for the familiar bottom-to-top min→max mapping. [Base UI Slider](https://base-ui.com/react/components/slider), [Salesforce Slider](https://developer.salesforce.com/docs/component-library/bundle/lightning-slider/bundle/lightning-input/documentation), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2) | Audio/mixer/tool palettes only, where a column of faders makes scanning more efficient.                              |
| Circular dial             | Apple specifically recommends a circular slider for repeated or continuous values such as rotation. [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2)                                                                                                                                                                                                                                                 | A separate control for angle, phase, or loop count—not a cosmetic alternate for a finite linear value.               |

## beUI check: inspiration to avoid copying

The public beUI component is called **Range Slider** (under Motion). Its source describes and implements: a muted, rounded rectangular track; tick dots at every step; an inset vertical-bar thumb; and `scaleY` bounce while dragging. [beUI raw registry item](https://beui.dev/r/range-slider.json)

Those choices are cohesive, but their combination is recognizably beUI. Do not make a Trove variant by changing only its colours. In particular, avoid the **rounded-container + evenly-spaced dot field + single bouncing vertical bar** silhouette. beUI's wider Motion catalogue has several good motion principles to borrow at a distance—clear physical feedback and reduced-motion handling—but not a visual recipe to reproduce. [beUI Motion catalogue](https://beui.dev/components/motion)

## Recommended directions for Trove

### 1. Index ruler — recommended first addition

A technical, editorial slider that reads like a measuring instrument:

- Preserve the thin, full-width rail, but add a restrained **major-mark ruler** below it (3–7 labeled landmarks; minor marks only when useful).
- Change the thumb to a narrow **index cursor**: a 2px vertical rule crossing the rail, with a small square reading chip offset below it. The chip is persistent only at focus/drag; at rest the header value remains the primary readout.
- The fill should be a quiet 1px ink line rather than a pill. The cursor—not a louder coloured track—does the visual work.
- Suitable for zoom, type scale, timing, rate limits, temperatures, and nonlinear values. It aligns especially well with this repo's Geist Mono metadata and catalogue character.

This is not beUI's bar thumb: its emphasis is a typographic _index on a scale_, with sparse labeled landmarks rather than a dot-grid inside a pill.

### 2. Bracketed interval

A range-specific appearance for prices, dates-as-numbers, or tolerance bands:

- Render each thumb as a compact opposing bracket/corner marker, so the selected range reads as a movable span rather than two generic knobs.
- Put the formatted range in a small centered **interval caption** that lives _inside the selected span_ when there is room; otherwise dock it above the active endpoint. Never allow it to obscure either thumb.
- Use a fine hatch or denser rule inside the selected region rather than a solid coloured fill. This keeps the system neutral and makes selection extent legible in light and dark themes.
- Preserve individual accessible thumb labels and constant tab order, per W3C's multi-thumb guidance.

This direction is only valuable as a range variant; shipping it for a one-value slider would dilute its meaning.

### 3. Threshold rail

A semantic slider for controls with meaningful zones (quality, cost, risk, retention):

- Divide the rail into 3–5 _labeled bands_ using hairline separators, not rainbow colours. Examples: `Conservative / Balanced / Aggressive`, or `Draft / Review / Publish`.
- A thin active marker crosses the rail at the exact value; the active band gains surface contrast and its label gains ink weight. This supports both precise values and the human meaning of a region.
- Provide `aria-valuetext` for named states rather than exposing an arbitrary numeric percentage. W3C specifically recommends it when the numeric value is not user-friendly. [W3C multi-thumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)

Use this when the range has real decision thresholds. It should not become a generic visual preset for a 0–100 input.

### 4. Fader strip

A vertical-only, high-density variant for an audio mixer, color channels, or design tool inspector:

- A tall, narrow lane with end labels, a substantial horizontal fader cap, and a level fill rising from the bottom.
- Multiple faders form a deliberate aligned **bank**; the group, not a lone fader in a form, earns this appearance.
- Offer an explicit numeric field/readout beside each fader for precision and touch/accessibility fallback. Carbon makes the same practical case for a numeric input accompanying sliders. [Carbon Slider usage](https://carbondesignsystem.com/components/slider/usage/)

This is a useful expansion of the primitive's vertical support, but it needs a small API/design pass because the current wrapper fixes horizontal orientation.

### 5. Radial dial — separate component, not `Slider` variant

For cyclic values only, introduce a future `Dial` primitive with an arc, start reference mark, and numeric readout. Rotation, hue angle, pan, and loop count can then be read spatially; opacity and price cannot. Apple makes this same distinction between fixed endpoints and values that repeat or continue indefinitely. [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2)

## A coherent small family

Keep the existing component as **Slider / Rail**. If additions are desired, name them by the information they reveal, not by visual novelty:

- `Slider` — direct continuous precision (existing)
- `SliderRuler` — calibrated values and named stops
- `RangeSlider` or `SliderInterval` — a selected span
- `Fader` — vertical mixer/tool control
- `Dial` — cyclic values, separate primitive

Avoid an unbounded `variant` prop that mixes all five. The interaction model, layout, and accessibility differ enough that composition or small dedicated components will stay clearer.

## Guardrails for implementation

- Preserve the existing direct 1:1 thumb follow during drag; any settle motion happens after release or external value changes. The fill/selection region should remain derived from that same position source, never independently animated.
- Keep visible values available on focus and active interaction. Carbon explicitly recommends a tooltip on hover, focus, and active when no number inputs are present. [Carbon Slider usage](https://carbondesignsystem.com/components/slider/usage/)
- Use labels or explicit `aria-label`s for every thumb; distinguish the two ends of a range. [Base UI Slider](https://base-ui.com/react/components/slider)
- Use marks sparingly: labels at endpoints and meaningful landmarks are more legible than a sea of dots. Apple advises that labeling every tick is usually unnecessary. [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders?changes=__2)
- Do not turn a slider into a date picker or use it for huge/finicky numeric ranges. Carbon advises against date selection and very large ranges; provide a number input where exact entry matters. [Carbon Slider usage](https://carbondesignsystem.com/components/slider/usage/)
