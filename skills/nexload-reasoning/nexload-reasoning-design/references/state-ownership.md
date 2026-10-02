# State Ownership & Single Source of Truth (SSOT)

This reference establishes principles for allocating data authority, managing state transitions, and designing cache invalidation topologies.

---

## 1. Single Source of Truth (SSOT) Allocation

Every piece of state in an application must have exactly one authoritative owner. When two systems or tables store the same data, divergence and inconsistency are inevitable.

```text
┌────────────────────────────────────────────────────────┐
│                      STATE TAXONOMY                    │
├────────────────────┬───────────────────┬───────────────┤
│ AUTHORITATIVE STATE│   DERIVED STATE   │EPHEMERAL STATE│
├────────────────────┼───────────────────┼───────────────┤
│ Primary DB tables  │ Read replicas     │ UI input focus│
│ Transaction logs   │ In-memory caches  │ Session token │
│ Identity records   │ Computed rollups  │ WebSocket ping│
└────────────────────┴───────────────────┴───────────────┘
```

### The Dual-Authority Smells
- *Smell 1:* User permissions stored in both a JWT claim and a Redis cache, with no synchronization webhook.
- *Smell 2:* Order total persisted in the database while line-item prices can be independently updated.
- *Correction:* Store raw line items authoritatively; calculate order total on write or as a verified transaction aggregate.

---

## 2. Invalidation Topologies

Derived and cached state requires an explicit invalidation mechanism:

1. **Write-Through / Synchronous Invalidation:** Invalidate or update the cache immediately upon mutating authoritative state. Preferred for high-consistency requirements.
2. **Time-To-Live (TTL) Decay:** Allow stale reads for bounded windows (e.g., 60 seconds). Only acceptable for non-critical aggregate data.
3. **Event-Driven / CDC:** Invalidate caches via database change-data-capture or domain event emission. Useful for decoupled read-heavy architectures.

---

## 3. Concurrency & Mutation Authority

State ownership dictates mutation rights:
- Only the owning module or service is permitted to execute write mutations on authoritative tables.
- All other modules must interact via public domain commands or service calls.
- Enforce optimistic concurrency control (via `version` integer or `updatedAt` timestamps) on high-contention records.
