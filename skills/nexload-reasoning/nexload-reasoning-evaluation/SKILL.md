---
name: nexload-reasoning-evaluation
description: "Specialist for convergent decision-making, Pareto option pruning, material trade-off analysis, pre-mortem stress testing, and reversibility assessment. Use when choosing between competing architectural options, libraries, vendors, migration strategies, or infrastructure designs. Do not use for unconstrained brainstorming, implementing approved plans, or diagnosing unknown crashes."
---

# Nexload Reasoning: Evaluation

The convergent decision engine of the Nexload 6+1 ecosystem. Its mission is to subject competing candidate directions, architectures, or libraries to rigorous scrutiny, eliminate strictly dominated options, stress-test risks, weigh material trade-offs, and produce a single, justified default recommendation with explicit reversal conditions.

## The Inviolable Constitution

Every evaluation pass operates under these binding invariants:

1. **Evidence Hierarchy:**
   Ground evaluation criteria in empirical benchmarks, active codebase realities, and verified constraints rather than marketing claims or generic blogs.
2. **Inspect Before Ask:**
   Inspect existing repository dependencies, build times, bundle sizes, and environment capabilities before asking the user for trade-off preferences.
3. **Problem Space Framing:**
   Evaluate options against the core problem framed in Discovery, not against peripheral secondary features.
4. **Separation of Divergence and Convergence:**
   Evaluation strictly converges and prunes. It does not generate new speculative options mid-analysis.
5. **Complexity Must Pay Rent:**
   Any option introducing operational overhead or extra dependencies must prove superior leverage over simpler, native alternatives.
6. **Preservation of Settled Decisions:**
   Once an option is evaluated and approved, it becomes an immutable settled decision. Do not re-litigate.
7. **Claim-Matched Verification:**
   Validate trade-off claims with observable evidence (e.g. bundle size inspection, latency measurement) before recommending.
8. **Dynamic Reasoning Budget:**
   Stop evaluation as soon as one option clearly dominates or remaining trade-offs have zero material impact on system success.

---

## Trigger Boundary

### When to Activate
- Two or more viable candidate architectures or designs require selection.
- High-stakes library, framework, or vendor choices (e.g., choosing ORM, state management, or auth provider).
- Reversibility or operational risk is high (e.g., destructive database schema migration, multi-tenant partitioning).
- Pre-mortem stress test required before committing engineering resources to a major delivery plan.

### When NOT to Activate
- Brainstorming new mechanisms from scratch $\rightarrow$ `nexload-reasoning-ideation`.
- Detailing module interfaces or internal state ownership $\rightarrow$ `nexload-reasoning-design`.
- Diagnosing a failing production error $\rightarrow$ `nexload-reasoning-investigation`.
- Executing an approved implementation plan $\rightarrow$ `nexload-reasoning-execution`.

---

## Evaluation State Machine

```text
       [COMPETING OPTIONS / PROPOSALS]
                      │
                      ▼
        1. HARD CONSTRAINT SCREENING
     (Filter out options violating invariants)
                      │
                      ▼
         2. PARETO PRUNING (DOMINANCE)
     (Eliminate strictly dominated alternatives)
                      │
                      ▼
         3. MATERIAL CRITERIA ANALYSIS
     (Performance, Operations, Cost, Simplicity)
                      │
                      ▼
         4. REVERSIBILITY ASSESSMENT
     (Two-way door vs. One-way door ladder)
                      │
                      ▼
         5. PRE-MORTEM STRESS TEST
     (Assume failure 6 months out: why did it fail?)
                      │
                      ▼
       6. COMPOSE DECISION RECORD (ADR)
     (Selected Default, Rationale, Reversal Triggers)
                      │
                      ▼
          7. HANDOFF TO EXECUTION
```

### 1. Hard Constraint Screening
Screen all proposals against the hard constraints established in Discovery. If an option violates a non-negotiable requirement (e.g., "Must run entirely on-premise without external network access"), eliminate it immediately.

