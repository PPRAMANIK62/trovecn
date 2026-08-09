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

// A slug whose camelCase form collides with a reserved word (e.g. "switch")
// can still be the *exported* name in meta.ts — `export { x as switch }`
// only needs an IdentifierName, which permits reserved words — but can't be
// the *local* identifier this file binds it to via a bare `import { switch }`
// or references in the array literal. Import it under a suffixed alias
// instead whenever the camelCase form isn't a valid binding identifier.
const reservedWords = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
  "function", "if", "import", "in", "instanceof", "new", "null", "return", "super",
  "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
  "yield", "let", "static", "await", "implements", "package", "protected", "interface",
  "private", "public",
]); // prettier-ignore

function toLocalName(camel: string): string {
  return reservedWords.has(camel) ? `${camel}Item` : camel;
}

const slugs = readdirSync(registryDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => existsSync(join(registryDir, slug, "meta.ts")))
  .toSorted();

const imports = slugs
  .map((slug) => {
    const camel = toCamelCase(slug);
    const local = toLocalName(camel);
    const specifier = local === camel ? camel : `${camel} as ${local}`;
    return `import { ${specifier} } from "../../registry/trovecn/${slug}/meta";`;
  })
  .join("\n");

const arrayEntries = slugs.map((slug) => toLocalName(toCamelCase(slug))).join(", ");

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
