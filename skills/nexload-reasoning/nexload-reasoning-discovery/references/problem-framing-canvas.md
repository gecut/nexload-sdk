# Problem Framing Canvas

The Problem Framing Canvas translates user prompts, stakeholder demands, and technology-heavy proposals into clean, solution-agnostic problem statements.

---

## 1. Problem Space vs. Solution Space

A common failure in software engineering is confusing the proposed implementation vehicle with the underlying human or system need:

```text
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         SOLUTION SPACE          │       │          PROBLEM SPACE          │
│   (Implementation Vehicles)     │       │    (Underlying Capabilities)    │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ "We need a Redis cluster"       │ ───►  │ Reduce read latency on hot data │
│ "Build a 3D product visualizer" │ ───►  │ Help buyers preview custom kits │
│ "Switch our DB to MongoDB"      │ ───►  │ Support dynamic user attributes │
│ "Rewrite the frontend in Next"  │ ───►  │ Improve initial SEO indexation  │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

Treating the solution space as the requirement restricts architectural divergence, prevents simpler solutions from emerging, and often leads to over-engineering.

---

## 2. Intent Extraction (Jobs-to-be-Done)

To uncover the true job-to-be-done, evaluate the request across three dimensions:

1. **Functional Progress:** What mechanical work or data transformation must occur?
   - *Example:* "Orders must be exported in the format required by the logistics broker."
2. **Operational Constraint:** Under what operational reality must this occur?
   - *Example:* "Must happen within 10 seconds of checkout completion; cannot stall web workers."
3. **Outcome Metric:** How will the business or user verify that the job was completed successfully?
   - *Example:* "Zero manual intervention by support staff during normal checkout flows."

---

## 3. Dissecting Technology-Framed Requests

When a stakeholder or user prompt provides a pre-packaged technology choice, apply the **Deconstruction Protocol**:

1. **Identify the Underlying Mechanism:** What does the requested technology actually do? (e.g., caching, pub/sub, document storage, client-side rendering).
2. **Identify the Pain Point:** What is failing or missing in the current system that led the requester to suggest this tool?
3. **Identify System Invariants:** What parts of the existing stack (e.g., Postgres, Node runtime, SQLite) can already perform this role?
4. **Frame the Hypothesis:** Rephrase the request as:  
   *"We are exploring whether [technology] is the optimal mechanism to solve [underlying pain point] under [constraints]."*

---

## 4. Canvas Template

When documenting intent for complex initiatives, use this concise canvas:

```markdown
### 1. The Trigger
What event, user complaint, or business milestone triggered this initiative?

### 2. The Current State & Friction
What is currently happening, and why is it insufficient or costly?

### 3. The Desired Future State
What must be true once this initiative is successfully executed?

### 4. Non-Negotiable Boundaries
What must NOT happen (e.g., downtime, data loss, security degradation)?
```
