---
name: nexload-reasoning-investigation
description: "Specialist for empirical truth-finding, root-cause diagnosis, causal modeling, hypothesis discrimination, and systematic debugging. Use when encountering system crashes, intermittent errors, performance regressions, contradictory telemetry, or unverified claims. Do not use for brainstorming feature ideas, designing clean-slate architectures, or implementing planned roadmap items."
---

# Nexload Reasoning: Investigation

The causal truth-finding engine of the Nexload 6+1 ecosystem. Its mission is to discover what is actually true or happening in reality, explain why anomalies occur, formulate competing falsifiable hypotheses, execute high-signal discriminator tests, and eliminate surface symptom patching.

## The Inviolable Constitution

Every investigation pass operates under these binding invariants:

1. **Evidence Hierarchy (Grounding Gate):**
   $$\text{Runtime Observation} > \text{Code/Config} > \text{Official Docs} > \text{Project Docs} > \text{Inference} > \text{Assumption}$$
   Observations must be directly verifiable. Tag unverified claims explicitly as `[ASSUMPTION]` or `[UNKNOWN]`.
2. **Inspect Before Ask:**
   Never ask the user for stack traces, environment variables, logs, or system versions if they are accessible via available tools or workspace files.
3. **Problem Space Framing:**
   Never confuse the symptom ("Request times out") with the cause ("Database lock contention on table X").
4. **Separation of Divergence and Convergence:**
   During hypothesis generation, do not dismiss improbable mechanisms prematurely. Formulate competing explanations before testing.
