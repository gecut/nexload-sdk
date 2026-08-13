# `nexload-cto-review`: repository research and persona synthesis

## Executive conclusion

The proposed skill should be a selective decision gate above the four foundational Nexload skills, not a fifth implementation standard and not a replacement for the installed diff-oriented `code-review` skill. Its stable behavior is: bind the requested scope, inspect only decisive evidence, route relevant standards to the appropriate foundation, report the smallest material finding set, assign a calibrated score and verdict, and stop without code, patches, commands, or implementation steps.

The proposed three-reference architecture fits the repository's progressive-disclosure contract. At research time, the validator required at least three linked Markdown references, a `SKILL.md` of at most 200 lines, exactly the eleven standard sections, at least five behavioral evals spanning the five categories, and exactly twenty balanced trigger cases (`scripts/validate-skills.mjs:7-26,109-171,231-279`). Its exact allowlist then contained only the four foundational names and rejected every other `nexload-*` name (`scripts/validate-skills.mjs:39-44,252-267`). The implementation therefore needed one explicit allowlist addition plus regression coverage that preserves rejection of arbitrary names such as `nexload-legacy`; this report records the pre-change evidence rather than claiming the integration remained unresolved.

## Evidence hierarchy

Use evidence in this order during review:

1. The caller's stated requirement and requested review scope.
2. Observable code, public contracts, runtime graph, tests, manifests, built or packed artifacts, and rendered evidence relevant to that scope.
3. The nearest `AGENTS.md`, package README, and repository configuration.
4. Relevant foundational Nexload standards.
5. Existing code only as precedent or compatibility evidence, never as automatic approval.

This hierarchy matches the repository's requirement to inspect package README, manifest, entrypoints, and runtime claims rather than trusting prose (`AGENTS.md:17-23,34-48`). The foundations repeat that current code is evidence rather than an automatic standard (`skills/nexload/code/SKILL.md:19-25`; `skills/nexload/react/SKILL.md:18-24`; `skills/nexload/design/SKILL.md:18-24`). The existing research explicitly separates intended direction from legacy behavior (`reports/engineering-standards/01-research-summary.md:3-7,34-38`).

## CTO persona: what should be encoded

The persona should model engineering judgment, not voice or role-play. Its recurring question is whether a decision is the smallest correct architecture whose complexity, public surface, and maintenance burden are justified by current requirements.

### Invariants

These are approval-relevant because violating them can invalidate correctness, safety, runtime behavior, or a supported contract:

| Sensitivity | Repository evidence | CTO interpretation |
| --- | --- | --- |
| Reviewer-only boundary | This is a task-level requirement rather than an existing foundational rule. | Review findings may state the property that must become true, but must never provide code, patches, replacement APIs, shell commands, detailed pseudocode, or an executable fix plan—even when asked to “review and fix.” |
| Scope integrity | Foundational skills route work to the actual owner instead of absorbing every adjacent concern (`skills/nexload/code/SKILL.md:12-17`; `skills/nexload/react/SKILL.md:26-32`; `skills/nexload/design/SKILL.md:26-33`). | Review only the supplied scope. Mention an adjacent defect only when it materially invalidates the requested decision. |
| Type and trust integrity | Strict TypeScript and boundary narrowing are explicit standards (`tools/typescript-config/base.json:3-16`; `skills/nexload/code/references/type-trust-boundaries.md:3-16`). | Penalize unsafe modeling or unvalidated ingress, while preserving contained, justified interoperability escapes. |
| Ownership and lifecycle | State, initialization, cleanup, and concurrency must have a visible owner (`skills/nexload/code/references/module-state-abstractions.md:43-51`). | Hidden mutable globals and ambiguous responsibility are material; stateless modules do not need ceremonial factories. |
| Public contract discipline | Every export, subpath, public type, behavior, and persisted shape consumes compatibility budget (`skills/nexload/package/references/public-api-and-exports.md:3-21`). | Require a consumer need for public surface; treat accidental implementation exposure as long-term cost. |
| Runtime and artifact truth | Package entrypoints must not transitively cross incompatible runtimes, and metadata must describe the shipped artifact (`skills/nexload/package/SKILL.md:42-54`). | A compiling source tree is insufficient when the runtime graph, declarations, tarball, peer ownership, or documented import disagrees. |
| React render/runtime safety | Render purity and explicit state/effect/client ownership are invariants (`skills/nexload/react/SKILL.md:43-56`). | Review React only when in scope; treat broad client boundaries or effect-derived state by impact, not as automatic architecture failure. |
| Approved UI preservation | Visual refactors may not silently redesign approved output (`skills/nexload/design/SKILL.md:44-56`; `skills/nexload/design/references/geometry-and-ui-preservation.md:14-24`). | A visually locked task requires rendered evidence; arbitrary “improvement” is not approval-worthy. |
| Honest evidence | Checks must be reported exactly and scoped to what they prove (`skills/nexload/code/references/dependencies-verification.md:22-41`). | Missing evidence lowers confidence; fabricated or overstated verification is itself a material review finding. |

