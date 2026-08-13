# `nexload-cto-review` implementation report

## Outcome

`nexload-cto-review` is implemented as a reviewer-only decision gate above `nexload-code`, `nexload-package`, `nexload-react`, and `nexload-design`. It binds the requested scope, consults only relevant standards, admits only material evidence-backed findings, assigns P0/P1/P2 priority, derives a calibrated score and verdict, and stops without implementing fixes.

The skill is discoverable through the public Skills CLI contract but is not added to the npm package catalog or `skills-lock.json`.

## 1. Persona synthesis

The encoded CTO sensitivities are:

- smallest correct architecture and complexity that pays for current correctness, policy, lifecycle, isolation, interoperability, or measured performance;
- explicit state, lifecycle, configuration, package, public/internal, core/adapter, and server/browser ownership;
- small intentional public APIs and truthful runtime/package contracts;
- meaningful strict typing without type cleverness or trust-boundary assertions;
- native/host capability and dependency restraint without zero-dependency dogma;
- evidence-led security and performance rather than speculative concerns;
- selective React and design-system judgment only when those domains are in scope;
- preservation of valid abstractions with real variants or boundaries;
- approval capability: good work can receive `Approved` with no manufactured finding.

Repository evidence and the invariant/default/convention/legacy distinction are documented in [the research report](06-cto-review-research.md).

## 2. Review model

The reviewer first freezes the artifact, requirement, exclusions, and approval question. Candidate issues pass an evidence-impact gate: they must be evidenced, causal, material, distinct, scoped, and expressible without an implementation recipe. Symptoms are compressed under root causes and the default output contains no more than three findings; independent P0/P1 findings may exceed that ceiling when they change the decision.

Priority and verdict are consequence-based:

| Remaining risk | Normal verdict | Score band |
| --- | --- | --- |
| No material finding | `Approved` | 9.0–10.0 |
| Limited P2 only | `Approved with minor issues` | 8.0–8.9 |
| One or more P1, no P0 | `Needs revision` | normally 6.0–7.9 |
| Concrete P0 or fundamentally wrong direction | `Rejected` | normally below 6.0 |
| Decisive evidence absent and outcome reversible | `Withheld` / `Not assessable` | no fabricated numeric score |

P0 contract failures are limited to materially false supported contracts that make declared use unsafe or nonfunctional. Bounded defects with limited blast radius or safe workarounds may be P1.

## 3. Hard boundaries

The prohibition on implementation appears in metadata, decision flow, workflow, invariants, scope/restraint guidance, output contract, and handoff:

- no repository mutation;
- no replacement code, interfaces, components, files, patches, or diffs;
- no shell commands, pseudo-code, or executable fix sequence;
- no implementation even when the caller asks to “review and then fix”;
- desired architectural properties are allowed, implementation mechanics are not;
- no issue quota, performative harshness, unsupported future scale, or line-by-line checklist spillover.

`nexload-cto-review` remains distinct from the installed generic `code-review` skill: the latter owns fixed-point diff review against Standards and Spec; the CTO skill owns selective final judgment, production readiness, score, and verdict.

## 4. Eval results and iteration outcomes

Five fixture-backed paired scenarios covered clean approval, a justified two-adapter boundary under code-generation pressure, a browser/server secret boundary failure, an overengineered timeout plugin platform plus issue-quota manipulation, and a narrow React/runtime review with unrelated design defects and a refactor request.

| Result | With skill | Baseline |
| --- | ---: | ---: |
| Observable expectations | 15/15 (100%) | 11/15 (73.3%) |
| Blind pair preference | 5/5 | 0/5 |
| Implementation leakage | 0/5 | 3/5 |

The skill calibrated the clean adapters to 9.5–9.7 `Approved`, the speculative extension system to 6.4 `Needs revision`, the scoped React issues to 6.7 `Needs revision`, and the proven browser/security boundary failure to 3.5 `Rejected`. The baseline over-rejected the recoverable architecture, inflated React locality severity, and emitted implementation directions in the security, timeout, and React cases.

The first adversarial audit scored 92/100 and found that metadata required overly strong score/approval cues. The description and trigger set were revised to cover bare package/architecture/design/implementation reviews and mixed review-then-fix intent. A fresh metadata-only classifier then scored 20/20 with no mismatch.

The first consumer review also exposed broad P0 contract wording and an eval-2 artifact synchronization gap. P0 was narrowed by blocker impact, the canonical expectation and all generated `/tmp` artifacts were synchronized, and the static viewer was regenerated.

Raw runs, grading, comparisons, audits, benchmark, and viewer are intentionally outside the repository:

- `/tmp/nexload-sdk-skill-evals/nexload-cto-review/iteration-1/`
- `/tmp/nexload-sdk-skill-evals/nexload-cto-review/review.html`
- `/tmp/nexload-sdk-skill-evals/nexload-cto-review/trigger-audit-iteration-2.json`
- `/tmp/nexload-sdk-skill-evals/nexload-cto-review/final-consumer-review.json`
- `/tmp/nexload-sdk-skill-evals/nexload-cto-review/final-adversarial-audit-iteration-2.json`

Timing and token metrics were not exposed reliably by the subagent interface and were not fabricated. The benchmark has one sample per configuration, so it proves these observable cases but not variance.

## 5. Final independent scores

- Codex-consumer reviewer: **96/100**, ready for use.
- Adversarial maintainer reviewer: **97/100**, accepted with no material unresolved issue.

Remaining evidence limitations are explicit: actual runtime skill-selection behavior was not repeatedly instrumented beyond independent metadata-only classification, and the five behavioral cases do not cover every ambiguous/mixed-severity calibration boundary such as a `Withheld` result. These are evaluation-depth limits, not observed failures in the implemented contract.
