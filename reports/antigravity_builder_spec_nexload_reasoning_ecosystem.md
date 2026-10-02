# AntiGravity Builder SPEC: Nexload Reasoning Ecosystem
## Target: AntiGravity 3.8-flash (High Plan Mode)
**Standard:** Agent Skills Specification v1.0  
**Architecture:** 6 + 1 Cognitive Graph Architecture  
**Core Purpose:** Encode an evidence-first, critical, decision-oriented, minimal-sufficient-complexity reasoning operating system into production-grade Agent Skills.

---

# 1. System Constitution & Invariants

All skills generated under this ecosystem MUST execute under these 8 inviolable system invariants. Every generated `SKILL.md` must link to or embed these invariants:

1. **Evidence Hierarchy (Grounding Gate):**
   $$\text{Runtime Observation} > \text{Code/Config} > \text{Official Docs} > \text{Project Docs} > \text{Inference} > \text{Assumption}$$
   Claims unsupported by evidence must be tagged explicitly as `[ASSUMPTION]` or `[UNKNOWN]`.
2. **Inspect Before Ask (Question Gate):**
   If an answer can be obtained by inspecting codebase files, environment variables, logs, or tools: **DO NOT ASK THE USER.** Inspect first.
3. **Problem Space Framing:**
   A proposed solution (e.g., "Add Redis") is never treated as a requirement. It is an implementation hypothesis. The underlying problem (latency, state sharing, queuing) must be framed first.
4. **Separation of Divergence and Convergence:**
   During ideation, ideas MUST NOT be suppressed by implementation difficulty or premature cost filtering. Divergence and convergence must never execute within the same cognitive pass.
5. **Complexity Must Pay Rent:**
   Any introduced abstraction, dependency, microservice, or extra state must measurably reduce total system complexity or satisfy a confirmed hard requirement. Speculative scalability is rejected.
6. **Preservation of Settled Decisions:**
   Approved decisions and explicit architecture constraints are immutable unless new contradictory material evidence is introduced.
7. **Claim-Matched Verification:**
   "Builds" $\neq$ "Works". "Configured" $\neq$ "Exposed". Every completion claim must map to an observable, reproducible test or runtime check.
8. **Dynamic Reasoning Budget:**
   If remaining uncertainty has zero material impact on the final action, architecture, risk, or correctness: **STOP REASONING IMMEDIATELY.**

---

# 2. Ecosystem Repository Architecture

The ecosystem consists of exactly 7 standalone-capable skills matching the official naming convention:

```text
nexload-reasoning/
├── nexload-reasoning/                    # [Kernel / Router / Depth Controller]
│   ├── SKILL.md
│   ├── references/
│   │   ├── routing-matrix.md
│   │   ├── depth-heuristics.md
│   │   └── anti-patterns.md
│   └── evals/
│       └── evals.json
├── nexload-reasoning-discovery/          # [Intent / Framing / Constraints / Scope]
│   ├── SKILL.md
│   ├── references/
│   │   ├── problem-framing-canvas.md
│   │   ├── question-gate.md
│   │   └── scope-contract.md
│   └── evals/
│       └── evals.json
├── nexload-reasoning-investigation/      # [Evidence / Root Cause / Causal Models]
│   ├── SKILL.md
│   ├── references/
│   │   ├── hypothesis-discriminator.md
│   │   ├── systematic-debugging.md
│   │   └── evidence-audit.md
│   └── evals/
│       └── evals.json
├── nexload-reasoning-ideation/           # [Divergence / Mechanism Generation]
│   ├── SKILL.md
│   ├── references/
│   │   ├── divergence-engine.md
│   │   ├── concept-fan.md
│   │   └── collision-escape.md
│   └── evals/
│       └── evals.json
├── nexload-reasoning-design/             # [Synthesis / Boundaries / State / Interfaces]
│   ├── SKILL.md
│   ├── references/
│   │   ├── architectural-boundaries.md
│   │   ├── state-ownership.md
│   │   └── failure-path-modeling.md
│   └── evals/
│       └── evals.json
├── nexload-reasoning-evaluation/         # [Convergence / Trade-offs / Reversibility]
│   ├── SKILL.md
│   ├── references/
│   │   ├── material-criteria-matrix.md
│   │   ├── pre-mortem-stress-test.md
│   │   └── reversibility-ladder.md
│   └── evals/
│       └── evals.json
└── nexload-reasoning-execution/          # [Planning / Autonomy / Verification / Recovery]
    ├── SKILL.md
    ├── references/
    │   ├── plan-decomposition.md
    │   ├── claim-verification.md
    │   └── failure-recovery-router.md
    └── evals/
        └── evals.json
```

### File Sizing & Token Budget Rules
- **`SKILL.md`:** MUST NOT exceed 400 lines (~3500 tokens). Acts strictly as an operational state machine, router, and constraint validator.
- **`references/*.md`:** Modular, focused deep-dives loaded via progressive disclosure when specific conditions are triggered.
- **`evals/evals.json`:** Mandatory evaluation suites for test-driven behavior verification.

---

# 3. Specialist Skill Specifications (The 6 + 1 Contract)

