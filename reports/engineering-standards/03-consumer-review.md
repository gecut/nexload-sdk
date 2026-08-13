# Foundational skills: consumer review and evaluation

## Method

The four skills were reviewed through independent repository, research, consumer, adversarial-maintainer, trigger, grader, benchmark-analysis, and blind-comparison tracks. Reviewers did not edit the skill files. Behavioral runs used one fresh with-skill agent and one fresh baseline agent per skill; baseline agents read only committed eval prompts and fixtures, never the skill or references.

Raw outputs, grading, benchmarks, blind comparisons, and static review viewers are under `/tmp/nexload-sdk-skill-evals/`. Timing and token metrics are omitted because the agent interface did not expose reliable usage metadata. Each configuration has one run per eval, so pass rates are evidence for these scenarios rather than variance estimates.

## Review iterations

The first consumer review scored the draft suite 94/100 overall and found no critical security failure. The adversarial pass found one release-blocking error: the React reference incorrectly treated all Payload Admin components as client components. It also challenged unconditional package layering, verification matrices, React trust wording, design spacing/mobile rules, and future-skill handoffs.

The skills were revised to:

- preserve Payload's Server Component default and opt into client behavior only when required;
- make core/adapter layering conditional on a real runtime-neutral core;
- distinguish server, browser/Admin, and runtime-neutral import lanes and declare intentional side effects truthfully;
- scale inspection and verification to task risk and keep review-only work non-mutating;
- treat React trust by provenance and preserve established public/default exports;
- make spacing, mobile-first, logical geometry, and visual verification strong defaults with evidence-based exceptions;
- define bounded fallback behavior when a future specialist skill is not installed.

A second iteration tightened plain-object interop and locked editorial physical indentation after the first guided outputs exposed those edge cases. All four skills were rerun or re-reviewed after their relevant revisions.

## Final reviewer scores

Each dimension is scored from 1–5. The acceptance gate was at least 90/100, no dimension below 4/5, and no unresolved critical architecture or security failure.

| Skill | Technical | Alignment | Usefulness | Clarity | Precision | Completeness | Efficiency | Architecture | Maintainability | Freedom | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `nexload-code` | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 100/100 |
| `nexload-package` | 4 | 5 | 5 | 4 | 4 | 4 | 5 | 5 | 5 | 5 | 92/100 |
| `nexload-react` | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 100/100 |
| `nexload-design` | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 100/100 |

No final reviewer reported a critical failure. `nexload-package` remains deliberately more conditional than the other skills because package format, peers, side effects, and compatibility evidence depend on the declared consumer matrix.

## Trigger audit

An independent metadata-only classifier read only each skill's name and description, then classified all committed trigger cases:

- 80/80 labels matched;
- each skill retained exactly 10 positive and 10 neighboring negative queries;
- package error/runtime cases remain the closest boundary, resolved by the primary-task and shipped-contract wording.

## Behavioral benchmark

The first blind comparison across all 20 pairs produced:

- with skill: 16 wins;
- without skill: 1 win;
- ties: 3;
- mean quality: 9.66/10 with skill versus 9.08/10 baseline.

After assertion tightening and the second code/design iteration, the selected formal benchmark results were:

| Skill / iteration | With skill | Baseline | Blind-review note |
| --- | ---: | ---: | --- |
| `nexload-code` / 2 | 100% | 100% | Iteration-2 blind review: 5–0 for the skill |
| `nexload-package` / 1 | 100% | 100% | Initial blind review: 3 skill wins, 2 ties |
| `nexload-react` / 1 | 100% | 76% | Initial blind review: 5–0 for the skill |
| `nexload-design` / 2 | 100% | 95% | Iteration-2 blind review: 4 skill wins, 1 baseline win |

The code and package binary expectations remained saturated because the baseline agents were capable of satisfying the observable contract. The blind reviewer still found consistent gains in precision, boundary ownership, compatibility preservation, and verification scope. This limitation is recorded rather than hidden or converted into fabricated timing/token evidence.

## Review artifacts

- `/tmp/nexload-sdk-skill-evals/nexload-code/review.html`
- `/tmp/nexload-sdk-skill-evals/nexload-package/review.html`
- `/tmp/nexload-sdk-skill-evals/nexload-react/review.html`
- `/tmp/nexload-sdk-skill-evals/nexload-design/review.html`
- `/tmp/nexload-sdk-skill-evals/blind-comparisons.json`
- `/tmp/nexload-sdk-skill-evals/blind-comparisons-iteration-2.json`
