#!/usr/bin/env node
// Regenerate openapi.{json,yaml} from a live source.
//
//   npm install
//   node scripts/regenerate.mjs                 # pulls https://api.opensettle.io/v1/openapi.json
//   OPENAPI_SOURCE=./local.json node scripts/regenerate.mjs
//
// Requires Node ≥ 18 (uses global fetch).

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = process.env.OPENAPI_SOURCE ?? "https://api.opensettle.io/v1/openapi.json";

async function loadSpec() {
  if (SOURCE.startsWith("http://") || SOURCE.startsWith("https://")) {
    const r = await fetch(SOURCE);
    if (!r.ok) throw new Error(`fetch ${SOURCE} -> HTTP ${r.status}`);
    return await r.json();
  }
  return JSON.parse(await readFile(SOURCE, "utf8"));
}

const spec = await loadSpec();

// Accept any OpenAPI 3.0.x / 3.1.x document. The served spec is authored as
// 3.0.3 (it uses `nullable`, a 3.0-only keyword removed in 3.1); an exact
// "3.1.0" check silently broke YAML regeneration and let the mirror drift.
if (!/^3\.[01]\.\d+$/.test(spec.openapi ?? "")) {
  throw new Error(`unexpected openapi version: ${spec.openapi}`);
}
const pathCount = Object.keys(spec.paths ?? {}).length;
if (pathCount < 20) {
  throw new Error(`spec looks incomplete — only ${pathCount} paths`);
}

const json = JSON.stringify(spec, null, 2) + "\n";
const yamlOut = yaml.dump(spec, { lineWidth: 100, noRefs: true, sortKeys: false });

await writeFile(resolve(ROOT, "openapi.json"), json);
await writeFile(resolve(ROOT, "openapi.yaml"), yamlOut);

console.log(`source: ${SOURCE}`);
console.log(`paths: ${pathCount}`);
console.log(`schemas: ${Object.keys(spec.components?.schemas ?? {}).length}`);
console.log(`openapi.json: ${json.length} B`);
console.log(`openapi.yaml: ${yamlOut.length} B`);
