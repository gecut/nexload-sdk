---
"@nexload-sdk/healthcheck": major
"@nexload-sdk/healthcheck-node": major
"@nexload-sdk/healthcheck-bun": major
"@nexload-sdk/healthcheck-next": major
"@nexload-sdk/healthcheck-otel": major
"@nexload-sdk/healthcheck-payload": major
"@nexload-sdk/healthcheck-prometheus": major
---

Release a new major across the healthcheck family. `@nexload-sdk/healthcheck` re-exports `core/types` with `export type *`, so its types can no longer be imported as values; imports were reordered for the modernized ESLint config. No runtime behavior changes.
