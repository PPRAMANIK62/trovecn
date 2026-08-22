# Trovecn[.]dev

A registry of interface patterns observed on real sites — Apple, Linear,
Stripe, Vercel, Framer, Raycast — rebuilt from scratch and distributed as
copyable source, the same model as [ui.shadcn.com](https://ui.shadcn.com).
No package to install, no runtime dependency: browse a component at
[trovecn.dev/docs/components](https://trovecn.dev/docs/components), copy
its source, done. CLI installs are on the roadmap but not wired up yet.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Base UI](https://base-ui.com) primitives, distributed in the [shadcn](https://ui.shadcn.com) registry format
- [Motion](https://motion.dev) for animation
- [Shiki](https://shiki.style) for syntax-highlighted code blocks

See [`docs/design-system.md`](docs/design-system.md) for the visual language
and component conventions, and
[`docs/what-to-build.md`](docs/what-to-build.md) for how components are chosen
and what is next.

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
