# Systematic Debugging & Anomaly Reproduction

This reference details the disciplined troubleshooting protocol used to diagnose complex, intermittent, and multi-tier bugs without making blind edits.

---

## 1. The Anti-Symptom-Patching Rule

> **Never apply a speculative fix without first understanding why the failure occurred.**

Applying `try/catch`, adding null checks, or inserting `setTimeout` without identifying the root cause creates "zombie code" that hides architectural degradation and causes cascading failures elsewhere.

---

## 2. The 5-Phase Diagnostic Cycle

```text
1. OBSERVE & REPRODUCE
   • Capture exact input, environment, and error output
   • Formulate a deterministic reproduction command/script
              │
              ▼
2. TRACE THE CAUSAL CHAIN
   • Map backwards from symptom to trigger
   • Find the earliest invalid system state
              │
              ▼
3. ISOLATE VARIABLES
   • Binary search (git bisect, code elimination, mock inputs)
   • Strip away unneeded dependencies and middleware
              │
              ▼
4. VERIFY WITH COUNTER-HYPOTHESIS
   • Prove that reversing the hypothesized defect removes the bug
   • Prove that re-introducing the hypothesized defect restores the bug
              │
              ▼
5. ESCALATE OR RESOLVE
   • Local code error ──► Route to Execution
   • Flawed boundary ──► Route to Design
   • Library incompatibility ──► Route to Evaluation
```

---

## 3. Isolating Non-Deterministic (Flaky) Bugs

When an issue occurs intermittently (e.g. race conditions, timing bugs, load-dependent crashes):

1. **Amplify the Stress Factor:**
   - Run the reproduction loop in a concurrency loop (e.g., 50 parallel requests).
   - Inject artificial latency or CPU throttle to widen race windows.
2. **Inspect Shared State:**
   - Look for mutable module-level singletons or global variables across asynchronous boundaries.
   - Verify mutexes, transaction boundaries, and cache invalidation consistency.
3. **Check Resource Boundaries:**
   - File descriptor limits (`ulimit -n`).
   - TCP port exhaustion (TIME_WAIT states).
   - Event loop lag (Node.js metrics).

---

## 4. Recognizing Layer Mismatches

Often the apparent failure occurs in Layer C, but the true root cause originated in Layer A:

- **Apparent Defect:** Frontend component throws `TypeError: item.price.toFixed is not a function`.
- **Surface Patch (Rejected):** Add `item.price?.toFixed ?? 0`.
- **Systematic Investigation:**
  1. Inspect network response: API returns `price: "49.99"` (string instead of number).
  2. Inspect database query: Serialization layer converts Decimal to String.
  3. **Root Cause:** Inconsistent contract serialization between ORM and API boundary.
  4. **Corrective Action:** Fix serialization at the API boundary, maintaining type integrity across the entire stack.
