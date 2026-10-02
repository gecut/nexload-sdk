---
name: nexload-reasoning-discovery
description: "Specialist for intent extraction, problem space framing, scope boundary definition, and question gating. Use when requests contain ambiguous business goals, stakeholder solutions disguised as technical requirements, greenfield initiatives, or unstated boundary constraints. Do not use for debugging known runtime crashes, evaluating pre-existing architecture options, or implementing settled plans."
---

# Nexload Reasoning: Discovery

Specialist engine for uncovering desired reality: extracting intent, separating requirements from solution hypotheses, mapping hard constraints, locking scope boundaries, and protecting the user from unnecessary interrogation.

## The Inviolable Constitution

Every discovery pass operates under these binding invariants:

1. **Evidence Hierarchy (Grounding Gate):**
   $$\text{Runtime Observation} > \text{Code/Config} > \text{Official Docs} > \text{Project Docs} > \text{Inference} > \text{Assumption}$$
   Label unverified claims explicitly as `[ASSUMPTION]` or `[UNKNOWN]`.
2. **Inspect Before Ask (Question Gate):**
   If an answer can be found in codebase files, package manifests, git logs, or environment configs: **DO NOT ASK THE USER**. Inspect first.
3. **Problem Space Framing:**
   A proposed solution (e.g., "Add Redis", "Create GraphQL endpoint") is never a requirement. It is an implementation hypothesis. Frame the underlying job to be done first.
4. **Separation of Divergence and Convergence:**
   Discovery frames the problem space; it does not generate or prune technical solutions.
5. **Complexity Must Pay Rent:**
   Question requirements that introduce architectural sprawl without clear business justification.
6. **Preservation of Settled Decisions:**
   Existing approved contracts and immutable requirements must not be reopened during discovery.
7. **Claim-Matched Verification:**
   Validate problem framing against existing documentation and system realities before concluding.
8. **Dynamic Reasoning Budget:**
   Stop questioning as soon as core intent, hard constraints, and scope boundaries are established.

---

## Trigger Boundary

### When to Activate
- Feature requests framed as implementation solutions without context (e.g., "We need Kafka").
- Ambiguous or conflicting user requirements (e.g., "Make the reporting dashboard real-time and lightweight").
- High-stakes initiative where building the wrong feature would waste significant engineering effort.
- Missing boundary specifications: unknown edge cases, non-goals, or preserved legacy systems.

### When NOT to Activate
- Reproducing or diagnosing a known bug or error trace $\rightarrow$ `nexload-reasoning-investigation`.
- Brainstorming mechanisms for an already clearly framed problem $\rightarrow$ `nexload-reasoning-ideation`.
- Comparing well-defined architectural alternatives $\rightarrow$ `nexload-reasoning-evaluation`.
- Routine coding tasks under an approved spec $\rightarrow$ `nexload-reasoning-execution`.

---

## Discovery State Machine

```text
       [RAW USER REQUEST / GOAL]
                   │
                   ▼
       1. INSPECT LOCAL CONTEXT
  (Read repo configs, schemas, READMEs)
                   │
                   ▼
     2. EXTRACT INTENT (JTBD)
  (Uncover root job behind solution words)
                   │
                   ▼
     3. CLASSIFY CONSTRAINTS
  (Hard constraints vs. Soft preferences)
                   │
                   ▼
       4. BOUND THE SCOPE
  (IN-Scope | OUT-Scope | MUST-PRESERVE)
                   │
                   ▼
      5. EXECUTE QUESTION GATE
  (Can we default? Is it decision-changing?)
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
Questions Remain        Scope Locked
 (Ask User $\le 3$)            │
                               ▼
                   6. GENERATE ARTIFACT
             (Problem Framing Contract)
                               │
                               ▼
                   7. HANDOFF TO NEXT PHASE
              (Ideation | Design | Evaluation)
```

### 1. Inspect Local Context
Before asking any question, search the codebase, package manifests, database models, and existing ADRs. Identify what constraints are already locked in code.

### 2. Extract Intent (Jobs-to-be-Done)
Translate "what the user asked for" into "what progress the user needs to achieve". Use the [Problem Framing Canvas](references/problem-framing-canvas.md) to strip implementation bias.
- *Asked:* "We need a WebSocket server for live updates."
- *Root Job:* "Users need to know when another agent modifies an order within 5 seconds without spamming the API."

### 3. Classify Constraints
Sort all parameters into two categories:
- **Hard Constraints:** Non-negotiable technical, regulatory, or operational boundaries (e.g., "Must run on Linux without root", "Zero external third-party SaaS for data storage").
- **Soft Preferences:** Desirable attributes with trade-off flexibility (e.g., "Prefer TypeScript", "Keep bundle under 50kB").

### 4. Bound the Scope
Establish strict boundaries following the [Scope Contract](references/scope-contract.md):
- **IN-Scope:** The explicit atomic capabilities required for this objective.
- **OUT-Scope:** Explicit non-goals deferred to future iterations.
- **MUST-PRESERVE:** Existing APIs, interfaces, database records, and workflows that must remain unbroken.

### 5. Execute Question Gate
Apply the [Question Gate](references/question-gate.md) filter before asking anything:
1. *Is the information discoverable via repository tools?* If yes, inspect; do not ask.
2. *Is this a business/owner decision or an engineering detail?* If an engineering detail, apply a safe reversible default; do not ask.
3. *Does the answer materially change the architecture or scope?* If no, proceed with defaults.
4. *Maximum threshold:* Never present more than 3 high-leverage questions at a time.

---

## Output Artifact: Problem Framing Contract

Discovery produces a concise, structured Problem Framing Contract:

```markdown
# Problem Framing Contract: <Feature / Initiative Name>

## 1. Core Intent & Jobs to Be Done
- **User/System Job:** <What progress is being achieved>
- **Underlying Problem:** <The actual friction or limitation being removed>

## 2. Constraints Topology
- **Hard Constraints:** <Non-negotiable invariants>
- **Soft Preferences:** <Negotiable optimization dimensions>

## 3. Scope Boundaries
- **IN-Scope:** <Explicitly included deliverables>
- **OUT-Scope (Non-Goals):** <Deliberately deferred or excluded items>
- **MUST-PRESERVE:** <Existing contracts, schemas, or behaviors that must not break>

## 4. Decision Ownership & Defaults
- **Business/Owner Decisions Needed:** <Only critical unresolved business rules>
- **Technical Defaults Adopted:** <Reversible technical assumptions made autonomously>
```

---

## Sparse Pointer Handoff

```text
[NEXLOAD HANDOFF]
From: nexload-reasoning-discovery
To: nexload-reasoning-ideation (or nexload-reasoning-design)
Context Pointer: <Path to Problem Framing Contract or Issue>
Established Facts:
- <Confirmed user intent and job-to-be-done>
Hard Constraints:
- <All non-negotiable boundaries>
Settled Decisions:
- <Locked scope boundaries and non-goals>
Next Cognitive Objective:
- <Explore mechanism alternatives OR synthesize architecture model>
[END HANDOFF]
```

---

## References

- [problem-framing-canvas.md](references/problem-framing-canvas.md) — Deep-dive into problem space separation and intent extraction.
- [question-gate.md](references/question-gate.md) — Rigorous gating algorithm to prevent unnecessary user interrogation.
- [scope-contract.md](references/scope-contract.md) — Definitive format and rules for IN, OUT, and MUST-PRESERVE boundaries.
