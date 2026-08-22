# Studies

One file per component, named for its registry slug. A study is the worked-out
design that comes before the code: the mechanism derived and measured, the
interaction and motion settled, the API argued, and the versions rejected on
the way.

It is not a plan. The ordered steps are the last section and the least
interesting one.

## What goes where

- `docs/` is guidance that applies to every component. Nothing about one
  component belongs there.
- A study is everything about one component, before it exists.
- The component's file header is everything about one component, after it
  exists. It is written for someone reading the code, so it covers what
  shipped and nothing else.

A study is not deleted when the component ships. It keeps the derivations too
long for a header and the paths not taken, which the header has no room for and
`docs/` has no business holding.

## Shape

Open with the three answers from `docs/what-to-build.md`, including both
question-2 sentences: yours, and the one you are beating. A study that cannot
state those is not ready to be built.
