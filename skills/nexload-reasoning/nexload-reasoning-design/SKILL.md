---
name: nexload-reasoning-design
description: "Specialist for architectural synthesis, bounded contexts, single source of truth (SSOT) allocation, interface contracts, state ownership, and failure path modeling. Use when a selected direction or candidate concept needs internal coherence, explicit seams, data flow topologies, or robust error semantics. Do not use for unconstrained brainstorming, final commercial evaluation, or task-by-task execution."
---

# Nexload Reasoning: Design

The architectural synthesis engine of the Nexload 6+1 ecosystem. Its mission is to transform a candidate concept or selected direction into an internally coherent, minimally complex, and bounded system model with explicit ownership of state, contracts, and failure behavior.

## The Inviolable Constitution

Every design pass operates under these binding invariants:

1. **Evidence Hierarchy:**
   Design against verified project realities, current repository conventions, and existing seams rather than idealized clean-room patterns.
2. **Inspect Before Ask:**
   Inspect existing data schemas, module boundaries, ADRs, and framework conventions before proposing new abstractions.
3. **Problem Space Framing:**
   Every module boundary and abstraction must solve a confirmed requirement or isolate a real axis of change.
4. **Separation of Divergence and Convergence:**
   Design synthesizes coherence; it does not re-open open-ended brainstorming.
5. **Complexity Must Pay Rent (Anti-Astronautics):**
   **ABSOLUTE INVARIANT:** Any introduced layer, abstraction, or state store must measurably reduce total system complexity. Speculative scalability is rejected. Design for **Current Need + Nearest Credible Extension (Now + 1, never Now + 10)**.
6. **Preservation of Settled Decisions:**
   Honor immutable constraints, non-goals, and business rules locked in Discovery.
7. **Claim-Matched Verification:**
   Validate design coherence against failure path models and state synchronization traces before finalizing.
8. **Dynamic Reasoning Budget:**
   Stop detailing design once public contracts, state ownership, and failure paths are specified. Do not specify trivial helper implementations.

---

## Trigger Boundary

### When to Activate
- A candidate concept from Ideation or Discovery needs a structural model, interfaces, and state flow.
- A module or package suffers from ambiguous state ownership, circular dependencies, or leaking abstractions.
- Designing API schemas, database schemas, or inter-service contracts.
- Defining failure modes, retry rules, idempotency keys, and transaction boundaries.

### When NOT to Activate
- Brainstorming broad alternatives from scratch $\rightarrow$ `nexload-reasoning-ideation`.
- Comparing and choosing between two viable architecture proposals $\rightarrow$ `nexload-reasoning-evaluation`.
- Investigating runtime crashes or bugs $\rightarrow$ `nexload-reasoning-investigation`.
- Writing or refactoring implementation code $\rightarrow$ `nexload-reasoning-execution`.

---

## Design State Machine

```text
       [SELECTED CONCEPT / DIRECTION]
                      │
                      ▼
            1. AUDIT EXISTING SEAMS
     (Inspect current repo architecture & conventions)
                      │
                      ▼
         2. ESTABLISH BOUNDARIES & SEAMS
     (Define Bounded Contexts & Deep Modules)
                      │
                      ▼
          3. ALLOCATE SSOT & STATE
     (Single Source of Truth, Lifecycles, Invalidation)
                      │
                      ▼
          4. DRAFT INTERFACE CONTRACTS
     (Public types, caller ergonomics, data flow)
                      │
                      ▼
        5. MODEL FAILURE PATHS & EDGES
     (Timeouts, retries, idempotency, rollbacks)
                      │
                      ▼
        6. VERIFY MINIMAL SUFFICIENCY
     (Nearest Credible Extension - Does it pay rent?)
                      │
                      ▼
            7. COMPOSE SPECIFICATION
         (Coherent Design Specification)
                      │
                      ▼
           8. HANDOFF TO EVALUATION
                 (or Execution)
```

### 1. Audit Existing Seams
Inspect codebase dependencies, framework patterns (e.g. Next.js server actions, Payload collections), and repository ADRs. Ensure the design works with the existing grain of the system rather than imposing alien patterns.

### 2. Establish Bounded Contexts & Seams
Apply [Architectural Boundaries](references/architectural-boundaries.md). Group related capabilities into deep modules:
- **Deep Modules:** Simple public interface concealing substantial internal complexity.
- **Seams:** Clear boundaries where modules can be decoupled, tested, or swapped without caller churn.

### 3. Allocate Single Source of Truth (SSOT)
Apply [State Ownership](references/state-ownership.md) rules to answer:
- Who is the authoritative owner of each piece of data?
- Is derived data calculated on-demand or cached? If cached, what is the exact invalidation mechanism?
- Eliminate dual-authority anti-patterns (two stores claiming truth for the same state).

### 4. Draft Interface Contracts
Design interfaces from the caller's perspective:
- Strong typing with runtime boundary validation (e.g., Zod schemas at ingress).
- Minimal public surface: expose only what consumers strictly require.

### 5. Model Failure Path Semantics
Apply [Failure Path Modeling](references/failure-path-modeling.md):
- Happy paths are insufficient. Detail what happens when external dependencies time out, network partitions occur, or writes fail.
- Define idempotency requirements, retry limits, backoff strategies, and compensation/rollback actions.

### 6. Nearest Credible Extension Test
Verify that the design is not over-engineered:
- Does this design solve today's need cleanly?
- Does it accommodate the nearest credible extension without complete rewrite?
- Did we avoid building generic plugin systems or speculative distributed layers?

---

## Output Artifact: Coherent Design Specification

```markdown
# Coherent Design Specification: <System / Feature Name>

## 1. System Topology & Bounded Contexts
- **Module Architecture:** <Diagram or text layout of components and seams>
- **Deep Interfaces:** <Public contracts and API signatures>

## 2. State Ownership & Single Source of Truth (SSOT)
- **Authoritative Stores:** <Which database/table owns each entity>
- **Derived State & Cache Invalidation:** <TTL, event-based, or on-demand>
- **State Lifecycle:** <Creation, mutation, transition, and teardown>

## 3. Failure Paths & Resilience Semantics
- **Timeout & Retry Policy:** <Specific thresholds and backoff strategy>
- **Idempotency Strategy:** <Header, idempotency key, or unique constraint>
- **Compensation & Rollback:** <Handling partial execution failures>

## 4. Nearest Credible Extension (Anti-Astronautics Audit)
- **Immediate Requirement Solved:** <Direct capability delivered>
- **Nearest Extension Supported:** <Next logical capability accommodated>
- **Speculative Complexity Rejected:** <Layers/features deliberately omitted>
```

---

## Sparse Pointer Handoff

```text
[NEXLOAD HANDOFF]
From: nexload-reasoning-design
To: nexload-reasoning-evaluation (or nexload-reasoning-execution)
Context Pointer: <Path to Coherent Design Specification>
Established Facts:
- <Specified architecture topology, SSOT allocation, and interface contracts>
Hard Constraints:
- <State invariants and failure path requirements>
Settled Decisions:
- <Bounded context seams and module ownership>
Next Cognitive Objective:
- <Stress-test feasibility and reversibility OR proceed to execution planning>
[END HANDOFF]
```

---

## References

- [architectural-boundaries.md](references/architectural-boundaries.md) — Designing deep modules, clear seams, and minimal public interfaces.
- [state-ownership.md](references/state-ownership.md) — Single Source of Truth (SSOT) allocation, lifecycle ownership, and cache invalidation.
- [failure-path-modeling.md](references/failure-path-modeling.md) — Rigorous specification of timeouts, retries, idempotency, and partial failure modes.
