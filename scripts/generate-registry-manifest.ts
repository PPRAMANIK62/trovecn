#!/usr/bin/env bun
/**
 * Regenerates registry.json (the shadcn CLI distribution manifest) by
 * scanning registry/trovecn/* for registry.ts files — nothing in it should
 * ever be hand-edited. Adding a component means adding
 * registry/trovecn/<slug>/registry.ts (exporting a camelCase-named
 * RegistryManifestItem matching the slug); this script picks it up
 * automatically. Wired into predev/prebuild so it can't go stale.
 *
 * registry.ts is deliberately separate from meta.ts: meta.ts is docs-site
 * copy (title/description/examples/api shown on the component's page),
 * registry.ts is install-time manifest data (dependencies, registryDependencies,
 * files) — a component's install description and its docs-page description
 * are different copy with different audiences, and shared items like
 * springs/utils/font-weight have a registry.ts but no docs page at all.
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { RegistryItemType, RegistryManifestItem } from "../src/lib/registry-types";

const registryDir = join(process.cwd(), "registry/trovecn");
const outFile = join(process.cwd(), "registry.json");

function toCamelCase(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

const slugs = readdirSync(registryDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => existsSync(join(registryDir, slug, "registry.ts")))
  .toSorted();

const items: RegistryManifestItem[] = await Promise.all(
  slugs.map(async (slug) => {
    const mod = await import(join(registryDir, slug, "registry.ts"));
    const item = mod[toCamelCase(slug)] as RegistryManifestItem | undefined;
    if (!item) {
      throw new Error(
        `registry/trovecn/${slug}/registry.ts must export a RegistryManifestItem named "${toCamelCase(slug)}"`,
      );
    }
    return item;
  }),
);

// registry:lib / registry:hook items (foundational, install-order-independent)
// before registry:ui items, alphabetical by name within each group — purely
// for readability, the CLI doesn't care about item order.
const typeOrder: RegistryItemType[] = ["registry:lib", "registry:hook", "registry:ui"];
const ordered = items.toSorted((a, b) => {
  const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  return typeDiff !== 0 ? typeDiff : a.name.localeCompare(b.name);
});

const manifest = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "trovecn",
  homepage: "https://trovecn.dev",
  items: ordered,
};

writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`registry:manifest — wrote ${ordered.length} item(s) to registry.json`);
