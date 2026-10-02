# Question Gate: Gating Inquiry & Eliminating Interrogation

This reference defines the decision logic used by `nexload-reasoning-discovery` to avoid unnecessary user interrogation, eliminate curiosity questions, and provide safe autonomous defaults.

---

## 1. The Question Gate Principle

> **Every question posed to the user consumes user attention, slows momentum, and risks exposing agent incompetence if the answer was already present in the workspace.**

An agent must ask a question **only** when:
1. The information cannot be obtained through inspection of files, git history, or environment, AND
2. The question represents a genuine business, product, or legal decision owned by the user, AND
3. The answer will materially alter architecture, scope, security, or data integrity.

---

## 2. Gating Decision Logic

```text
                  [POTENTIAL QUESTION]
                            │
                            ▼
           1. Can it be found in the repo?
              (package.json, code, env, docs)
                    /              \
                 YES                NO
                 /                    \
     [DO NOT ASK: INSPECT]             ▼
                            2. Is it a business/owner decision?
                               (pricing, legal, core product)
                                     /             \
                                  YES               NO
                                  /                   \
                                 │       [DO NOT ASK: USE SAFE DEFAULT]
                                 ▼
                    3. Does it materially alter
                       architecture or scope?
                             /          \
                          YES            NO
                          /                \
                    [ASK USER]       [USE SAFE DEFAULT]
```

---

## 3. Dissecting Question Types

### Type A: "Curiosity / Detail" Questions (ELIMINATE)
- *Example:* "What color should the error badge be?" or "Should the retry delay be 200ms or 300ms?"
- *Verdict:* **Never ask.** Choose standard project convention or safe reversible default (e.g., standard red badge, 250ms exponential backoff).

### Type B: "Already Answered" Questions (ELIMINATE)
- *Example:* "Which database library are you using?" or "What version of Node are you running?"
- *Verdict:* **Never ask.** Read `package.json`, lockfiles, or `.nvmrc`.

### Type C: "Engineering Detail" Questions (ELIMINATE)
- *Example:* "Should we use an enum or a union type for order status?"
- *Verdict:* **Never ask.** Engineering details are owned by the agent's technical design; pick the pattern matching existing repository style.

### Type D: "Material Owner Decision" Questions (PERMITTED)
- *Example:* "Should accounts with unpaid invoices be blocked immediately from reading data, or granted a 3-day grace period?"
- *Verdict:* **Permitted.** This is a commercial/business rule that software engineers cannot invent unilaterally.

---

## 4. Operational Gating Rules

1. **Max 3 Questions:** Never present more than 3 questions in a single interaction.
2. **Always Provide Recommended Defaults:** When asking a permitted question, always formulate it with a recommended default:
   - *Good:* "For order cancellation: should we issue an immediate refund to the payment card, or store credit? *(Default recommendation: store credit, matching current policy)*"
3. **Log Assumptions Explicitly:** When adopting autonomous defaults, document them in the Problem Framing Contract under `Technical Defaults Adopted`.
