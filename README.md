# opensettle-openapi

The [OpenSettle](https://opensettle.io) API as a single-source-of-truth
OpenAPI 3.0.3 specification.

## What's in this repo

- `openapi.json` — the canonical machine-readable API description (pretty-printed)
- `openapi.yaml` — the same spec, YAML-formatted for human edits and reviews
- `scripts/regenerate.mjs` — pulls the live spec and rewrites both files

The live spec is also served from the API itself at
[`api.opensettle.io/v1/openapi.json`](https://api.opensettle.io/v1/openapi.json).
That endpoint is the source of truth at runtime; this repo publishes
versioned snapshots so tooling can pin to a known revision.

## Keeping the snapshot fresh

```bash
npm install
npm run regenerate        # fetches https://api.opensettle.io/v1/openapi.json
                          # and rewrites openapi.json + openapi.yaml
```

Override the source for offline / staging regeneration:

```bash
OPENAPI_SOURCE=./local-spec.json npm run regenerate
OPENAPI_SOURCE=https://staging.opensettle.io/v1/openapi.json npm run regenerate
```

## Usage

### Code generation

Most OpenAPI code generators accept either format. Examples:

```bash
# openapi-generator-cli (typed client in any of 50+ languages)
npx @openapitools/openapi-generator-cli generate \
  -i https://raw.githubusercontent.com/OpenSettle/opensettle-openapi/main/openapi.yaml \
  -g typescript-fetch \
  -o ./generated

# Microsoft Kiota
kiota generate \
  --openapi https://raw.githubusercontent.com/OpenSettle/opensettle-openapi/main/openapi.yaml \
  --language typescript \
  --output ./generated
```

### Postman / Insomnia / Bruno

Import the `openapi.yaml` directly. The corresponding hand-curated Postman
collection lives at
[OpenSettle/opensettle-postman](https://github.com/OpenSettle/opensettle-postman)
if you'd rather start there.

### Browsing the API

Live three-pane explorer (Scalar) at
[api.opensettle.io/v1/docs](https://api.opensettle.io/v1/docs). No spec
import needed — just a browser.

## Versioning

The spec uses the same major version as the API surface: `v1`. Backwards-
incompatible changes get a major bump; new endpoints and fields are
additive within a major version.

Each meaningful spec change is tagged `v<major>.<minor>.<patch>` to match
the spec's `info.version` field, so SDK generators can pin. The `main`
branch always tracks the live API — pull a tag if you need stability.

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — copy, share,
and use the spec freely with attribution.

## Issues + contributions

Spec bugs (typos, missing endpoints, wrong types) — open an issue or PR.
Behavioral bugs in the API itself — please follow the disclosure flow at
[opensettle.io/security](https://opensettle.io/security).
