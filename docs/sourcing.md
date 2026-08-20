# Sourcing standard

A filter for deciding what goes on the roadmap. It is not a veto. If you
want to build something that fails every test here, build it. What this doc
is for is choosing between ten plausible ideas when there is time for two.

The reasoning is that the registry cannot win on coverage, so it has to win
on selection. shadcn, Base UI, Radix and TanStack already own the
primitives, and a library competing on breadth loses to the more trusted
name. A half-finished Data Table is worth less than no Data Table. What is
still unclaimed is the interaction people have already noticed in a product
they use daily and cannot install anywhere.

Precedence: this doc governs what gets built.
[design-system.md](design-system.md) governs how it looks and moves. Neither
overrules the other.

## The formula

Emil Kowalski, on why Sonner spread the way it did: the stacking animation
"was done by some companies before, but never open sourced."

Two halves.

**Recognition.** The reader has seen this before, in something they like.
The demo does not need explaining, because they are not learning a new
interaction, they are recognising one and realising it is available.

**Availability.** Nobody has shipped it as something you can install. The
moment somebody does, most of the value is gone.

Sonner, Vaul, NumberFlow and input-otp all fit the shape: a boring job, one
physical detail obsessed over, previously locked inside somebody's private
codebase.

## Three tests

The more of these an idea passes, the better it will do. All three is the
target.

1. **It does a real job.** Somebody would reach for it while building a
   product, not while building a portfolio. Decorative components get shared
   once and installed never.
2. **It has one signature detail.** A single physical behaviour that is the
   reason to choose it over the generic version. If the pitch needs two
   sentences, the detail is probably not sharp enough yet.
3. **It is unclaimed.** See the saturation check below.

## The saturation check

Before starting, search the idea across the clone tier: Aceternity UI, Cult
UI, SmoothUI, Magic UI, Skiper UI, Kibo UI, Origin UI. Then across the
single-purpose libraries: Sonner, Vaul, cmdk, NumberFlow, input-otp,
dnd-kit, react-resizable-panels, Leva.

Several hits is a strong signal to drop it and spend the time elsewhere. It
means the recognition is still there but the availability is gone, and being
the sixth version of something is a bad trade.

Dynamic Island is the example. Emil built the original, then Aceternity,
Cult UI, SmoothUI and Skiper UI all shipped one. It is among the most
recognisable interactions on the web and there is nothing left to claim.

## The three-second silent loop

Record the interaction, crop to the element, mute it, loop it. Show it to
somebody who has never heard of trove/cn.

If they understand what happened and why it beats the ordinary version
within three seconds and without a caption, it passes. If it needs a
caption, the signature detail is buried, and that is usually a problem with
the component rather than with the clip.

## What this deprioritises

**Primitives a trusted library already owns.** Command palettes, data
tables, toasts, drawers, date pickers. Worth building when a demo needs one.
Not worth leading with.

**Compositions dressed up as components.** A bulk action tray or an undo
snackbar is a shape rather than a signature detail. They work better inside
a composed example.

**Effects with no job attached.** A pure visual trick with nothing to
install behind it gets shared once and used never. Test 1 exists to catch
these.

## Where this does not apply

The AI workbench spine in [ideas.md](ideas.md) is exempt. Those components
earn their place by completing a workflow rather than by spreading, and the
collection needs all of them to be worth anything.

This standard shapes what gets added next. It has no authority over what is
already on the roadmap.