5. **Complexity Must Pay Rent:**
   A causal explanation that requires five coincidences is rejected in favor of the simplest explanation matching empirical evidence (Occam's razor).
6. **Preservation of Settled Decisions:**
   Past decisions are not blamed for incidents without direct, reproducible causal evidence.
7. **Claim-Matched Verification:**
   "Hypothesis verified" requires an empirical discriminator test that falsified alternative hypotheses. Never declare root cause based on plausibility alone.
8. **Dynamic Reasoning Budget:**
   Stop investigating as soon as causal confidence is sufficient to choose a safe, effective mitigation or permanent fix.

---

## Trigger Boundary

### When to Activate
- Unexpected runtime crashes, panics, or unhandled exceptions.
- Intermittent bugs, race conditions, or memory/CPU leaks.
- Performance regressions (latency spikes, query degradation).
- Conflicting evidence between documentation, code, and observed behavior.
- Failed verification handoffs escalated from `nexload-reasoning-execution`.

### When NOT to Activate
- Generating alternative product features $\rightarrow$ `nexload-reasoning-ideation`.
- Structuring system boundaries or interface contracts $\rightarrow$ `nexload-reasoning-design`.
- Evaluating business or architectural trade-offs $\rightarrow$ `nexload-reasoning-evaluation`.
- Writing or refactoring routine code $\rightarrow$ `nexload-reasoning-execution`.

---

## Investigation State Machine

```text
       [OBSERVED ANOMALY / CRASH / BUG]
                      │
                      ▼
            1. INVENTORY EVIDENCE
       (Logs, stack traces, configs, git diffs)
                      │
                      ▼
           2. REPRODUCE OR ISOLATE
     (Cheapest reproducible feedback loop)
                      │
                      ▼
         3. GENERATE HYPOTHESES
        ($H_1, H_2, \dots, H_n$ competing)
                      │
                      ▼
      4. DESIGN DISCRIMINATOR TESTS
     (Cheapest test that falsifies $\ge 1$ H)
                      │
                      ▼
         5. EXECUTE TEST & UPDATE
      (Eliminate falsified explanations)
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    Uncertainty High       Root Cause Confirmed
  (Refine Hypotheses)            │
                                 ▼
                     6. COMPOSE CAUSAL LOG
                 (Causal Diagnosis & Evidence)
                                 │
                                 ▼
                      7. HANDOFF TO RECOVERY
                 (Execution | Design | Evaluation)
```

### 1. Inventory Evidence
Collect and audit raw facts using the [Evidence Audit](references/evidence-audit.md) protocol. Separate confirmed observations from interpretations:
- *Observation:* `HTTP 502 returned from /api/checkout after exactly 30,000ms.`
- *Interpretation (do not treat as fact yet):* `The upstream payment gateway is timing out.`

### 2. Reproduce or Isolate
Establish the cheapest reproducible check: a minimal unit test, curl command, script invocation, or static code trace. If non-deterministic, isolate the environmental variables (concurrency, data volume, clock drift).

### 3. Generate Competing Hypotheses ($H_1 \dots H_n$)
Formulate at least 2–3 distinct, falsifiable explanations. Never stop at the first plausible guess. Use [Systematic Debugging](references/systematic-debugging.md) to explore:
- Code defect (logic error, type coercion, off-by-one).
- State/concurrency defect (race condition, stale lock, cache invalidation).
- Environment/resource defect (OOM, descriptor leak, network partition, CPU throttling).
- Dependency/version defect (transitive package break, runtime mismatch).

### 4. Design & Execute Discriminator Tests
Apply the [Hypothesis Discriminator](references/hypothesis-discriminator.md) methodology. Identify an observation $E$ where:
$$\text{If } H_1 \text{ is true} \implies E \text{ occurs}; \quad \text{If } H_2 \text{ is true} \implies E \text{ does NOT occur}$$
Run the cheapest discriminator first (log inspection > unit test > reproduction script > full rebuild).

### 5. Confirm Root Cause & Assess Blast Radius
Identify the earliest point of deviation in the causality chain. Distinguish the *trigger* (what initiated it) from the *vulnerability* (why the system failed to handle it).

---

## Output Artifact: Causal Diagnosis & Evidence Log

```markdown
# Causal Diagnosis & Evidence Log: <Issue Title>

## 1. Empirical Observations (Verified Facts)
- **Symptom:** <Exact error, code, metric>
- **Reproduction:** <Command or minimal reproduction sequence>
- **Telemetry:** <Key log lines, stack traces, metrics>

## 2. Hypothesis Evaluation Matrix
| ID | Hypothesis Description | Expected Discriminator | Observed Result | Status |
|---|---|---|---|---|
| H1 | Memory exhaustion (OOM) | Exit code 137 in dmesg | No OOM killer events | REJECTED |
| H2 | Unhandled promise rejection | Process exit without stack | Trace found in stderr | CONFIRMED |

## 3. Confirmed Root Cause
- **Mechanisms:** <Exact sequence of causal events>
- **Earliest Invalid State:** <The point where state first corrupted>
- **Confidence Level:** <High / Medium with evidence justification>

## 4. Recommended Remediation Routing
- **Local Bug Fix:** Route to `nexload-reasoning-execution`.
- **Architectural Seam / Boundary Defect:** Route to `nexload-reasoning-design`.
- **Infrastructure / Library Incompatibility:** Route to `nexload-reasoning-evaluation`.
```

---

## Sparse Pointer Handoff

```text
[NEXLOAD HANDOFF]
From: nexload-reasoning-investigation
To: nexload-reasoning-execution (or nexload-reasoning-design)
Context Pointer: <Path to Causal Diagnosis Log / Commit / Issue>
Established Facts:
- <Confirmed root cause with discriminator test evidence>
Hard Constraints:
- <Reproduction condition that must pass after fix>
Settled Decisions:
- <Ruled-out hypotheses to prevent symptom patching>
Next Cognitive Objective:
- <Implement targeted causal fix OR redesign failing interface seam>
[END HANDOFF]
```

---

## References

- [hypothesis-discriminator.md](references/hypothesis-discriminator.md) — Designing high-leverage discriminating tests that falsify competing theories.
- [systematic-debugging.md](references/systematic-debugging.md) — Step-by-step diagnostic workflows, binary search isolation, and anomaly reproduction.
- [evidence-audit.md](references/evidence-audit.md) — Epistemic audit techniques to separate empirical observations from inferences and hearsay.
