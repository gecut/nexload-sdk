# Collision & Escape: Breaking Fixation

This reference details lateral thinking techniques used to shatter fixation on dominant ideas, invert structural assumptions, and inject provocative collisions into stale architectural problems.

---

## 1. The Dominant Idea Trap

In software design, engineers and agents frequently suffer from **cognitive lock-in**:
- "All state belongs in the database."
- "All background jobs need an external Redis or RabbitMQ cluster."
- "All components must fetch their own data."

When the dominant idea cannot meet hard latency, cost, or operational constraints, ordinary brainstorming stalls. The agent must deliberately escape the dominant frame.

---

## 2. Assumption Inversion (The Reverse Vector)

To execute an Assumption Inversion:
1. List the 3 most basic, "obvious" assumptions of the current architecture.
2. Invert each assumption into its absolute opposite.
3. Ask: *"Under what circumstances would this inverted assumption actually be brilliant?"*

### Example: High-Throughput Audit Logging
- *Assumption:* "Every log entry must be written to disk immediately to prevent data loss."
- *Inversion:* "Zero log entries are written to disk; all logs are kept in memory and discarded."
- *Breakthrough Mechanism:* Keep logs in a circular ring buffer in memory. Flush to durable storage only when an anomaly/error occurs, capturing the preceding 5 minutes of context without disk I/O during healthy operation.

---

## 3. Collision-Zone Thinking (Cross-Domain Transfer)

Collide the target problem with an unrelated domain mechanism to generate non-standard architectures:

| Source Domain | Core Mechanism | Collided Software Application |
|---|---|---|
| **Airport Baggage Handling** | Barcode routing with physical divert tracks | Dynamic payload routing based on lightweight header tags rather than body inspection |
| **Circuit Breakers (Electrical)** | Physical trip upon overcurrent; manual reset | Graceful degradation of third-party API clients under load |
| **Biological Immune System** | Antigen signature matching and memory cells | Automated signature-based rate limiting of abusive IP blocks |
| **Newspaper Printing Press** | Bulk batch production distributed via local trucks | Static site generation (SSG) with localized edge CDN caching |

---

## 4. Subtraction (Via Negativa)

When additive solutions create excessive complexity, force a subtractive pass:
- What happens if we delete this service entirely?
- Can this state be computed dynamically from the existing event log?
- What happens if we stop storing this data and calculate it only on user demand?