## 3.1 `nexload-reasoning` (The Kernel)
- **Cognitive Question:** *"What kind of reasoning is needed now, at what depth, and when should we stop?"*
- **Trigger:** Ambiguous, multi-step, consequential, or high-stakes requests without an explicit single-phase domain.
- **Non-Trigger:** Deterministic commands, direct code refactors of known syntax, trivial factual queries, single-tool execution.
- **Core State Machine:**
  ```text
  INSPECT (Prompt + Context)
    ↓
  CLASSIFY (Complexity: Low | Med | High)
    ↓
  IF Low: EXECUTE DIRECT & STOP
  ELSE: ROUTE to Primary Specialist (Discovery | Investigation | Ideation | Design | Evaluation | Execution)
    ↓
  APPLY Invariant Guardrails & Context Preservation
    ↓
  CHECK STOP CONDITION: Is material uncertainty resolved?
    ↓
  TERMINATE or HANDOFF
  ```
- **Special Rule:** `NONE` is a valid routing outcome. If the task does not require structured reasoning, bypass specialist activation.

---

## 3.2 `nexload-reasoning-discovery` (Problem Framing & Scope)
- **Cognitive Question:** *"What problem are we actually solving, under what constraints, and what must remain unchanged?"*
- **Trigger:** Feature requests with ambiguous intent, stakeholder proposals disguised as technical requirements, greenfield initiatives, unclear business constraints.
- **Non-Trigger:** Bug reproduction with known logs, performance benchmarking, evaluating already designed options.
- **Owns:**
  - Intent Extraction (JTBD).
  - Hard vs. Soft Constraint Separation.
  - Scope Boundaries (`IN`, `OUT`, `MUST PRESERVE`).
  - Decision Ownership (Technical vs. Business/Owner).
  - Question Gate: Ask only decision-changing questions. Provide safe defaults for reversible parameters.
- **Output Artifact:** **Problem Framing Contract** (Objective, Criteria, Constraints, Preserved Systems, Blockers).

---

## 3.3 `nexload-reasoning-investigation` (Reality & Causal Engine)
- **Cognitive Question:** *"What is actually happening, what is the root cause, and what evidence discriminates between hypotheses?"*
- **Trigger:** System crashes, intermittent runtime errors, unexpected performance degradation, conflicting documentation vs. runtime, unverified external claims.
- **Non-Trigger:** Brainstorming new user flows, drafting clean-slate interface definitions, planning sprint tasks.
- **Owns:**
  - Evidence Auditing & Anomaly Isolation.
  - Competing Hypothesis Generation ($H_1, H_2, \dots, H_n$).
  - Discriminator Testing (The cheapest experiment/inspection that falsifies at least one hypothesis).
  - Root Cause Localization (Preventing premature symptom-patching).
- **Output Artifact:** **Causal Diagnosis & Evidence Log** (Observed Facts, Rejected Hypotheses, Verified Root Cause, Confidence Level).

---

## 3.4 `nexload-reasoning-ideation` (Divergent Thinking Engine)
- **Cognitive Question:** *"What materially different mechanisms could achieve this objective?"*
- **Trigger:** Solution space exploration, product feature design, architectural bottlenecks needing novel approaches, breaking mental fixation.
- **Non-Trigger:** Choosing between Option A and Option B, reviewing pull requests, production incident recovery.
- **Strict Boundary:** Divergence Firewall. Feasibility, cost, and implementation difficulty MUST NOT suppress idea generation during this phase.
- **Owns:**
  - Generating $\ge 3$ mechanism-distinct concepts (e.g., Pull vs. Push vs. Hybrid vs. Reactive; Client-driven vs. Worker-driven).
  - Concept Fan & Abstraction Laddering.
  - Assumption Inversion (Removing dominant architectural constraints).
  - Cross-Pollination (Borrowing mechanisms from other systems).
- **Output Artifact:** **Candidate Concept Catalog** (Grouped by mechanism, completely unranked, assumptions explicitly noted).

---

## 3.5 `nexload-reasoning-design` (Architectural Synthesis)
- **Cognitive Question:** *"How can this direction work as an internally coherent, minimal, and bounded system?"*
- **Trigger:** Selected concept needs structure, interface definition, state modeling, data flow, or failure path specification.
- **Non-Trigger:** Deciding if a feature is commercially viable, running unit tests, brainstorming open-ended ideas.
- **Owns:**
  - Single Source of Truth (SSOT) Allocation.
  - Bounded Contexts & Module Seams.
  - Public & Internal Interface Contracts.
  - Data Flow & Invalidation Topologies.
  - Failure Path Semantics (Timeout, retry, idempotency, compensation).
  - Nearest Credible Extension (Designing for now + 1, not now + 10).
- **Output Artifact:** **Coherent Design Specification** (Topology, Boundaries, State Ownership, Failure Modes, Migration Cost).

---

