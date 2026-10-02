# Hypothesis Discriminator Engine

The Hypothesis Discriminator is a formal method for resolving complex system anomalies by designing tests that maximally bifurcate the hypothesis space.

---

## 1. The Falsification Principle

Confirmation bias is the tendency to run experiments that seek to confirm a favorite hypothesis. The Discriminator engine inverts this:

> **Do not try to prove a hypothesis. Design tests that actively attempt to falsify hypotheses until only one coherent explanation survives.**

An effective discriminating test has two properties:
1. **High Information Gain:** The outcome cleanly separates competing explanations ($H_A$ survives if $X$, $H_B$ survives if $\neg X$).
2. **Minimal Execution Cost:** It inspects existing logs or static code before running heavy integration or reproduction suites.

---

## 2. Discriminator Design Matrix

When faced with multiple explanations, construct a discriminator matrix:

```text
┌─────────────────┬──────────────────────┬──────────────────────┐
│   HYPOTHESIS    │    PREDICTION A      │    PREDICTION B      │
│                 │   (Test: Env Check)  │   (Test: Curl 502)   │
├─────────────────┼──────────────────────┼──────────────────────┤
│ H1: OOM Crash   │ Memory metric > 95%  │ Process dead (SIGKILL)│
│ H2: Timeout     │ Memory metric normal │ Process alive (504)  │
│ H3: Type Crash  │ Memory metric normal │ Stack trace in stderr│
└─────────────────┴──────────────────────┴──────────────────────┘
```

A single check of the memory metric immediately eliminates either $H_1$ or ($H_2 \land H_3$).

---

## 3. The 4-Step Discriminator Protocol

### Step 1: Formulate Mutually Exclusive Explanations
State at least two hypotheses that cannot both be the primary root cause:
- $H_1$: The database client connection pool is exhausted due to connection leaks.
- $H_2$: Database lock contention is causing long-running transactions to block writes.

### Step 2: Identify Divergent Predictions
What must be true in system state if $H_1$ is true versus if $H_2$ is true?
- If $H_1$: `active_connections == max_connections`, query execution time on Postgres server is low.
- If $H_2$: `pg_locks` contains granted exclusive locks with waiting queries; connection pool is not necessarily maxed out.

### Step 3: Select the Cheapest Decisive Check
Check `pg_stat_activity` and `pg_locks`. This single read query falsifies one of the two hypotheses definitively.

### Step 4: Update the Causal Model
Record the empirical finding, mark the falsified hypothesis as `REJECTED`, and narrow the investigation to the surviving hypothesis.

---

## 4. When Hypotheses Cannot Be Separated

If an experiment yields ambiguous telemetry:
1. **Instrument the Seam:** Add targeted temporary logging at the boundary between the two hypothesized components.
2. **Bisection:** Use git bisect or state bisection to isolate the earliest change or input that produces the divergence.
3. **Reproduce in Isolation:** Extract the failing function into a standalone script to eliminate external network and environmental noise.
