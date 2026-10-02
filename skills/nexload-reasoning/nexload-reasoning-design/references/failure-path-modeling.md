# Failure Path Modeling & Resilience Semantics

This reference provides frameworks for designing systems that fail gracefully, prevent cascading outages, and maintain data consistency during partial outages.

---

## 1. Happy-Path Bias in Architecture

Systems frequently break not because their core logic is flawed, but because edge and failure modes were omitted from the design. A complete design specification must model the unhappy paths:

```text
       [CALLER]
          │
          ▼
    [API GATEWAY] ──(Timeout / Network Error)──► [CIRCUIT BREAKER]
          │                                              │
          ▼                                              ▼
   [PRIMARY WORKER] ──(Unhandled Crash)──► [DEAD LETTER QUEUE / RETRY]
          │                                              │
          ▼                                              ▼
    [PERSISTENCE] ───(Unique Constraint)────► [IDEMPOTENCY HANDLER]
```

---

## 2. The Resilience Triad

### A. Timeouts & Backoff
- Every outbound network call, database query, and external RPC must specify a deterministic timeout.
- Retries must use **exponential backoff with jitter** to avoid the "thundering herd" problem.
- Retries must be bounded (e.g., maximum 3 attempts).

### B. Idempotency Semantics
- Any mutating operation subject to network retries (e.g., payment creation, order dispatch) must support idempotency keys.
- Store the idempotency key and response in a dedicated table or transaction record with unique constraints.
- Duplicate requests with identical keys must return the cached result without re-executing side effects.

### C. Compensation & Rollbacks (Sagas)
- For multi-step workflows that cross database boundaries:
  - Define compensating actions for every forward step (e.g., Step 1: Charge Card $\rightarrow$ Compensation 1: Refund Card).
  - Define dead-letter routing and human alerting when compensation itself fails.

---

## 3. Graceful Degradation Patterns

When an auxiliary dependency fails, design fallback behavior:
- If recommendation engine is down $\rightarrow$ return static top 10 popular products.
- If search cluster is down $\rightarrow$ fallback to simple database `LIKE` query or cached index.
- If notification service is down $\rightarrow$ queue event in transactional outbox table for later delivery.