## 3.6 `nexload-reasoning-evaluation` (Convergent Decision Engine)
- **Cognitive Question:** *"Which direction should we select based on material trade-offs, risk, and reversibility?"*
- **Trigger:** Multiple viable options exist, architectural trade-off decisions, high-stakes infrastructure choices, library/vendor selection.
- **Non-Trigger:** Generating more alternatives, coding the solution, collecting stack trace evidence.
- **Owns:**
  - Elimination of Dominated Options (Strict Pareto pruning).
  - Material Criteria Discrimination (Runtime overhead, operational complexity, reversibility, integrity, security).
  - Pre-Mortem & Blast Radius Analysis.
  - Reversibility Assessment (Two-way vs. One-way doors).
  - Concrete Recommendation: Must provide a single justified default.
- **Output Artifact:** **Decision Record (ADR/Decision Brief)** (Selected Default, Key Trade-off, Dominated Options Eliminated, Reversal Triggers).

---

## 3.7 `nexload-reasoning-execution` (Delivery, Verification & Recovery)
- **Cognitive Question:** *"What is the safest sequence to implement this, how do we prove it works, and how do we recover if it fails?"*
- **Trigger:** Approved design ready for delivery, refactoring plan implementation, database migration execution.
- **Non-Trigger:** Re-litigating settled architecture decisions, brainstorming product features.
- **Owns:**
  - Plan Decomposition (Atomic, verifiable phases).
  - Controlled Autonomy (High autonomy on routine code; escalation on boundary shifts).
  - Claim-Matched Verification (Empirical test of stated invariant).
  - Recovery Routing (Classification of failures to appropriate origin):
    ```text
    Local implementation bug      → Stay in Execution
    Plan sequence/dependency bug  → Execution (Re-plan)
    Architectural boundary break  → Route to Design
    Option invalidated by reality → Route to Evaluation
    Requirement/Intent breakdown  → Route to Discovery
    Environment anomaly/crash     → Route to Investigation
    ```
- **Output Artifact:** **Execution Log & Verification Proof** (Phase status, verification outputs, resolved artifacts, residual limitations).

---

# 4. Adaptive Handoff Protocol (Zero-Bloat Context Transfer)

To avoid context explosion and the hallucination risks of rigid global JSON schemas, the ecosystem uses **Sparse Text/Pointer Handoffs**.

When a skill transfers execution to another skill, it MUST output a bounded markdown block matching this schema:

```text
[NEXLOAD HANDOFF]
From: <Current Skill>
To: <Target Skill>
Context Pointer: <File path / Commit / ADR reference>
Established Facts:
- <Confirmed factual observation 1>
Hard Constraints:
- <Preserved boundary or non-negotiable rule>
Settled Decisions:
- <Approved architectural choice - IMMUTABLE>
Next Cognitive Objective:
- <Exact question the target skill must answer>
[END HANDOFF]
```

---

# 5. Evaluation & Behavioral Assertions Engine

Each skill directory must contain an `evals/evals.json` file. The test cases must validate behavior, not keyword matching.

### Canonical Schema for `evals.json`:
```json
{
  "skill_name": "nexload-reasoning-specialist",
  "test_cases": [
    {
      "id": "TC-001",
      "category": "positive_trigger | negative_trigger | near_miss | behavioral_regression",
      "prompt": "Raw user prompt to test",
      "context_files": ["optional/file/paths"],
      "expected_routing": "primary-skill-name or NONE",
      "behavioral_assertions": [
        "The agent does not ask clarifying questions about variables present in package.json",
        "The agent eliminates Option B as strictly dominated",
        "The agent does not write implementation code when the prompt specifies plan-only"
      ]
    }
  ]
}
```

---

# 6. AntiGravity 3.8-flash Implementation Blueprint

AntiGravity must execute the build of this repository in **7 Strict Phases**:

1. **Phase 1: Kernel & Constitution**
   - Build `nexload-reasoning/SKILL.md` (Router + Invariants).
   - Write `routing-matrix.md` and `depth-heuristics.md`.
   - Setup global evals.
2. **Phase 2: Intent & Truth Layer**
   - Build `nexload-reasoning-discovery` (Framing, JTBD, Question Gate).
   - Build `nexload-reasoning-investigation` (Evidence, Root Cause, Falsification).
3. **Phase 3: Generation & Synthesis Layer**
   - Build `nexload-reasoning-ideation` (Divergence, Concept Fan, Collision).
   - Build `nexload-reasoning-design` (Architecture, SSOT, Boundaries, Failure Paths).
4. **Phase 4: Judgment & Delivery Layer**
   - Build `nexload-reasoning-evaluation` (Trade-offs, Pre-mortem, Reversibility).
   - Build `nexload-reasoning-execution` (Decomposition, Verification, Recovery Router).
5. **Phase 5: Cross-Cutting Invariants Injection**
   - Verify that all 7 skills are standalone-capable.
   - Verify that all references adhere to shallow relative loading.
6. **Phase 6: Evals Suite Generation**
   - Generate at least 4 test cases per skill (Positive, Negative, Near-miss, Behavioral Regression).
7. **Phase 7: Static Audit & Verification**
   - Verify frontmatter complies with Agent Skills spec.
   - Verify zero cyclic runtime dependencies.
   - Confirm lines-of-code budget across all `SKILL.md` files.