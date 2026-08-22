# notification-stack

A persistent notification centre. Items collapse into a pile and fan out when
you pull them apart.

Written after the component shipped. The choreography and the four departures
live in the file header, next to the code they explain, and this does not
repeat them. Where the two disagree the header is right. What follows is the
argument for building it and the versions that lost, which the header has no
room for.

## The test

**1. Would someone reach for this while building a product?**

Yes. Anything with notifications that outlive their toast: an inbox, a build
system, a monitoring dashboard, a chat client. The pile is what you use when
the messages have to still be there in a minute.

**2. How it behaves under the hand.**

> **Sonner.** Toasts stack, and hovering the stack expands it. They time out
> and leave.

> **Ours.** You pull the pile down and the cards separate under your finger
> with resistance that gives less the further you go. Let go past 54px and it
> finishes opening. Let go short and it springs shut. Throw a card sideways and
> it leaves at the speed you released it, the gap closes behind it, and the
> rest re-take their depth after that.

**3. Better than the best version anywhere?**

Against the web, yes. Sonner is the best toast library there is and it is not
competing: it owns transient toasts and stops there. Its stack expands on
hover, which is a pointer-only affordance with a known discoverability problem,
and its toasts leave on a timer.

Against native, no, and that is the honest answer. This is the iOS lock
screen's job and the iOS lock screen does it well. The claim is narrower: no
web version of it exists, and the gesture is the reason nobody has one.

## What it beats

Sonner is the incumbent for stacked cards on the web and every registry ships
a wrapper around it. Nothing ships the persistent centre.

The gesture is the whole gap. A pile that expands on hover cannot be pulled,
cannot be released halfway, and has nothing to do on a touch screen. The
component takes the affordance from the device the pattern comes from.

**Hover deliberately does not separate the pile.** Sonner already owns that
gesture on a stack of cards. Borrowing it would make this read as a Sonner
reskin rather than the thing Sonner is not.

## Numbers

Depth, per rung down the pile:

```
PEEK          12      px lower
DEPTH_SCALE   0.045   scale removed
DEPTH_BLUR    0.9     px of blur added
```

Four properties change at once, and the blur ramp is the one cheaper versions
skip. Without it a pile reads as three offset rectangles. It stays under 1px
because a peek is only 12px tall, and a blur tuned against a whole card turns
that strip into a smudge.

The pull:

```
PULL_DECAY      110    px of travel buying the first half of the separation
PULL_SPREAD     26     px per rung at a full pull
PULL_TO_COMMIT  54     px of travel that commits on release
```

Saturating resistance, the same `x / (x + decay)` shape as `elastic-slider` and
`list-detail-morph`. The collection keeps one physical vocabulary on purpose,
so a gesture learned on one component transfers to the others.

Dismissal, which has two exits because it has two causes:

```
THROW_FRACTION  0.4    of card width, or
THROW_VELOCITY  500    px/s, either commits
DEPART_SCALE    0.86   a dismissed card recedes along the depth axis
DEPART_BLUR     8      px, and blurs out back there
UNCOVER_TRAVEL  6      px of slop before the card behind is revealed
```

A thrown card goes sideways at the speed you released it. A dismissed one goes
backwards, past where rung two sits. There is no `y` on the departure, and that
is deliberate: three ways to leave need three directions, and an arrival
already comes down.

## Paths not taken

Every one of these shipped first and was replaced.

**Hover to separate.** Covered above. The reason it is listed here rather than
only in the header is that it is the first thing anyone will suggest adding.

**`spring.quick.exit` for the departure.** 100ms, the icon-crossfade tier. Four
sizes too small for a whole surface, and the reason a dismissal read as a pop
rather than as something leaving. Now 220ms, still quicker than the arrival,
which is the asymmetry the tiers encode.

**One timing across both states.** The arrival, the departure, the restack and
the squash all branch on open versus collapsed. Open, rung one climbs a whole
card plus the 8px gap. Collapsed it climbs about 15px. Three beats that
separate cleanly across 80px fuse back into one at 15, so the collapsed case
gets a bigger gesture rather than a longer one: further to fall, deeper to
compress, a real overshoot on the rungs. The departure was the last event still
running open-state timing in both.

**One curve for the arriving card's opacity and transform.** Sharing a curve
left the arriving card semi-transparent over the outgoing card's text for its
first frames. Two texts in one place is the artefact masked transitions exist
to avoid. Opacity now finishes at 120ms while the transform runs on.

**Throw at 180ms against a list that waited 400ms.** The card went invisible
long before the list noticed it had gone. The throw is shorter now and the fade
riding it out is longer.

**Restack moving content before its container made room.** The house recipes
list that under Avoid, and the restack was doing it. `CONTENT_LEAD` is the fix.

## Selling points

1. **The pile has depth, not offsets.** Four properties per rung, including a
   sub-pixel blur ramp. This is the part that separates it from three
   rectangles with different `top` values.
2. **Every peek is the same size** whatever the cards underneath hold, because
   buried cards clip to the front card's height and solve from the bottom edge
   up. Uniform peeks are the whole illusion.
3. **Dismissal is three beats, never one.** The card leaves, the gap closes
   behind it, the rest re-take their depth behind that. Collapsing those into
   one window makes a close read as a blink.
4. **Both events scale to the state they happen in.** An arrival into a
   collapsed pile is a different gesture from an arrival into an open list, not
   the same one played smaller.

### The silent clip

Pull the pile down and stop halfway. The cards separate under the finger and
hold. Let go, and they spring shut. Then pull past the commit and they finish
opening on their own.

The stop is what makes it read, because it is the frame that proves the
separation is tracking rather than playing.

## Where the rest lives

The choreography, the four departures from the house rules, the reduced-motion
behaviour, and the reasoning behind every constant are in the header of
`src/components/trovecn/feedback/notification-stack.tsx`.

The API and the three worked examples are in
`registry/trovecn/notification-stack/meta.ts`.
