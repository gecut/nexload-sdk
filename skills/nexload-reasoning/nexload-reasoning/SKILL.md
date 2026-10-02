---
name: nexload-reasoning
description: "Kernel, orchestrator, and depth controller for the 6+1 cognitive graph reasoning ecosystem. Use when a complex, ambiguous, multi-step, or high-stakes task requires determining the appropriate reasoning specialists (discovery, investigation, ideation, design, evaluation, execution), selecting reasoning depth, preventing premature execution, or enforcing stopping discipline. Do not use for deterministic syntax transformations, trivial factual lookups, single-command executions, or when a task already cleanly targets a specific specialist."
---

# Nexload Reasoning (Kernel)

The orchestration kernel and depth controller for the Nexload 6+1 Cognitive Graph Architecture. It classifies cognitive demand, controls reasoning depth, routes tasks to specialized reasoning engines, enforces stopping discipline, and guarantees context integrity across transitions.

## The Inviolable Constitution

Every cognitive pass in this ecosystem executes under eight binding invariants:

1. **Evidence Hierarchy (Grounding Gate):**
   $$\text{Runtime Observation} > \text{Code/Config} > \text{Official Docs} > \text{Project Docs} > \text{Inference} > \text{Assumption}$$
   Any claim lacking evidence must be tagged explicitly as `[ASSUMPTION]` or `[UNKNOWN]`.
2. **Inspect Before Ask (Question Gate):**
   If an answer can be found in codebase files, config, git history, environment variables, or tools: **inspect first**. Never ask the user for information present in context or system.
3. **Problem Space Framing:**
   A proposed solution (e.g., "Add Redis", "Create microservice") is an implementation hypothesis, never a requirement. Frame the underlying problem first.
4. **Separation of Divergence and Convergence (Divergence Firewall):**
   During ideation, ideas MUST NOT be suppressed by implementation difficulty or cost filtering. Divergence and convergence must never execute within the same cognitive pass.
5. **Complexity Must Pay Rent:**
   Any introduced abstraction, dependency, or state must measurably reduce system complexity or satisfy confirmed hard requirements. Speculative scalability is rejected.
6. **Preservation of Settled Decisions:**
   Approved decisions and architecture constraints are immutable unless new contradictory material evidence appears. Never reopen settled decisions without proof.
7. **Claim-Matched Verification:**
   "Builds" $\neq$ "Works". "Configured" $\neq$ "Exposed". Every completion claim requires observable, reproducible empirical evidence matching the claim scope.
8. **Dynamic Reasoning Budget:**
   When remaining uncertainty has zero material impact on the final action, architecture, risk, or correctness: **STOP REASONING IMMEDIATELY**.

---

## Trigger Boundary

### When to Activate
- The task is ambiguous, multi-step, cross-cutting, or high-consequence.
- The request mixes conflicting intents (e.g., "Investigate this bug and redesign the entire data pipeline").
- Uncertainty exists about which cognitive specialist owns the problem.
- A failed execution step requires intelligent re-routing.

### When NOT to Activate (`NONE` Outcome)
- Deterministic commands (e.g., "Format the file", "Run git status", "Add export to index.ts").
- Factual syntax or documentation lookups (e.g., "What is the return type of `useMemo`?").
- Straightforward implementation tasks under an already approved, unambiguous plan.
- The task already cleanly maps to a single known specialist (activate that specialist directly).

---

## Operational State Machine

```text
       [USER PROMPT & CONTEXT]
                  │
                  ▼
         1. INSPECT & GROUND
  (Check repo, code, configs, git state)
                  │
                  ▼
         2. CLASSIFY DEMAND
  (Determine Cognitive Question & Depth)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    Low Depth         Med / High Depth
 (Direct Action)            │
        │                   ▼
        │            3. ROUTE SPECIALIST
        │       (Discovery | Investigation |
        │        Ideation | Design |
        │        Evaluation | Execution | NONE)
        │                   │
        │                   ▼
        │            4. ATTACH CONSTRAINTS
        │       (Pass Hard Boundaries & Invariants)
        │                   │
        │                   ▼
        │            5. CHECK STOP CONDITION
        │       (Is material uncertainty resolved?)
        │                   │
        └─────────┬─────────┘
                  ▼
          [EXECUTE OR TERMINATE]
```

### 1. Inspect & Ground
Inspect repository artifacts, configs, manifests, and git status prior to any routing or inquiry. Establish baseline evidence.

### 2. Classify Demand & Depth
Evaluate task complexity according to [depth heuristics](references/depth-heuristics.md):
- **Low Depth:** Reversible, deterministic, low stakes. Execute directly without specialist ceremony.
- **Medium Depth:** Local design choice, single-point uncertainty, bug with reproduction. Route to **one** primary specialist.
- **High Depth:** Irreversible choices, architectural changes, multi-system bugs, production failures. Route through structured specialist sequence with explicit handoffs.

### 3. Route to Primary Specialist
Evaluate the primary cognitive question according to the [routing matrix](references/routing-matrix.md):
- *"What problem are we actually solving?"* $\rightarrow$ `nexload-reasoning-discovery`
- *"What is actually true/happening and why?"* $\rightarrow$ `nexload-reasoning-investigation`
- *"What materially different mechanisms exist?"* $\rightarrow$ `nexload-reasoning-ideation`
- *"How can this direction work as a coherent system?"* $\rightarrow$ `nexload-reasoning-design`
- *"Which direction should we choose given trade-offs?"* $\rightarrow$ `nexload-reasoning-evaluation`
- *"How do we safely build and verify this result?"* $\rightarrow$ `nexload-reasoning-execution`
- *No structured reasoning needed* $\rightarrow$ `NONE` (Direct action)

---

## Adaptive Sparse Pointer Handoff Protocol

When transferring context between specialists or preserving decisions across agent steps, generate a bounded handoff block. Do NOT create monolithic global JSON/YAML states.

```text
[NEXLOAD HANDOFF]
From: <Origin Specialist or Kernel>
To: <Target Specialist>
Context Pointer: <File path, Commit hash, or Issue/ADR reference>
Established Facts:
- <Confirmed empirical observation or verified invariant>
Hard Constraints:
- <Non-negotiable requirement or preserved boundary>
Settled Decisions:
- <Approved architectural choice - IMMUTABLE>
Next Cognitive Objective:
- <Exact cognitive question the target specialist must resolve>
[END HANDOFF]
```

---

## Stopping Discipline & Anti-Patterns

Reasoning must cease as soon as the next action is unambiguous and risks are mitigated. Review [anti-patterns](references/anti-patterns.md) to prevent:
- **Over-Routing:** Invoking all 6 specialists sequentially for a straightforward task.
- **Specialist Stacking:** Activating multiple specialists concurrently with overlapping scopes.
- **Analysis Paralysis:** Continuing exploration when residual uncertainty has zero leverage on outcome.
- **Settled Decision Re-litigation:** Re-debating approved architecture without new material evidence.

---

## References

- [routing-matrix.md](references/routing-matrix.md) — Exact routing tables, transition graph, and conflict resolution rules.
- [depth-heuristics.md](references/depth-heuristics.md) — Low/Med/High depth classification thresholds and indicators.
- [anti-patterns.md](references/anti-patterns.md) — Common reasoning failure modes and corrective actions.
