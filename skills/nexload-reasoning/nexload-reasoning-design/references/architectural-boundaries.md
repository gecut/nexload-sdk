# Architectural Boundaries & Deep Modules

This reference guides how `nexload-reasoning-design` structures modules, defines clean seams, and creates deep abstractions that hide operational complexity.

---

## 1. Deep Modules vs. Shallow Modules

A central tenet of robust software architecture (from John Ousterhout's *Philosophy of Software Design*) is that **modules should be deep**:

```text
┌────────────────────────────────────────┐   ┌────────────────────────────────────────┐
│              SHALLOW MODULE            │   │               DEEP MODULE              │
│       (Large Surface, Little Value)    │   │      (Small Surface, High Leverage)    │
├────────────────────────────────────────┤   ├────────────────────────────────────────┤
│ Public Interface:                      │   │ Public Interface:                      │
│ - 20 exported helper functions         │   │ - 2 clean, high-level methods          │
│ - Leaks internal types and ORMs        │   │ - Strict input validation & guarantees │
├────────────────────────────────────────┤   ├────────────────────────────────────────┤
│ Implementation:                        │   │ Implementation:                        │
│ - Trivial pass-through wrappers        │   │ - Complex state machines, retries,     │
│ - High coupling to caller code         │   │   caching, and invariants hidden inside│
└────────────────────────────────────────┘   └────────────────────────────────────────┘
```

When designing boundaries, strive to maximize internal leverage while minimizing the exported interface surface.

---

## 2. Defining Architectural Seams

A **seam** is a place where you can alter system behavior without editing the calling code:
- **Interface Seams:** A TypeScript interface representing external capabilities (e.g., `PaymentGateway`, `StorageClient`).
- **Data Boundary Seams:** Validating ingress data with Zod schemas at API or message consumer boundaries.
- **Dependency Seams:** Wiring dependencies via explicit parameter injection or factory functions rather than hardcoded global singletons.

---

## 3. The Nearest Credible Extension (Anti-Astronautics)

Avoid speculative scalability:
- **Rule of Now + 1:** Design the architecture to cleanly fulfill the confirmed present need, plus the single most likely near-term extension.
- **Rule of Never Now + 10:** Reject dynamic plugin architectures, distributed brokers, or multi-tenant sharding until confirmed metrics demand them.

### Audit Questions:
1. Does this abstraction replace real boilerplate that currently exists in $\ge 3$ places?
2. Does this module boundary isolate a volatile third-party dependency?
3. Could a new developer understand the data flow without reading five layers of wrapper classes?
