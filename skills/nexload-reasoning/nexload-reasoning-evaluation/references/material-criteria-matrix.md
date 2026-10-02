# Material Criteria Matrix: Anti-Scoring Discipline

This reference establishes how `nexload-reasoning-evaluation` compares options rigorously using qualitative and empirical criteria without falling into the trap of pseudo-mathematical scoring theater.

---

## 1. The Fallacy of Scoring Theater

A frequent anti-pattern in technical evaluations is assigning arbitrary 1–10 scores and weights to qualitative attributes:
- *Trap:* "Option A scores 8/10 for developer ergonomics and 7/10 for maintainability, giving a weighted score of 7.4."
- *Reality:* The numbers are fabricated. They give an illusion of scientific precision while masking personal bias and ignoring hard constraints.

> **Evaluation must rely on material, observable differences and strict Pareto dominance, not arithmetic illusions.**

---

## 2. Pareto Pruning (Elimination of Dominated Options)

Before building any comparison table, prune dominated candidates:

$$\text{Option } B \text{ is dominated by } A \iff (\forall c \in \text{Criteria}, A \ge B) \land (\exists c \in \text{Criteria}, A > B)$$

If Option A is simpler, has zero new dependencies, has lower latency, and Option B offers no tangible advantage other than "hypothetical flexibility", **Option B is pruned immediately**.

---

## 3. The 5 Material Evaluation Dimensions

When comparing viable options, evaluate only dimensions that materially affect production outcomes:

### 1. Operational & Maintenance Burden
- Does this require deploying and monitoring a new daemon or stateful service?
- How does it fail? Can our current telemetry and on-call team diagnose it easily?

### 2. Runtime & Resource Footprint
- Latency added to critical path (p50, p99).
- Memory overhead, socket consumption, cold-start latency.

### 3. Complexity & Architectural Debt
- How many new abstractions or concepts does a developer need to learn?
- Does it work with the grain of our framework (e.g., standard Next.js / Node patterns) or fight it?

### 4. Blast Radius & Security Exposure
- What happens when this component is compromised or crashes?
- Does it expose new ingress surfaces or require elevated privileges?

### 5. Exit Cost & Reversibility
- If this dependency is abandoned or proves unsuitable in 12 months, how expensive is migration away?

---

## 4. The Decisive Delta

In every evaluation brief, explicitly isolate the **Decisive Delta**:
- The single material factor that makes the winning candidate the optimal default choice.
- *Example:* "While Option B has 3ms lower latency, Option A requires zero infrastructure changes and uses our existing verified Postgres connection pool. In a system handling 20 QPS, 3ms is immaterial, whereas managing a new Redis cluster introduces substantial operational debt. Therefore, Option A is recommended."