### 2. Pareto Pruning (Eliminating Dominated Options)
If Option B is no better than Option A across any material dimension, and worse on at least one (e.g. higher latency, more dependencies, higher operational complexity):
- **Option B is strictly dominated.**
- Eliminate it immediately from the report. Do NOT present dominated options merely to maintain a false appearance of "balance".

### 3. Material Criteria Analysis
Evaluate remaining viable options using [Material Criteria Matrix](references/material-criteria-matrix.md). Focus strictly on material differentiators:
- **Runtime Performance & Footprint:** Latency, memory, CPU overhead.
- **Operational Complexity:** Maintenance burden, failure modes, observability.
- **Dependency & Supply Chain Risk:** License, maintainer vitality, transitive bloat.
- **Developer Velocity & Friction:** Type safety, debugging ergonomics.
- *Anti-Pattern Warning:* Avoid arbitrary scoring theater (e.g. "Option A scores 7.8/10") unless numbers reflect empirical benchmarks.

### 4. Reversibility Assessment
Classify the decision using the [Reversibility Ladder](references/reversibility-ladder.md):
- **Type 1 (Two-Way Door):** Easily reversible in $< 1$ day without data loss (e.g., internal helper library, local UI styling). Decide quickly with minimal ceremony.
- **Type 2 (One-Way Door):** Extremely difficult or costly to reverse (e.g., database schema change, external API public contract, core auth rewrite). Subject to deep pre-mortem scrutiny.

### 5. Pre-Mortem Stress Test
Apply [Pre-Mortem Stress Test](references/pre-mortem-stress-test.md) to the leading candidate:
- *Premise:* "Assume it is 6 months from now and this implementation suffered a catastrophic failure. What caused it?"
- Identify vulnerability vectors and build explicit mitigations into the decision record.

### 6. Make a Decisive Default Recommendation
The evaluation specialist **must recommend a single default**. Never end with "It depends, pick whichever you prefer."

---

## Output Artifact: Decision Record (ADR / Decision Brief)

```markdown
# Architectural Decision Record: <Decision Title>

## 1. Context & Competing Options
- **Decision Context:** <Core objective and trade-off tension>
- **Candidates Evaluated:** <Options considered>
- **Dominated Options Pruned:** <Eliminated options and reason for dominance>

## 2. Material Trade-off Comparison
| Dimension | Candidate A (<Name>) | Candidate B (<Name>) | Decisive Factor |
|---|---|---|---|
| Operational Complexity | Low (Uses existing DB) | High (Requires new daemon) | Favors A |
| Latency Overhead | 15ms | 2ms | Favors B (not bottleneck) |
| Reversibility | High (Two-way door) | Medium | Favors A |

## 3. Selected Direction & Justification
- **Approved Default:** <Single chosen option>
- **Core Rationale:** <Why this best satisfies material constraints while minimizing complexity>
- **Accepted Trade-off:** <The explicit downside we accept in choosing this option>

## 4. Reversal Triggers (When to Re-evaluate)
- **Trigger 1:** <Specific metric or event that invalidates this decision, e.g., "If QPS exceeds 5,000">
- **Trigger 2:** <Upstream change, e.g., "If library drops Node 22 support">
```

---

## Sparse Pointer Handoff

```text
[NEXLOAD HANDOFF]
From: nexload-reasoning-evaluation
To: nexload-reasoning-execution (or nexload-reasoning-design)
Context Pointer: <Path to Decision Record / ADR>
Established Facts:
- <Selected option with material trade-off justification>
Hard Constraints:
- <Accepted operational parameters and limits>
Settled Decisions:
- <Approved architectural choice - IMMUTABLE>
Next Cognitive Objective:
- <Decompose atomic implementation plan and define verification checkpoints>
[END HANDOFF]
```

---

## References

- [material-criteria-matrix.md](references/material-criteria-matrix.md) — Grounded comparative matrices without artificial scoring theater.
- [pre-mortem-stress-test.md](references/pre-mortem-stress-test.md) — Prospective hindsight protocols to expose blast radius and hidden failure vectors.
- [reversibility-ladder.md](references/reversibility-ladder.md) — Calibrating decision rigor to reversibility (Type 1 vs. Type 2 decisions).
