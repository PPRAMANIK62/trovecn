<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Docs map

Two files. Both are short on purpose.

- `docs/design-system.md` is how to build it. Look, motion, file layout, and a
  list of traps the code will not warn you about.
- `docs/what-to-build.md` is what to build next. The test a component has to
  pass, plus the queue.

Read the relevant one before writing UI code or proposing a component.

Neither file records what was already built or why. That goes in the header of
the component's own file, next to the code it explains. Do not add build notes,
decision logs, or history to `docs/`.

One component's design, worked out before it is built, goes in
`studies/<slug>.md`. See `studies/README.md`. That and the file header are the
only two places one component's reasoning belongs.
