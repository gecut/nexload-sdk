# Evidence Audit & Grounding Discipline

This reference establishes the epistemic grading system used to audit facts, logs, and claims before committing to an investigation conclusion.

---

## 1. The Epistemic Evidence Hierarchy

When investigating bugs, outages, or technical disputes, treat information according to strict hierarchy:

$$\text{Tier 1: Runtime Observation} > \text{Tier 2: Code/Config} > \text{Tier 3: Official Docs} > \text{Tier 4: Project Docs} > \text{Tier 5: Inference} > \text{Tier 6: Assumption}$$

```text
Tier 1: Runtime Observation
  • Kernel dmesg, strace, gdb output
  • Live stdout/stderr with exact timestamps
  • Direct curl/HTTP responses with headers
  • Reproducible automated test results

Tier 2: Code & Configuration
  • Current committed source code (`git status` clean)
  • Active package.json, tsconfig.json, docker-compose.yml
  • Environment variable exports

Tier 3: Official Documentation
  • Upstream library docs matching the installed version
  • Language RFCs, Node.js API docs, Postgres official manuals

Tier 4: Project Documentation
  • Local README files, inline comments, ADRs (may be outdated)

Tier 5: Inference
  • Logical deduction based on Tier 1–4 evidence ("Because X happened at T1 and Y at T2, X likely triggered Y")

Tier 6: Assumption / Hearsay
  • "Someone told me Redis was fast", "The blog said this library supports Next 15"
```

---

## 2. Epistemic Tagging Protocol

Every statement in an investigation report must carry its epistemic grounding tag if it is not an obvious verified fact:

- `[FACT:RUNTIME]`: Directly observed in executing system.
- `[FACT:SOURCE]`: Directly verified in repository code or configuration.
- `[INFERENCE]`: Deductive conclusion drawn from verified facts.
- `[ASSUMPTION]`: Unverified belief or stakeholder claim.
- `[UNKNOWN]`: Unmeasured parameter requiring measurement before conclusion.

---

## 3. Detecting Pseudo-Evidence

Common pitfalls that mimic genuine evidence:

### A. The "Version Drift" Illusion
- *Trap:* Reading documentation for `v3.0.0` when `package.json` installs `v2.4.1`.
- *Audit Rule:* Always verify installed package version via `pnpm list <package>` or `node_modules/<pkg>/package.json` before relying on API documentation.

### B. The "Outdated Comment" Trap
- *Trap:* Believing an inline comment that says `// This method is thread-safe`.
- *Audit Rule:* Code logic and locks are Tier 2 evidence; comments are Tier 4 and frequently rot.

### C. The "Stale Cache / Build" Mirage
- *Trap:* Investigating a bug in code that hasn't been rebuilt, running against a cached `dist/` or Docker layer.
- *Audit Rule:* Confirm build freshness. Clean build artifacts (`rm -rf dist`) before evaluating runtime discrepancies.
