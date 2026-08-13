# Foundational engineering standards: rule decisions

## Classification

- **Invariant:** violation creates a correctness, security, boundary, or public-contract defect.
- **Strong default:** follow unless a concrete local constraint makes another design better.
- **Contextual:** use only when the named framework, runtime, or UI relationship applies.
- **Tooling-owned:** important, but enforced by repository automation rather than repeated in skill context.
- **Rejected:** intentionally not adopted.
- **Deferred:** valid concern assigned to a later specialist skill.

## Accepted

| Rule | Class | Decision |
| --- | --- | --- |
| Narrow, behavior-preserving, reviewable changes | Strong default | Inspect the affected contract and avoid unrelated cleanup; broaden only when correctness requires it. |
| Strict types and trust-boundary narrowing | Invariant | Prefer `unknown` plus narrowing/validation for untrusted data; do not assert away a modeling or runtime-validation defect. |
| Explicit state and lifecycle ownership | Invariant | Avoid implicit mutable globals. Consumers own independent state unless process-wide identity is the actual domain contract. |
| Meaningful abstractions and dependency restraint | Strong default | An abstraction must own policy, lifecycle, a boundary, or proven behavior reuse. Prefer native/host APIs and existing dependencies for trivial capabilities. |
| Kebab-case project-authored filenames | Invariant, Nexload-specific | Use kebab-case for every authored filename whose exact name is not externally mandated, including component files. Preserve mandated names and generated/vendor output; symbol names retain their language conventions. |
| Honest verification | Invariant | Report only commands and checks actually run; distinguish in-scope failures from unrelated baseline failures. |
| Core-to-adapter dependency direction | Contextual invariant | When shared runtime-neutral policy justifies a core, adapters may depend on it and core must not acquire adapter/framework dependencies. Do not invent this layering for a one-runtime or framework-only capability. |
| Deliberate exports and public API budget | Invariant | Export only supported consumer capabilities. Treat entrypoints, public types, and behavior as compatibility commitments. |
| Runtime isolation and truthful package metadata | Invariant | Browser/server/runtime-safe claims, export targets, dependency classes, files, side effects, and README examples must match the packed artifact. |
| React render purity | Invariant | No mutation or side effects during render; props and state are render snapshots. |
| Minimal React state/effects | Strong default | Derive cheap deterministic values. Use effects for real external synchronization, not event handling or routine render transforms. |
| Named component exports and named props contracts | Strong default | Apply prospectively; framework-required or established public default exports and truly prop-free components are exceptions. |
| Narrow client and Payload Admin boundaries | Invariant | Client-only code stays behind explicit client/Admin entrypoints and must not contaminate server-safe package roots. |
| Semantic tokens, relationship-owned spacing, shared alignment | Strong default | Use semantic roles; parent layouts own repeated sibling gaps and primary axes. |
| Coherent surface, radius, and control systems | Strong default | Visual values express a role; avoid independent decorative decisions per component. |
| Responsive and RTL-safe layout | Contextual | Preserve supported directions and viewports with logical semantics and meaningful layout changes. Mobile-first is a default for new surfaces, not a migration invariant. |
| Preserve approved UI | Invariant | Refactors may improve internals and robustness but must not silently redesign an approved visual state. |

## Modified or bounded

| Candidate rule | Final classification | Boundary |
| --- | --- | --- |
| Ban all `any` and assertions | Strong default | Allow a small, commented, locally contained escape at unavoidable third-party/generic interoperability seams. Never use it instead of validating untrusted runtime data. |
| One React component per file | Strong default, Nexload-specific | Applies to significant component implementations. Trivial inline render fragments, tests, stories, and generated/framework files are exempt; never define a component inside another render. |
| `_` prefix for private component files | Strong default, Nexload-specific | Applies to owner-local extracted components. Shared/public components use normal names and deliberate exports. |
| Server Components by default | Contextual | Applies to Next.js/Payload environments that support them. It is not a rule for generic React libraries or browser-only applications. |
| Never use memoization | Contextual | Do not add `memo`, `useMemo`, or `useCallback` ceremonially; use them when identity, a measured hot path, or a host API contract requires them. |
| Never use margins | Contextual | Parent `gap` owns repeated siblings; document flow, isolated external separation, and parent-inaccessible layouts may use margin deliberately. |
| Never use arbitrary values | Contextual | Permit one-off artwork, overlays, external embeds, or exact geometry. Repeated values should become tokens. |
| Always use logical CSS properties | Strong default | Use logical properties for semantic direction. Physical coordinates are valid for physically anchored artwork and similar geometry. |
| Always use framework UI primitives | Strong default | Prefer supported host primitives when they meet the contract; replace or wrap them only for real product behavior, policy, or accessibility needs. |

## Rejected

| Rule | Reason |
| --- | --- |
| Mandate ESM-only packages | Current consumers and packages have different compatibility needs; module format is an explicit package decision. |
| Mandate dual ESM/CJS publication | Dual output adds testing and packaging cost and is unnecessary when the declared consumer contract is ESM-only. |
| Export helpers pre-emptively | Each export creates a long-term compatibility surface; proven internal reuse is not sufficient reason for public exposure. |
| Require a wrapper around every native or host API | Renaming without owned policy or normalization creates a shallow parallel API. |
| Require a new file for every function or JSX fragment | File boundaries should express responsibility, not minimize line count. |
| Turn formatter/import-order rules into prose | Quotes, semicolons, import order, and similar deterministic syntax belong to ESLint/Prettier. |
| Treat current implementation as normative | Legacy inconsistencies remain migration candidates and do not lower the intended standard. |
| Require `rounded-full`/cards/shadows as default polish | Surface treatment must communicate role, state, or elevation rather than decoration. |

## Deferred

Detailed contracts/schema policy, error architecture, testing strategy, runtime mechanics, Payload domain behavior, observability, security, performance, docs/releases, Next.js, accessibility, and motion are deliberately excluded. The foundational skills may identify those boundaries and hand work to the roadmap, but must not encode a partial specialist standard.
