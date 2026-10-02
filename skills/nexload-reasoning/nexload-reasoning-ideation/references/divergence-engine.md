# Divergence Engine & Firewall Discipline

The Divergence Engine governs the generation of diverse mechanisms while maintaining a strict firewall against premature evaluation and feasibility filtering.

---

## 1. The Divergence Firewall

The most frequent defect in automated ideation is **premature convergence**: an agent thinks of a creative approach and immediately suppresses it with:
- "That would require too many dependencies."
- "The refactoring effort is too high."
- "Our existing architecture doesn't support that easily."

```text
┌──────────────────────────────────────────────────────────────┐
│                    THE DIVERGENCE FIREWALL                   │
├──────────────────────────────┬───────────────────────────────┤
│    PERMITTED IN IDEATION     │    PROHIBITED IN IDEATION     │
├──────────────────────────────┼───────────────────────────────┤
│ • Radical mechanism variety  │ • Feasibility ranking         │
│ • Subtraction / Inversion    │ • Cost / Effort filtering     │
│ • Cross-domain analogies     │ • Winner declaration          │
│ • Checking hard constraints  │ • "Option A is clearly best"  │
└──────────────────────────────┴───────────────────────────────┘
```

The Divergence Firewall mandates that **feasibility, implementation burden, and cost trade-offs are strictly deferred to `nexload-reasoning-evaluation`**.

---

## 2. The 4 Mechanism Axes

To guarantee genuine diversity rather than superficial variations, concepts must differ across at least one of these primary axes:

### Axis 1: Control Topology
- **Pull:** Consumer initiates demand when ready.
- **Push:** Producer emits events immediately as they occur.
- **Mediated / Bus:** Third-party broker decouples producer and consumer.
- **Direct Peer-to-Peer:** Immediate point-to-point connection without intermediate brokers.

### Axis 2: State Lifecycle
- **Authoritative Durable:** Stored permanently in primary database.
- **Ephemeral In-Memory:** Kept only during process execution or TTL window.
- **Event Log / Append-Only:** Reconstructed via state projection.
- **Stateless / Derived:** Calculated purely on-demand from inputs.

### Axis 3: Latency & Scheduling
- **Synchronous Blocking:** Caller waits for execution completion.
- **Asynchronous Fire-and-Forget:** Background queue with eventual status check.
- **Optimistic Speculation:** Assume success immediately; compensate on failure.
- **Batch / Periodic Aggregation:** Accumulate changes and process in bulk.

### Axis 4: Solution Vector (Addition vs. Subtraction)
- **Additive:** Introduce a helper cache, broker, or microservice.
- **Subtractive (Via Negativa):** Eliminate an unnecessary step, remove an approval flow, or derive data from existing sources without creating a new table.

---

## 3. Detecting Cosmetic Diversity

Before finalizing a catalog, test whether options are distinct:
- *Test:* If changing Option A into Option B merely requires changing a library import or an interval number (e.g. 5s to 10s), **they are the same mechanism**.
- *Remedy:* Force an assumption inversion or domain shift to produce a genuinely contrasting concept.
