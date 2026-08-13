# Future Nexload engineering skills roadmap

These are deferred specialist skills, not incomplete sections of the four foundational skills. Build them only when repository evidence and representative eval fixtures are available.

| Proposed skill | Owns | Builds on |
| --- | --- | --- |
| `nexload-contracts` | Canonical schemas/types, Zod, runtime validation, DTO and JSON-safe boundaries | `nexload-code`, `nexload-package` |
| `nexload-errors` | Stable codes/types, safe vs internal errors, causes, envelopes, transport mapping | `nexload-code`, `nexload-contracts` |
| `nexload-testing` | Contract/public-API tests, regression strategy, fakes, runtime and compatibility matrices | All four foundations; contracts/errors when present |
| `nexload-runtime` | Node/Bun/browser isolation, module formats, bundling, tree-shaking, side effects, cancellation | `nexload-code`, `nexload-package` |
| `nexload-payload` | Payload hooks/access, Local API, endpoints, Import Map, Admin extension contracts | `nexload-package`, `nexload-react`, contracts/errors/security |
| `nexload-observability` | Logger ownership, child context, structured events, collectors, thresholds, redaction | `nexload-code`, `nexload-package`, runtime/security |
| `nexload-security` | Trust boundaries, authorization, secrets, client exposure, secure defaults | `nexload-code`, contracts/errors/runtime |
| `nexload-performance` | Measurement-first optimization, bundles, allocations, hot paths, queries, client JavaScript | `nexload-code`, `nexload-package`, `nexload-react` |
| `nexload-docs-release` | README/API synchronization, examples, Changesets, SemVer, migrations, publication evidence | `nexload-package`, testing |
| `nexload-nextjs` | App Router, RSC boundaries, caching/revalidation, route handlers, streaming | `nexload-react`, `nexload-package`, runtime |
| `nexload-accessibility` | Semantics, keyboard/focus, forms, ARIA, contrast, interactive primitives | `nexload-react`, `nexload-design` |
| `nexload-motion` | Motion roles, transform/opacity, timing, reduced motion, scroll-driven behavior | `nexload-react`, `nexload-design`, accessibility/performance |

## Suggested sequence

1. Build `contracts`, `errors`, and `testing` first; they define evidence and failure contracts used by most later skills.
2. Build `runtime` and `security`, then `payload`, `observability`, and `performance` on those boundaries.
3. Build `accessibility` before `motion`; build `nextjs` after React/runtime boundaries are stable.
4. Build `docs-release` after compatibility tests can prove the release claims it will require.

Each future skill should retain the same delivery contract as Phase 1: narrow trigger metadata, progressive references, fixture-backed behavioral evals, adversarial trigger negatives, repository-grounded claims, and no fabricated review metrics.
