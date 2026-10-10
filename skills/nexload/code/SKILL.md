---
name: nexload-code
description: "Use when internal TypeScript behavior, refactoring, or repository-wide file naming is the primary task in Nexload: scope discipline, readable functions and modules, type or trust-boundary safety, lifecycle ownership, abstraction value, dependency restraint, internal imports, or honest verification. Route package API compatibility to nexload-package and framework or specialist policy to the owning sibling skill."
---

# Nexload Code

## Purpose

Produce the smallest correct, reviewable TypeScript change. Preserve current behavior outside the request while making ownership, types, control flow, side effects, and failure behavior easy to verify.

This is the foundational implementation standard. Compose it with a domain skill that owns the contract; do not turn it into detailed policy for React, design, package releases, security, testing, performance, framework behavior, or observability.

## Source of truth

Follow the user's authorized scope and applicable `AGENTS.md` first, then established package contracts and repository-standard `@nexload-sdk/eslint-config` and `@nexload-sdk/typescript-config` presets. Compliance with these configurations is mandatory across all packages, rewrites, and new code. Arbitrary rule suppression (`eslint-disable` or disabling rules in `eslint.config.mjs`) is strictly forbidden without explicit, documented architectural justification. Current code and tests establish behavior, not automatic design precedent. This skill fills gaps; external guides do not override local contracts. Report conflicts instead of spreading legacy patterns.

## Trigger boundary

Use for ordinary internal TypeScript implementation, refactoring, and review. Compose with a domain skill when it owns the contract; route API compatibility to `nexload-package`, React behavior to `nexload-react`, visual systems to `nexload-design`, and final technical judgment to `nexload-cto-review`. Dedicated specialists own detailed error systems, security, testing strategy, performance, frameworks, and releases. If unavailable, preserve baseline invariants and report the specific unresolved decision.

## Required inspection

For repository changes, inspect worktree status, the caller-to-effect path, affected public types and tests, nearby module boundaries, and the narrowest package commands. Inspect only the evidence needed for supplied fixtures or conceptual reviews. Read the relevant reference below before making its decision.

## Decision flow

1. State the observable change and what must remain unchanged.
2. Locate the authoritative state, type, policy, lifecycle, and error owner.
3. Prefer an existing or native seam that already owns the behavior.
4. Validate weakly typed input once at the boundary, then preserve the narrowed type.
5. Keep control flow and side effects explicit; use focused functions and semantic grouping.
6. Add a file, dependency, abstraction, store, lock, or configuration only for a current responsibility, lifecycle, boundary, real variant, or meaningful same-reason duplication.
7. Verify from the narrowest decisive check outward.

## Implementation workflow

Trace the current path, derive types from the canonical model, keep implementation in its owning module, name new files according to repository rules, remove only obsolete dead code, and run targeted checks before broader gates.

## Invariants

- Preserve unrelated behavior and local architecture; remove only dead code made obsolete by the change.
- Adhere strictly to the canonical archetypes defined in [File and directory structure](references/file-directory-structure.md). Select the matching archetype before generating files or refactoring.
- Derive types from canonical schemas, factories, constants, or public contracts where practical. Account for strict TypeScript and `noUncheckedIndexedAccess`; use `import type` for erased dependencies. Do not conceal missing modeling or validation with `any` or assertions; contained, justified exceptions follow the type reference.
- Modified or newly authored code MUST pass `@nexload-sdk/eslint-config` and `@nexload-sdk/typescript-config` checks clean with zero errors.
- Keep one primary responsibility per module and make state creation, mutation, concurrency, and cleanup ownership visible. Do not split trivial code into layers or files.
- Use project-authored kebab-case filenames, including component files, unless an exact framework, tool, protocol, generated, vendored, or publication name is required.
- Prefer direct internal imports when a package's own barrel would obscure dependency direction or create a cycle.
- Handle errors at the boundary that can recover, translate, or enrich them. Preserve meaningful causes and never fabricate success or leak sensitive data in diagnostics.
- Do not introduce locks, retries, caches, transactions, or other infrastructure without a reachable consistency or lifecycle requirement.

## Security and edge cases

Treat network, storage, environment, parsed JSON, process output, and untyped library values as untrusted. Cover malformed, repeated, concurrent, and cleanup paths when the changed seam can reach them. Keep diagnostics free of secrets and raw sensitive values; route authorization, retention, redaction, and threat modeling to security or observability specialists.

## Reference routing

- [File and directory structure](references/file-directory-structure.md): canonical package archetypes, feature slicing, anti-patterns, and directory hierarchies.
- [Clean code and readability](references/clean-code.md): names, functions, pragmatic DRY, comments, semantic whitespace, and tooling limits.
- [Behavior and correctness](references/behavior-and-correctness.md): contracts, errors, async work, concurrency, data integrity, resources, and behavior preservation.
- [Type and trust boundaries](references/type-trust-boundaries.md): `unknown`, runtime narrowing, canonical types, assertions, and interoperability.
- [Modules, state, and abstractions](references/module-state-abstractions.md): module cohesion, filenames, encapsulation, and internal dependency direction.
- [Dependencies and verification](references/dependencies-verification.md): native-first choices, dependency ownership, and evidence.

## Verification

Run the package's real focused test, typecheck, lint, or build scripts, then broaden only when shared or public effects justify it. Inspect output as well as exit status. Never claim an unrun check.

## Handoff requirements

Report exact commands and outcomes, skipped or unavailable lanes, unrelated baseline failures, behavior changed, preserved boundaries, intentional exceptions, residual risk, and work deferred to another skill.
