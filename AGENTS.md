<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Docs map

- `docs/design-system.md` governs how things look and move. It splits into a
  **Contract** (frozen: tokens, type scale, timing source, reduced motion,
  registry generation) and **Conventions** (house defaults you may depart
  from if the file header names the reason in one line).
- `docs/sourcing.md` governs what gets built next. It is a filter for
  choosing between ideas, not a veto on any particular one.
- `docs/ideas.md` is the roadmap, `docs/signature-components.md` the vetted
  candidates, `docs/decisions.md` what was tried and abandoned.

Neither of the first two overrules the other. Read the relevant one before
proposing a component or writing UI code.
