# Architecture and standards routing

## Smallest correct architecture

For each layer, abstraction, interface, adapter, factory, plugin, cache, state machine, dependency, or configuration surface, ask what current capability, policy, boundary, lifecycle, interoperability, safety, or measured performance disappears if it is removed. If nothing material disappears, complexity is not paying rent. Do not confuse minimum code with minimum architecture: real variants and boundaries justify structure.

Prefer direct platform/host APIs unless a Nexload layer adds policy, normalization, type safety, lifecycle, integration, or a real runtime abstraction. Reject duplicated models when one can derive from the authoritative contract.

## Ownership and boundaries

Identify who owns state, initialization, teardown, policy, configuration, and errors. Treat hidden mutable globals as material when independent consumers or lifecycle control are required; do not demand factories for stateless modules.

Give high weight to public/internal, core/adapter, server/browser, framework-neutral/specific, configuration/runtime-state, package/application, and contract/implementation boundaries. Boundary leakage is material when it changes runtime truth, compatibility, security, or ownership.

## SDK and public API

Ask why each export must be consumer-visible. Penalize accidental helper/parser/type leakage, unnecessary subpaths, framework details in core, and metadata that disagrees with packed behavior. Consider SemVer burden, peer/dependency ownership, native API preservation, and consumer-controlled state. A small deliberate adapter is valid when multiple real runtimes already exist.

## Types, dependencies, performance, and security

- Reward types that clarify consumer use and preserve validated facts; penalize `any`, unsafe assertions, duplicated contracts, and type cleverness without value.
- A dependency is justified by the capability it buys, its owner, runtime/bundle cost, and compatibility contract—not by ideology for or against dependencies.
- Admit performance findings only from structural or measured evidence such as N+1 work, repeated hot-path cost, unnecessary network hops, or excessive client code. Do not request speculative caching or memoization.
- Admit security findings only at plausible trust or privilege boundaries. Authentication/authorization bypass, secret/PII exposure, unvalidated ingress, and unsafe client/server separation can be P0.

## Foundational skill routing

- `nexload-code`: TypeScript/module quality, trust narrowing, lifecycle, dependency restraint, abstractions, and repository-wide kebab-case filenames.
- `nexload-package`: package ownership, exports, subpaths, runtime isolation, metadata, dependency classes, packed compatibility, and public API cost.
- `nexload-react`: render purity, state/effects, significant-component locality, named contracts/exports, client boundaries, and Payload Admin entrypoints.
- `nexload-design`: semantic roles, spacing/alignment ownership, coherent geometry, responsive/RTL behavior, and UI preservation.

Consult only skills relevant to the requested scope. Their conventions generate candidate observations; this CTO review decides whether impact warrants P0/P1/P2. A harmless local convention deviation must not mechanically lower the verdict.