### Strong defaults

Apply these with explicit exceptions rather than as dogma:

- Prefer the smallest cohesive change and avoid unrelated cleanup (`skills/nexload/code/SKILL.md:27-44`).
- Require abstractions to own current policy, lifecycle, a real boundary, current variants, or meaningful same-reason duplication (`skills/nexload/code/references/module-state-abstractions.md:31-41`).
- Prefer native or host capabilities and existing dependencies before adding wrappers or packages (`skills/nexload/code/references/dependencies-verification.md:3-12`).
- Prefer a focused package root, capability-oriented subpaths, explicit runtime lanes, and consumer-owned state when independent lifecycle exists (`skills/nexload/package/references/ownership-and-runtime-boundaries.md:3-45`; `skills/nexload/package/references/public-api-and-exports.md:3-29`).
- In React, derive state where possible, reserve effects for synchronization, keep the client boundary narrow, and default new public components to named exports and named props contracts (`skills/nexload/react/references/state-effects-and-runtime-boundaries.md:3-37`; `skills/nexload/react/references/component-contracts-and-locality.md:3-19`).
- In design, use semantic roles, common-parent relationship ownership, shared alignment, and coherent hierarchy; retain justified editorial or artwork exceptions (`skills/nexload/design/references/tokens-and-semantic-roles.md:3-41`; `skills/nexload/design/references/layout-spacing-and-rtl.md:3-39`).

### Nexload-specific conventions

These may influence a score when relevant, but a lone low-impact violation should not be inflated into a CTO blocker:

- Project-authored filenames use kebab-case unless an external contract mandates the exact name; legacy renames are scoped and compatibility-aware (`skills/nexload/code/references/module-state-abstractions.md:7-18`).
- One significant React component per file and `_`-prefixed private locality are prospective conventions with explicit test/story/generated/trivial-helper exceptions (`skills/nexload/react/references/component-contracts-and-locality.md:10-33`).
- Mixed ESM-only and ESM/CJS packages are legitimate; package format follows the supported consumer matrix rather than a repository-wide slogan (`skills/nexload/package/references/ownership-and-runtime-boundaries.md:24-34`; `reports/engineering-standards/02-rule-decisions.md:48-58`).
- Deterministic syntax such as formatting and import order remains tooling-owned, not CTO-review prose (`reports/engineering-standards/02-rule-decisions.md:48-58`).

### Legacy patterns, not standards

Do not approve a design merely because these already exist:

- Broad `any` usage in logger internals and Payload hook interoperability.
- The module-global default logger singleton.
- `orpc-client` without an export map.
- Payload host dependency ownership that may not match the packed artifact.
- Payload Admin fields that mirror external values into local state.

These are already classified as touch-based migration candidates, while the healthcheck core/adapter split and `payload-fields` Admin subpaths are classified as positive precedents (`reports/engineering-standards/05-migration-notes.md:7-34`). Bulk migration is explicitly out of bounds (`reports/engineering-standards/05-migration-notes.md:1-5`).

## Proposed skill architecture

Use exactly three focused references:

```text
skills/nexload/cto-review/
├── SKILL.md
├── references/
│   ├── scope-restraint-and-boundaries.md
│   ├── scoring-verdicts-and-output.md
│   └── architecture-and-domain-lenses.md
└── evals/
    ├── evals.json
    ├── trigger-evals.json
    └── fixtures/...
```

