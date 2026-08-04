# Trovecn[.]dev

A registry of interface patterns observed on real sites — Apple, Linear,
Stripe, Vercel, Framer, Raycast — rebuilt from scratch and distributed as
copyable source, the same model as [ui.shadcn.com](https://ui.shadcn.com).
No package to install, no runtime dependency: every component becomes
source you own.

```bash
npx shadcn add https://trovecn.dev/r/blur-navbar.json
```

## Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn](https://ui.shadcn.com) CLI, built on [Base UI](https://base-ui.com) primitives
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Shiki](https://shiki.style) for syntax-highlighted code blocks

See [`docs/design-system.md`](docs/design-system.md) for the visual language
and component conventions, and [`docs/ideas.md`](docs/ideas.md) for the
component backlog.

## Development

This project uses [bun](https://bun.sh).

```bash
bun install
bun dev          # start the dev server at http://localhost:3000
bun run lint     # oxlint
bun run format   # oxfmt
bun run registry:build  # regenerate public/r/*.json from registry.json
```

## License

[MIT](LICENSE)
