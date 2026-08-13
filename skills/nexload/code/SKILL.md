---
name: nexload-code
description: Use when internal TypeScript behavior or repository-wide file naming is the primary task in Nexload: scope discipline, kebab-case filenames, type or trust-boundary safety, typed interoperability seams, module or lifecycle ownership, abstraction value, dependency restraint, own-package internal imports, or honest verification. Use nexload-package for consumer-facing exports and compatibility, and sibling skills when React, visual design, or a dedicated domain is primary.
---

# Nexload Code

## Purpose

Produce the smallest correct, reviewable TypeScript change while preserving explicit boundaries, strong types, understandable control flow, and current behavior outside the request.

## Trigger boundary

- Use for ordinary implementation, refactoring, and review across Nexload TypeScript modules.
- Compose with a domain skill when it supplies the contract; this skill supplies baseline implementation discipline.
- Route package ownership/exports to `nexload-package`, React modules to `nexload-react`, and visual-system work to `nexload-design`.
- Use a dedicated specialist when installed for detailed contracts, errors, tests, runtime architecture, Payload, security, performance, observability, Next.js, accessibility, or release work. Otherwise bound the decision, preserve the relevant baseline invariant, and report the deferred specialist work.

## Source of truth

Current code and tests, the nearest `AGENTS.md`, package README/manifest, TypeScript config, and ESLint config outrank this prose. Existing code is evidence, not automatically a standard; record legacy conflicts instead of spreading them.

## Required inspection

For repository changes, inspect worktree status, the exact caller-to-effect path, affected public types and tests, nearby module boundaries, and the narrowest available package commands. For supplied fixtures or conceptual reviews, inspect only the evidence required to decide ownership and behavior.

## Decision flow

1. State the required observable change and what must remain unchanged.
2. Locate the authoritative state, type, policy, and lifecycle owner.
3. Prefer the framework/native API or an existing repository seam that already owns the behavior.
4. Add an abstraction, file, state store, dependency, or configuration only for a current responsibility: policy, lifecycle, integration, type safety, a real variant, or meaningful same-reason duplication.
5. Validate untrusted runtime data; use types to preserve knowledge after that boundary.
6. Verify from the narrowest decisive check outward.

## Implementation workflow

1. Trace the current path and identify the smallest cohesive edit.
2. Derive types from the canonical model; narrow `unknown` at trust boundaries.
3. Keep control flow explicit with focused functions, guard clauses, and visible side effects.
4. Keep implementation in its owning module; use `index.ts` primarily as a deliberate boundary.
5. Name every new or deliberately renamed project-authored file whose exact name is not externally mandated in kebab-case, including component files.
6. Remove only dead code made obsolete by the change; avoid adjacent cleanup.
7. Run targeted checks, then broader gates only when impact justifies them.

## Invariants

- Preserve unrelated behavior and local architecture.
- Do not use `any` or assertions to conceal missing modeling or skip runtime validation. A contained `any` or assertion is acceptable at an unavoidable, documented interoperability seam after runtime facts are established.
- Account for strict TypeScript and `noUncheckedIndexedAccess`; prefer `import type` for type-only dependencies.
- Keep one primary responsibility per module without splitting trivial statements into files.
- Use kebab-case for project-authored filenames whose exact names are not externally mandated, including React component files. Preserve exact filenames required by frameworks, tools, protocols, or publication contracts; do not hand-rename generated or vendored files.
- Avoid own-package barrel imports when direct internal imports preserve dependency direction.
- State and lifecycle ownership are explicit; no convenience singleton or hidden mutable global by default.
- Abstractions own real policy, lifecycle, integration, or meaningful duplication; hypothetical reuse is insufficient.

## Security and edge cases

Treat network, storage, environment, parsed JSON, and untyped library values as untrusted until checked. Cover empty, missing, malformed, repeated, concurrent, and cleanup paths only when the changed seam can reach them. Keep baseline diagnostics free of secrets and raw sensitive values; route authorization, retention, redaction policy, and threat modeling to the security or observability specialist when installed.

## Verification

Use the package's real scripts. Prefer a focused test/typecheck/lint/build that exercises the changed boundary, then run workspace gates for shared or public effects. Never claim an unrun lane, and separate in-scope failures from unrelated baseline failures.

## Reference routing

- Read [type and trust boundaries](references/type-trust-boundaries.md) for `unknown`, assertions, canonical types, and runtime narrowing.
- Read [modules, state, and abstractions](references/module-state-abstractions.md) for filename rules, ownership, files, lifecycle, configuration, and abstraction tests.
- Read [dependencies and verification](references/dependencies-verification.md) for native-first choices, dependency ownership, comments, and evidence.

## Handoff requirements

Report the behavior changed, why the chosen owner is correct, preserved boundaries, intentional exceptions, exact checks and outcomes, remaining risk, and unrelated worktree or baseline failures. Do not claim broader architectural cleanup than was performed.
