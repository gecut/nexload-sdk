# Pre-Mortem Stress Test & Blast Radius Analysis

This reference provides prospective hindsight protocols to expose blind spots, structural fragility, and unhandled failure modes before adopting an architectural direction.

---

## 1. The Pre-Mortem Concept

Adapted from Gary Klein's cognitive decision framework, a pre-mortem assumes that an initiative has already failed:

> *"Imagine we are standing 6 months in the future. We selected this candidate architecture, built it, and deployed it to production. It resulted in a catastrophic failure or had to be rolled back in disgrace. What happened?"*

Shifting the mind from *"What could go wrong?"* to *"It has already failed, explain why"* bypasses optimism bias and social consensus pressure.

---

## 2. The 4 Failure Vectors to Probe

### Vector 1: Operational Drift & Hidden Costs
- What happens when data volume grows by $10\times$?
- Did we introduce a hidden background task that exhausts disk space or table bloat?
- Does this require tribal operational knowledge to maintain during an on-call incident?

### Vector 2: Edge-Case Failure & Partial Outages
- What happens if the third-party provider experiences an 8-minute outage or returns unexpected 429 rate limit errors?
- Does an unexpected network error leave transactions in an orphaned, inconsistent state?

### Vector 3: Ecosystem & Upstream Churn
- Is this library maintained by a solo developer who might abandon it?
- Does it depend on deprecated internal APIs of Node or the framework?

### Vector 4: Developer Friction & Misuse
- How easily can another developer misuse this interface and introduce a security vulnerability or N+1 query?
- Does it require cumbersome boilerplate that tempts developers to bypass safety checks?

---

## 3. Pre-Mortem Output Format

In the evaluation report, document the top vulnerability and its mitigation:

```markdown
### Pre-Mortem Vulnerability & Injected Mitigation
- **Plausible Catastrophe:** Under peak traffic, the connection pool to the new service is exhausted, causing all HTTP workers to stall and trip health checks.
- **Structural Mitigation:** Introduce strict client timeouts (500ms) and an in-memory circuit breaker that sheds load gracefully to cached data before connection exhaustion occurs.
```
