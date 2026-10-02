# Reversibility Ladder & Reversal Triggers

This reference details how decision rigor is scaled based on reversibility (Type 1 vs Type 2 decisions) and how explicit reversal triggers are established to keep architectures adaptable.

---

## 1. The Reversibility Ladder

Not all decisions deserve equal cognitive effort. Reversibility governs rigor:

```text
┌─────────────────────────────────────────────────────────────┐
│                    THE REVERSIBILITY LADDER                 │
├─────────────────┬───────────────────────┬───────────────────┤
│    RUNG 1       │        RUNG 2         │      RUNG 3       │
│  (Two-Way Door) │ (Bounded Reversibility│   (One-Way Door)  │
├─────────────────┼───────────────────────┼───────────────────┤
│ • Local helper  │ • Internal library    │ • Public API      │
│ • CSS layout    │ • Worker scheduling   │ • DB schema split │
│ • Private type  │ • In-memory cache     │ • Auth provider   │
├─────────────────┼───────────────────────┼───────────────────┤
│ Speed > Rigor   │ Moderate audit        │ Maximum rigor     │
│ Decide in mins  │ Verify compatibility  │ Full pre-mortem   │
└─────────────────┴───────────────────────┴───────────────────┘
```

---

## 2. Rung 1: Two-Way Doors (Fast Reversibility)
- Decisions that can be unwound in less than a day by reverting a commit.
- Zero persisted state migration or external consumer disruption.
- *Rule:* Do not spend hours analyzing trade-offs. Pick the simplest convention, implement it, and verify empirically.

## 3. Rung 2: Bounded Reversibility
- Decisions that affect an internal service or package.
- Reversal requires a day or two of refactoring, but no database schema rollback or customer downtime.
- *Rule:* Perform standard Pareto pruning and verify performance footprint.

## 4. Rung 3: One-Way Doors (Irreversible Commitments)
- Decisions that modify public REST/GraphQL APIs consumed by external clients.
- Irreversible database migrations (e.g. dropping columns, transforming production financial ledgers).
- Selecting vendor backends that require contract commitments or proprietary data locking.
- *Rule:* Full pre-mortem, blast-radius isolation, and explicit reversal triggers required.

---

## 5. Establishing Reversal Triggers

A strong architectural decision is not an eternal dogma. It is an agreement valid under stated conditions:

> **Every ADR must state the explicit empirical conditions that would trigger a re-evaluation of the decision.**

### Examples of Reversal Triggers:
1. **Load Trigger:** "If asynchronous processing queue latency exceeds 5 seconds for more than 1% of jobs, re-evaluate moving from Postgres queue to Redis BullMQ."
2. **Maintenance Trigger:** "If upstream library X does not publish a security patch within 30 days of a CVE disclosure, migrate to native web crypto."
3. **Cost Trigger:** "If third-party API costs exceed $500/month, execute the migration to self-hosted OCR."
