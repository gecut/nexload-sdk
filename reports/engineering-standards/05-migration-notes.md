# Foundational standards: current-code migration notes

These are touch-based migration candidates, not an instruction for a repository-wide refactor. Reconfirm behavior, tests, consumers, and publication compatibility before changing any listed code.

The filename standard now requires kebab-case for every project-authored file whose exact name is not externally mandated, including component files. Apply it immediately to new files and deliberate renames. Treat existing nonconforming names as touch-based candidates: rename only after checking imports, export maps, framework discovery, case-sensitive filesystems, and downstream consumers. Exact tool/framework names and generated or vendored output are not migration defects.

## High-value candidates

| Area | Current evidence | Future touch-based direction |
| --- | --- | --- |
| Logger type boundaries | `packages/logger/src` uses broad `any` in payload construction, renderers, formatting utilities, and caught errors. | Introduce one canonical log-record boundary, accept `unknown` where data enters, and narrow before rendering. Treat logger ownership/redaction as future `nexload-observability` work rather than a baseline cleanup. |
| Payload hook interoperability | [`log-operation.ts`](../../packages/payload-hooks/src/log-operation.ts) casts an `any` callback to several heterogeneous hook types and returns `null as any`. | Model the supported hook variants explicitly or isolate and document the unavoidable framework seam. Preserve each Payload hook's real return contract; add contract tests before changing behavior. |
| Payload hook dependency ownership | [`payload-hooks/package.json`](../../packages/payload-hooks/package.json) lists the Payload host as a runtime dependency even though the source import is type-only. | During the next package-contract change, verify the packed artifact and consumers, then decide whether Payload belongs in `peerDependencies` plus `devDependencies`. Do not move it mechanically. |
| Legacy package entrypoint | [`orpc-client/package.json`](../../packages/orpc-client/package.json) declares `main`/`types` without an `exports` map, unlike newer packages. | Audit published deep imports before adding `exports`; Node treats newly hidden deep imports as a breaking change. Document the package's Node/server-only runtime explicitly at the same time. |
| Module-global logger | [`logger/src/index.ts`](../../packages/logger/src/index.ts) creates and default-exports a process-global logger while also exporting the instance class. | Preserve compatibility now. Future observability design should decide whether the default singleton is an intentional process-wide identity or should be supplemented by a clearer consumer-owned factory path. |

## React and Admin candidates

| Area | Current evidence | Future touch-based direction |
| --- | --- | --- |
| Props contracts | Payload Admin components use a generic local `type Props` intersected with Payload props. | When substantially editing a component, prefer a component-specific named props contract immediately above it; export it only when it is a supported consumer API. This is readability/locality work, not a breaking API migration by itself. |
| Mirrored field state | [`jalali-date-field.tsx`](../../packages/payload-fields/src/admin/jalali-date-field.tsx) and [`money-field.tsx`](../../packages/payload-fields/src/admin/money-field.tsx) synchronize Payload field values into local state with effects. | Re-evaluate whether local state represents a genuine editable/transitional buffer. Derive directly when it does not; retain synchronization when the host field is an external system and test external resets, invalid drafts, and update loops. |
| Client boundary packaging | `payload-fields` already exposes Admin components through dedicated `./admin/*` subpaths and keeps factories at the root. | Preserve this as the migration target for future Payload React packages; do not barrel-export client modules from server-safe roots. |

## Design-system candidates

[`apps/docs/src/styles/docs.css`](../../apps/docs/src/styles/docs.css) already uses Starlight semantic color/type variables, logical block properties, parent gaps, responsive behavior, and visible focus styles. It also repeats raw `0.5rem` radii and several one-off spacing values. If the docs UI grows, consolidate repeated roles into local semantic tokens and make page/container alignment ownership explicit. Do not churn isolated values solely to satisfy the new design skill; document-flow margins and one-off geometry remain valid.

## Patterns that are intentional, not migration defects

- Mixed ESM-only and dual ESM/CJS packages are valid when each package's manifest, build, tests, and documented consumer contract agree.
- [`payload-editor/src/types.ts`](../../packages/payload-editor/src/types.ts) explicitly contains `any` at Payload's heterogeneous generic feature-provider seam. This is the kind of contained, explained interop exception the code standard permits.
- The healthcheck core/adapter package split and `payload-fields` Admin subpaths are positive reference architectures and should not be flattened for consistency.
- Existing production files are not to be renamed or reorganized in a repository-wide sweep merely to adopt the React locality or filename convention. Apply kebab-case to new files and deliberate renames, and handle legacy names through scoped, compatibility-aware migration.
