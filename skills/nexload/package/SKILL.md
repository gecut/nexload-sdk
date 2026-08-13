---
name: nexload-package
description: "Use when the primary task changes or evaluates the shipped contract of a publishable Nexload TypeScript package: ownership, public exports and subpaths, entrypoint runtime isolation, core/adapter direction where shared policy exists, metadata, dependencies or peers, packed artifacts, package-scoped compatibility, or README/API alignment. Do not use for internal-only code, React behavior, visual styling, repository-wide runtime standards, or release execution."
---

# Nexload Package Engineering

## Purpose

Design small publishable packages whose ownership, public surface, runtime boundaries, metadata, and compatibility claims remain explicit and independently verifiable.

## Trigger boundary

- Use for package creation, ownership, entrypoints, exports, dependency classification, public types, runtime separation, packed artifacts, or compatibility review.
- Compose with `nexload-code` for implementation quality, `nexload-react` for component behavior, and `nexload-design` for visual systems.
- Use installed specialists for detailed module-format behavior, errors, contracts, security, testing strategy, documentation/release execution, Payload, and Next.js policy. Otherwise decide only package-contract evidence and compatibility impact, then report the deferred domain work.

## Source of truth

Read the package manifest, README, source entrypoints, build config, declarations, tests, and actual packed output. Export maps and documentation are claims; the built artifact and supported consumer matrix prove them.

## Required inspection

Inspect the target package `README.md` and `package.json` first, then the affected exported entrypoints, bundler config, package-specific TypeScript config, relevant tests, and representative consumers. Check worktree and current version before discussing compatibility or release impact.

## Decision flow

1. Name the capability and decide whether an existing package, adapter, or optional integration already owns it.
2. Define the runtime and host matrix before choosing entrypoints, dependencies, or module formats.
3. Budget the smallest supported public API and capability-oriented subpaths.
4. When shared runtime-neutral policy exists, keep the direction explicit: a framework integration may depend on a runtime adapter, which may depend on core; never invert that dependency.
5. Prove manifest, build, declarations, packed files, README, and consumer imports agree.

## Implementation workflow

1. When implementation scope changes public exports or runtime behavior, add or update the narrow observable contract/consumer evidence. For review-only work, inspect existing evidence and report gaps without mutating tests or artifacts.
2. Implement through private modules and export only the supported consumer path.
3. Keep browser, server, runtime, and Admin code behind deliberate entrypoints.
4. Classify host/runtime compatibility as peers and implementation-owned runtime code as dependencies based on the actual artifact.
5. Update README/docs for changed behavior and determine SemVer impact without publishing or versioning unless requested.

## Invariants

- Each package owns a coherent capability rather than becoming a miscellaneous utility bucket.
- When a core layer exists, it never imports runtime or framework adapters; do not invent core/adapter layers for one-runtime or framework-only capabilities.
- Export maps, public types, documented behavior, and subpaths are compatibility contracts.
- Package roots stay focused; internal helpers remain private unless consumers need a supported contract.
- Entrypoints do not transitively import incompatible runtime code: server-safe roots exclude client-only modules, browser entrypoints exclude server-only modules, and runtime-neutral paths exclude both. Valid CSS, registration, or other import-time effects stay in deliberate entrypoints with truthful metadata.
- `files`, exports, declarations, dependencies, peers, engines, side-effect claims, and module formats describe the shipped artifact truthfully.
- Stateful APIs expose ownership and lifecycle; mutable module-global configuration is not a convenience default.

## Security and edge cases

Do not expose secrets, server callbacks, internal error data, or privileged dependencies through browser/Admin entrypoints. Treat adding `exports`, changing public types, entrypoints, persisted formats, or runtime behavior as compatibility work. Third-party public types are acceptable when interoperability is intentionally the API. Do not set `sideEffects: false` when CSS, registration, polyfills, or import-time mutation contradict it.

## Verification

Scale verification to the changed contract. For exports, declarations, dependencies, bundling, module formats, or runtime claims, run package checks, inspect affected targets in the tarball, import documented paths from a clean consumer, and exercise every affected claimed lane. Use narrower checks for private or documentation-only work, and report absent lanes or unrelated failures honestly.

## Reference routing

- Read [ownership and runtime boundaries](references/ownership-and-runtime-boundaries.md) before creating or splitting packages and adapters.
- Read [public API and exports](references/public-api-and-exports.md) for root budgets, subpaths, types, and compatibility decisions.
- Read [metadata, compatibility, and delivery](references/metadata-compatibility-and-delivery.md) for dependency classes, side effects, packed proof, docs, and handoff.

## Handoff requirements

Report ownership and dependency direction, public entrypoints/types changed, runtime and host matrix, manifest/build/declaration alignment, packed-consumer evidence, README/docs and SemVer impact, commands actually run, and remaining compatibility risk.
