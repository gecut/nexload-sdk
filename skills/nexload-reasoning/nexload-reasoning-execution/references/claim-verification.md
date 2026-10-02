# Claim-Matched Verification: Empirical Proof Standards

This reference defines the verification rules of `nexload-reasoning-execution`, enforcing that completion claims are backed by observable, reproducible runtime evidence.

---

## 1. The Core Invariant: Claim $\equiv$ Evidence

> **"Builds" $\neq$ "Works". "Configured" $\neq$ "Exposed".**  
> An agent must never assert that a task is complete without producing empirical evidence that precisely matches the scope of the claim.

```text
┌───────────────────────────┬───────────────────────────────────┐
│     COMPLETION CLAIM      │       MANDATED EVIDENCE TYPE      │
├───────────────────────────┼───────────────────────────────────┤
│ "TypeScript compiles"     │ Compiler output: 0 errors         │
│ "Linter passes cleanly"   │ ESLint output: 0 warnings/errors  │
│ "Unit logic is correct"   │ Test runner output: passing specs │
│ "Bug is resolved"         │ Original failing reproduction passes│
│ "Endpoint is functional"  │ Live curl / HTTP response payload │
│ "Performance improved"    │ Before vs. After timing benchmark │
│ "Package is exportable"   │ Consumer import test / bundle size│
└───────────────────────────┴───────────────────────────────────┘
```

---

## 2. Anti-Patterns in Verification

### A. Completion by Assertion
- *Failure:* Declaring "I have updated the code to handle edge cases" without running the test suite.
- *Rule:* Always execute the test runner or compiler and capture the output.

### B. Mismatched Verification Tier
- *Failure:* Using linter success to claim that a database migration will not lose data.
- *Rule:* Database migrations require dry-run execution, schema inspection, and rollback verification.

### C. The Stale Test Illusion
- *Failure:* Running existing tests that do not exercise the new code path, and using their pass status to claim the new feature works.
- *Rule:* Write or run a test that explicitly exercises the newly introduced branch or functionality.

---

## 3. The 3-Step Verification Report Format

In all execution summaries, format verification proof as:

1. **Stated Claim:** <What is asserted to be true>
2. **Executed Command:** <Exact terminal command executed>
3. **Observed Output:** <Verbatim or truncated relevant command output proving the claim>