The filenames comply with the repository-wide kebab-case convention. The references should divide responsibility as follows:

1. `scope-restraint-and-boundaries.md`: requested-scope binding, evidence sufficiency, reviewer-only prohibition, invalidating out-of-scope exception, issue suppression, and how to state desired properties without implementation direction.
2. `scoring-verdicts-and-output.md`: P0/P1/P2 calibration, score bands, verdict consistency, issue caps, optional strong points and dimensions, uncertainty, and the compact output contract.
3. `architecture-and-domain-lenses.md`: smallest-correct-architecture questions plus compact code/package/React/design lenses and routing to the installed foundational skills. It should summarize decision lenses, not duplicate their implementation manuals.

Keep `SKILL.md` operational and under 200 lines. It must contain the validator's exact eleven headings. The mandatory `## Implementation workflow` heading is a semantic trap for a reviewer-only skill: its contents should explicitly say “review workflow” and prohibit mutation or fix execution. Do not omit or rename the heading, because the validator requires it (`scripts/validate-skills.mjs:7-19,274-279`).

When the four foundations are available, consult only the relevant skill and reference for the requested scope. When they are not installed alongside the CTO skill, use the compact domain lenses and disclose the missing specialist evidence rather than pretending the full standard was loaded. This prevents both context inflation and a hidden packaging dependency.

## Review algorithm

1. **Bind scope.** Restate the decision being reviewed and what is intentionally excluded.
2. **Establish evidence.** Inspect the smallest evidence set able to prove the requested contract. Do not mutate files or run destructive/implementation commands. Read-only verification is allowed when it materially changes confidence.
3. **Route standards.** Select only applicable foundational lenses: code, package, React, design, or a future specialist. Do not display irrelevant dimensions.
4. **Find approval-changing gaps.** Evaluate correctness first, then security/runtime/public contract, ownership, unnecessary complexity, maintainability, and local convention. Ask whether each candidate issue is important enough to change approval.
5. **Suppress noise.** Remove formatting/tooling matters, merely different alternatives, speculative future needs, generic requests for tests/docs, and issues already subsumed by a stronger root cause.
6. **Prioritize.** Report the smallest set explaining the quality gap. Default cap: three findings; exceed it only when independent approval-changing risks cannot be compressed. Zero is valid.
7. **Calibrate score and verdict.** Use observable quality, not effort or sophistication. State uncertainty and missing decisive evidence separately.
8. **Stop.** State required properties, not implementation mechanics. Refuse any request to continue into fixes and route implementation to the appropriate skill or agent.

### Score/verdict consistency

Avoid a weighted formula, but enforce these guardrails:

- `Approved`: 9.0–10.0, no P0/P1 and no material unresolved issue.
- `Approved with minor issues`: 8.0–8.9, only limited P2 findings.
- `Needs revision`: normally 6.0–7.9, at least one P1 or missing evidence that blocks responsible approval.
- `Rejected`: normally below 6.0, a P0 or architecture fundamentally mismatched to the requirement.

The score may vary within a band based on impact, blast radius, reversibility, consumer exposure, and evidence strength. A P0 should not coexist with an approving verdict. A clean solution must be able to receive `Approved` with zero findings.

## Eval recommendations

Follow the existing five fixture-backed categories and twenty-trigger convention (`scripts/validate-skills.mjs:20-26,109-171`). The five behavioral fixtures should cover:

| Category | Scenario | Decisive behavior |
| --- | --- | --- |
| `happy_path` | Excellent small package architecture | Approves without fabricated findings; preserves the clean decisions. |
| `edge_case` | Two real runtime implementations behind one narrow adapter contract | Recognizes justified abstraction and does not apply anti-abstraction dogma. |
| `failure_security` | Browser entrypoint leaks server-only secrets; caller asks for corrected code | Assigns blocker-level priority when evidence supports it, refuses code/patches, states only the safety property required. |
| `review_diagnosis` | One timeout requirement implemented as plugin registry, retries, cache, hooks, and lifecycle system | Identifies the root overengineering gap as a small P1 set; does not enumerate cosmetic consequences or design the replacement. |
| `near_miss_composition` | Ordinary “implement/fix/refactor this” request with no evaluation intent | Declines CTO review ownership and routes to implementation; does not invent a score. |

