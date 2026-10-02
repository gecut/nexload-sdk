# Concept Fan & Abstraction Laddering

The Concept Fan is a structured divergent thinking method adapted from Edward de Bono. It systematically moves between abstraction levels to avoid getting trapped in local solution minima.

---

## 1. The 3-Tier Fan Structure

```text
[LEVEL 1: OBJECTIVE / GOAL]
"How do we prevent API overload during inventory flash sales?"
                      │
                      ▼
[LEVEL 2: BROAD CONCEPTS (Directions)]
┌─────────────────────┼──────────────────────┬─────────────────────┐
│ Concept A:          │ Concept B:           │ Concept C:          │
│ Shape / Smooth      │ Offload to Edge      │ Decouple & Queue    │
│ the Incoming Traffic│ Before API           │ Processing          │
└──────────┬──────────┴──────────┬───────────┴──────────┬──────────┘
           │                     │                      │
           ▼                     ▼                      ▼
[LEVEL 3: CONCRETE MECHANISMS]
• Token bucket limiter  • Cloudflare Waiting    • In-memory BullMQ
• Exponential backoff     Room                  • Redis stream worker
• Adaptive jitter       • Static edge snapshot  • Event bridge buffer
```

---

## 2. Abstraction Laddering

When an agent is stuck on a difficult technical problem:

### Moving Up the Ladder (Why?)
Ask: *"Why are we doing this? What is the broader purpose?"*
- *Problem:* "How do we write a faster SQL query to calculate user discount tiers on every page load?"
- *Move Up:* Why calculate it on every page load?
- *Higher Purpose:* "Ensure users see their correct price at checkout."
- *Unlocked Mechanism:* Pre-calculate discount tiers during login or nightly sync, storing a static scalar on the session token.

### Moving Down the Ladder (How?)
Ask: *"How else could this broad principle be achieved mechanically?"*
- *Concept:* "Decouple processing from the HTTP request."
- *Move Down Mechanisms:*
  1. Transactional Outbox pattern with background polling.
  2. In-process asynchronous task queue (`p-queue` in memory).
  3. Ephemeral serverless function invocation via webhook.

---

## 3. Laddering Checklist

1. Identify the anchor problem.
2. Step up one level to state the general category of solution.
3. Branch out to at least two sibling categories.
4. Step down to generate concrete, implementable mechanisms for each category.
