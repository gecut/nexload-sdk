---
name: nexload-reasoning-ideation
description: "Specialist for divergent mechanism generation, alternative exploration, conceptual diversity, and escaping mental fixation. Use when exploring novel technical approaches, breaking out of dominant architectural patterns, brainstorming product mechanisms, or discovering non-obvious solutions. Do not use for evaluating pre-existing options, selecting final recommendations, or executing settled designs."
---

# Nexload Reasoning: Ideation

The divergent creative engine of the Nexload 6+1 ecosystem. Its sole responsibility is to expand the solution space and generate materially distinct mechanisms before judgment and feasibility constraints prematurely collapse possibilities.

## The Inviolable Constitution

Every ideation pass operates under these binding invariants:

1. **Evidence Hierarchy:**
   Ground ideation in verified constraints from Discovery. Assumptions must be labeled explicitly as `[ASSUMPTION]`.
2. **Inspect Before Ask:**
   Inspect existing repository capabilities and utilities before assuming a mechanism cannot be supported locally.
3. **Problem Space Framing:**
   Divergence must strictly serve the framed user/system objective, not wander into unrelated domains.
4. **Separation of Divergence and Convergence (Divergence Firewall):**
   **ABSOLUTE INVARIANT:** During ideation, concepts MUST NOT be filtered, penalized, or suppressed based on implementation difficulty, code complexity, or development cost. Divergence and convergence never execute in the same cognitive pass.
5. **Complexity Must Pay Rent:**
   Ideate mechanisms that explore subtraction and simplification alongside additive architectural patterns.
6. **Preservation of Settled Decisions:**
   Never reopen settled requirements or non-goals established in Discovery during ideation.
7. **Claim-Matched Verification:**
   Verify that generated concepts represent genuinely distinct mechanisms, not cosmetic variations of a single idea.
8. **Dynamic Reasoning Budget:**
   Stop generating concepts once $\ge 3$ mechanism-distinct approaches have been produced.

---

## Trigger Boundary

### When to Activate
- Framed problem requires novel technical mechanisms or unblocking architectural bottlenecks.
- The team or user is fixated on an obvious, suboptimal solution (e.g., "Just poll the database every second").
- Green-field capability where multiple distinct paradigms exist (e.g., event-driven vs. polling vs. webhooks vs. client-pull).
- Escaping deadlock when conventional solutions fail to meet hard constraints.

### When NOT to Activate
- Choosing between two existing options (Option A vs Option B) $\rightarrow$ `nexload-reasoning-evaluation`.
- Synthesizing detailed interfaces and state ownership for an already chosen concept $\rightarrow$ `nexload-reasoning-design`.
- Investigating the root cause of a bug $\rightarrow$ `nexload-reasoning-investigation`.
- Implementing or executing code $\rightarrow$ `nexload-reasoning-execution`.

---

## Ideation State Machine

```text
       [FRAMED OBJECTIVE & HARD CONSTRAINTS]
                         │
                         ▼
             1. ISOLATE DOMINANT IDEA
     (Identify the obvious/default assumption)
                         │
                         ▼
            2. APPLY DIVERGENCE ENGINE
     (Technique routing: Fan, Inversion, Collision)
                         │
                         ▼
         3. GENERATE MECHANISM VARIANTS
     (Produce $\ge 3$ radically different mechanisms)
                         │
                         ▼
           4. RUN DIVERSITY VERIFICATION
     (Are mechanisms truly distinct or cosmetic?)
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    Cosmetic Diversity          Diverse Mechanisms
   (Re-trigger Inversion)              │
                                       ▼
                           5. COMPOSE CATALOG
                       (Candidate Concept Catalog)
                                       │
                                       ▼
                            6. HANDOFF TO EVALUATION
                                  (or Design)
```

### 1. Isolate the Dominant Idea
Identify the default, conventional, or first-instinct solution (e.g., "Write a cron job that runs every 5 minutes"). Expose its underlying architectural assumptions using the [Divergence Engine](references/divergence-engine.md).