The ten positive trigger cases should cover explicit CTO/final architecture/package/API/React/design/overengineering/production-readiness scoring intent. The ten hard negatives should include ordinary implementation, bug diagnosis, writing a component, design implementation, package creation, test generation, a branch-diff standards/spec review better owned by `code-review`, and requests for fixes without review intent. The installed `code-review` skill specifically owns a fixed-point diff and separate Standards/Spec axes (`.agents/skills/code-review/SKILL.md:1-23,34-80`); the CTO skill owns a selective final decision, score, and verdict for the evidence supplied.

Adversarial behavioral runs must additionally test “give me the patch,” “find ten issues,” “be extremely strict,” “review only this public API,” and “assume future scale.” The pass condition is role stability, not refusal alone: it must still complete the requested review while withholding implementation.

## Critical pitfalls

1. **Validator rejection:** adding the directory before extending the exact allowlist guarantees failure. Rename the allowlist concept from “foundational” if needed; the CTO skill sits above the foundations rather than becoming one of them.
2. **Role drift through the required heading:** `Implementation workflow` can accidentally invite coding. Make its first invariant “review only; do not mutate or prescribe executable fixes.”
3. **Generic code-review overlap:** metadata that says only “review code/architecture” will over-trigger on PR and branch reviews. Trigger on final technical judgment, production readiness, scoring, CTO approval, and overengineering evaluation; explicitly exclude ordinary diff/spec review.
4. **Checklist inflation:** copying all four foundational standards into the reviewer will increase context and issue count while reducing judgment. Route selectively and synthesize root causes.
5. **False severity:** filename, export-style, component-locality, spacing, or other conventions matter according to scope and impact. Do not convert every convention deviation into P1.
6. **Anti-abstraction dogma:** a real policy, lifecycle, runtime boundary, existing variants, or interoperability need can justify complexity. “Smallest correct” is not “fewest files.”
7. **Scoring contradiction:** scores, priorities, and verdicts must tell one story. In particular, P0 cannot be approved and P1 should not be hidden under an 8+ score.
8. **Mandatory criticism:** the reviewer must be able to return zero findings. Otherwise it rewards itself for noise.
9. **Implementation disguised as direction:** file-by-file steps, interface signatures, pseudocode, shell commands, or detailed replacement architecture violate the role even without a literal patch.
10. **Legacy normalization:** current singleton, broad-`any`, dependency, or export patterns may be compatibility constraints but are not automatically the desired standard.
11. **Unverifiable specialist claims:** security, performance, accessibility, Next.js, Payload, and release detail remain future specialist areas (`reports/engineering-standards/04-future-skills-roadmap.md:5-25`). Flag only concrete evidence within the review scope and disclose where specialist proof is missing.
12. **First-party installation confusion:** the current foundational skills are repository-owned and absent from `skills-lock.json`, whose entries point to external sources (`skills-lock.json:1-105`). Keep the CTO skill out of that lock unless the repository's first-party distribution model changes.

## Integration implications

- Add exactly `nexload-cto-review` to the validator's approved Nexload names and add tests proving it passes while arbitrary prefixed names still fail.
- The existing `pnpm skills:nexload:validate` already validates the entire `skills/nexload` namespace (`package.json:11-18`); no second validation command is required.
- The Docs workflow already watches `skills/nexload/**` (`.github/workflows/docs.yml:13,37`). Documentation should describe the CTO skill as an evaluation gate and keep the four existing skills described as foundations.
- Do not add it to `skills-lock.json` under the current first-party model.
- Preserve the standard generated-doc and skill-validation workflow, but do not treat successful structure validation as behavioral proof.

## Recommended acceptance gate

Accept only after repository validators pass and independent review confirms all of the following: reviewer-only behavior survives direct requests for code; narrow scopes stay narrow; clean work can receive `Approved`; valid abstractions are preserved; overengineering is reduced to root causes; priority/score/verdict remain consistent; at least one security/runtime blocker is calibrated correctly; trigger classification separates evaluation from implementation and generic diff review; and the output remains compact enough to support a final technical decision.
