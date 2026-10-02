# Failure Recovery Router: Diagnosing Failure Origins

This reference establishes the taxonomy and re-routing logic used when an execution step fails or an unexpected blocker occurs during delivery.

---

## 1. The Principle of Earliest Invalid State

When an implementation step fails, the worst response is to blindly patch the surface error. The agent must diagnose **at which cognitive layer the breakdown originated**:

```text
       [EXECUTION FAILURE / BLOCKER]
                     │
                     ▼
       Where did the invalid assumption originate?
                     │
       ┌─────────────┼─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼             ▼
  Local Code    Plan Sequence  Architecture    Decision      Intent
    Defect         Defect         Defect        Defect       Defect
       │             │             │             │             │
    STAY IN       STAY IN       ROUTE TO      ROUTE TO      ROUTE TO
   Execution     Execution       Design      Evaluation    Discovery
  (Fix typo)    (Re-order)     (Redesign)     (Re-choose)   (Reframe)
```

---

## 2. Failure Classification Taxonomy

### Tier 1: Local Code Defect (Stay in Execution)
- *Signals:* Typo, syntax error, missing import, off-by-one index, minor type mismatch.
- *Action:* Fix the code locally and re-run verification. Do not escalate to other specialists.

### Tier 2: Plan Sequence Defect (Stay in Execution)
- *Signals:* Test fails because database seed did not run first; migration fails because parent table doesn't exist yet.
- *Action:* Re-order the execution phases and update prerequisites.

### Tier 3: Architectural Boundary Defect (Route to Design)
- *Signals:* Module A cannot perform its job without reaching deep into Module B's internal private state; circular dependency arises; single source of truth is violated.
- *Action:* Issue a `[NEXLOAD HANDOFF]` to `nexload-reasoning-design` to redefine the boundary seam.

### Tier 4: Decision Invalidation (Route to Evaluation)
- *Signals:* Selected library turns out to be incompatible with Node 22; external API requires enterprise license; performance is 100x slower than benchmark.
- *Action:* Issue a `[NEXLOAD HANDOFF]` to `nexload-reasoning-evaluation` to reconsider alternative options.

### Tier 5: Intent / Requirement Defect (Route to Discovery)
- *Signals:* Implemented feature violates an unstated business workflow; customer rejects the core interaction model.
- *Action:* Issue a `[NEXLOAD HANDOFF]` to `nexload-reasoning-discovery` to reframe the problem space.

### Tier 6: Environmental / Causal Anomaly (Route to Investigation)
- *Signals:* Process crashes with SIGSEGV or OOM; unexpected network packet drops; intermittent flaky behavior.
- *Action:* Issue a `[NEXLOAD HANDOFF]` to `nexload-reasoning-investigation` to locate the root cause.