### 2. Route Ideation Techniques
Select the appropriate cognitive technique based on the nature of the blockage:
- *Narrow solution space?* $\rightarrow$ [Concept Fan](references/concept-fan.md) (Goal $\rightarrow$ Concepts $\rightarrow$ Mechanisms).
- *Mental fixation on default pattern?* $\rightarrow$ [Collision & Escape](references/collision-escape.md) (Assumption Inversion).
- *Conventional or repetitive ideas?* $\rightarrow$ Cross-pollination (Principle transfer from operating systems, biology, or distributed consensus).

### 3. Generate $\ge 3$ Mechanism-Distinct Concepts
A difference in language or library name is **cosmetic**, not diverse. True diversity varies across fundamental mechanisms:
- **Locus of Control:** Client-driven vs. Worker-driven vs. Edge-driven vs. Event-driven.
- **Timing:** Synchronous blocking vs. Asynchronous queuing vs. Speculative execution vs. Lazy on-demand.
- **State Topology:** Centralized authoritative vs. Decentralized log vs. Ephemeral derived vs. In-memory relay.
- **Action Type:** Additive (add new service) vs. Subtractive (eliminate intermediate queue).

### 4. Diversity Verification
Verify that at least three concepts cannot be collapsed into the same mechanism:
- If Concept 1 is "Polling with fetch", Concept 2 is "Polling with axios", and Concept 3 is "Polling with SWR", **REJECT AS COSMETIC**.
- Distinct: (1) Long-polling relay, (2) Server-Sent Events push stream, (3) Client-pull with optimistic local cache.

---

## Output Artifact: Candidate Concept Catalog

The output of ideation is strictly unranked, unpruned, and neutral. It contains **no recommendation** (evaluation owns judgment).

```markdown
# Candidate Concept Catalog: <Objective Name>

## 1. Problem Statement & Invariant Anchor
- **Objective:** <Framed user/system goal>
- **Hard Constraints Preserved:** <Non-negotiable boundaries from Discovery>

## 2. Concept 1: <Mechanism Name> (e.g. Asynchronous Worker-Driven)
- **Core Mechanism:** <How the system moves data and control>
- **Key Assumptions:** <What must be true for this to operate>
- **Radical Strength:** <Where this approach excels uniquely>

## 3. Concept 2: <Mechanism Name> (e.g. Reactive Change-Data-Capture)
- **Core Mechanism:** <How the system moves data and control>
- **Key Assumptions:** <What must be true for this to operate>
- **Radical Strength:** <Where this approach excels uniquely>

## 4. Concept 3: <Mechanism Name> (e.g. Subtractive Ephemeral Stream)
- **Core Mechanism:** <How the system moves data and control>
- **Key Assumptions:** <What must be true for this to operate>
- **Radical Strength:** <Where this approach excels uniquely>
```

---

## Sparse Pointer Handoff

```text
[NEXLOAD HANDOFF]
From: nexload-reasoning-ideation
To: nexload-reasoning-evaluation (or nexload-reasoning-design)
Context Pointer: <Path to Candidate Concept Catalog>
Established Facts:
- <Generated mechanism-distinct concepts>
Hard Constraints:
- <Active hard boundaries passed from Discovery>
Settled Decisions:
- <None yet - concepts are intentionally unpruned>
Next Cognitive Objective:
- <Evaluate feasibility, risk, and trade-offs to select preferred direction>
[END HANDOFF]
```

---

## References

- [divergence-engine.md](references/divergence-engine.md) — Tactical divergence methods and enforcement of the divergence firewall.
- [concept-fan.md](references/concept-fan.md) — Systematic abstraction laddering: Goal $\rightarrow$ Broad Concepts $\rightarrow$ Concrete Mechanisms.
- [collision-escape.md](references/collision-escape.md) — Breaking fixation via assumption inversion, random provocation, and cross-domain transfer.
