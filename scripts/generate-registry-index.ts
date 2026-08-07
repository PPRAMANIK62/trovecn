#!/usr/bin/env bun
/**
 * Regenerates src/lib/registry.generated.ts by scanning registry/trovecn/*
 * for meta.ts files — nothing here should ever be hand-edited. Adding a
 * component means adding registry/trovecn/<slug>/meta.ts (exporting a
 * camelCase-named RegistryItem matching the slug); this script picks it up
 * automatically. Wired into predev/prebuild so it can't go stale.
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const registryDir = join(process.cwd(), "registry/trovecn");
const outFile = join(process.cwd(), "src/lib/registry.generated.ts");

function toCamelCase(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

const slugs = readdirSync(registryDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => existsSync(join(registryDir, slug, "meta.ts")))
  .toSorted();

const imports = slugs
  .map((slug) => `import { ${toCamelCase(slug)} } from "../../registry/trovecn/${slug}/meta";`)
  .join("\n");

const arrayEntries = slugs.map(toCamelCase).join(", ");

const output = `// GENERATED FILE — do not hand-edit. Run \`bun run registry:index\`
// (also wired into predev/prebuild) to regenerate after adding or removing
// a registry/trovecn/<slug>/meta.ts. See scripts/generate-registry-index.ts.
import type { RegistryItem } from "./registry-types";

${imports}

export const registry: RegistryItem[] = [${arrayEntries}];
`;

writeFileSync(outFile, output);
console.log(
  `registry:index — wrote ${slugs.length} item(s) to ${outFile.replace(process.cwd() + "/", "")}`,
);
