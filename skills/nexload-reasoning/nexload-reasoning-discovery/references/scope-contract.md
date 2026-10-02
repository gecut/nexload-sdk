# Scope Contract: Boundaries & Preserved Systems

This reference governs how `nexload-reasoning-discovery` locks scope boundaries to prevent scope creep, clarify non-goals, and protect existing system contracts.

---

## 1. The Tri-Partite Scope Model

Every scope contract defines three mutually exclusive domains:

```text
┌──────────────────────────────────────────────────────────────────┐
│                          PROJECT SCOPE                           │
├────────────────────┬───────────────────────┬─────────────────────┤
│      IN-SCOPE      │       OUT-SCOPE       │    MUST-PRESERVE    │
│  (Delivered Now)   │   (Explicit Non-Goals)│ (Existing Contracts)│
├────────────────────┼───────────────────────┼─────────────────────┤
│ • Core job         │ • Speculative items   │ • Public API schemas│
│ • Defined endpoints│ • Future abstractions │ • DB record layout  │
│ • Tests & contracts│ • Unrequested UI      │ • Auth & security   │
└────────────────────┴───────────────────────┴─────────────────────┘
```

---

## 2. Defining IN-Scope Deliverables

IN-scope items must be concrete, testable capabilities that directly satisfy the framed intent:
- State the exact behavior changes.
- Identify the modules and layers affected.
- Define what constitutes minimum sufficient completion.

*Bad:* "Improve the checkout experience."  
*Good:* "Validate inventory reservations prior to payment processing; return 409 Conflict with item SKU when unavailable."

---

## 3. Defining OUT-Scope (Explicit Non-Goals)

Non-goals are as vital as goals. They explicitly protect the engineering budget from creep:
- List related features that might be tempting to build but are not required for this milestone.
- List speculative optimizations (e.g., distributed caching, multi-region replication).
- Explain briefly why each is excluded (e.g., "Deferred to v2", "Not bottlenecked currently").

*Example:*  
- "OUT-SCOPE: Bulk CSV export of inventory reservations (deferred until single-order reservation stabilizes)."
- "OUT-SCOPE: Real-time WebSocket notifications to the admin dashboard (polling interval of 30s is acceptable)."

---

## 4. Defining MUST-PRESERVE Invariants

Existing production contracts must be documented so downstream design and execution do not break them:
- **Public API contracts:** Existing endpoints, parameters, and response schemas.
- **Database integrity:** Table schemas, foreign key constraints, migration rollback paths.
- **Security & Permissions:** Existing role-based access control (RBAC) rules.
- **Performance envelopes:** P99 latency guarantees, memory limits.

---

## 5. Scope Creep Detection Heuristic

During downstream design or execution, any proposal that introduces:
1. A new external service or dependency,
2. An additional state machine or persistence table not in IN-scope, or
3. A breaking change to a MUST-PRESERVE contract,

**is classified as a Scope Violation.** Execution must halt and route back to Discovery or Evaluation for explicit re-scoping.
