# Priority, Verdict, and Output Contract

This reference defines the severity calibration rules, 6-verdict contract, discrete scoring model, finding schema, and compact output format for `nexload-cto-review`.

---

## 1. Severity Model

Priorities reflect material consequence and risk to the system, not compliance dogma or aesthetic preference.

### P0 — Blocker
A severe defect that makes approval or release unacceptable:
- Security or privilege boundary failure (secret leak, authorization bypass, unvalidated ingress).
- Data loss, silent corruption, or non-atomic state mutations across failure boundaries.
- Irreversible destructive behavior.
- Materially false public or runtime contract that makes declared use unsafe or nonfunctional (e.g., Node-only modules in a browser-targeted entrypoint).
- Critical runtime incompatibility or missing dependency ownership.
- Fundamentally invalid architectural direction that solves the wrong problem.

### P1 — Material
An architectural or engineering defect that must be resolved prior to final approval:
- Misplaced or ambiguous ownership (state, configuration, lifecycle, error handling).
- Unjustified speculative architecture (abstractions that impose real cost without current benefit).
- Significant public API inflation or accidental internal symbol exposure.
- Business invariant gap or missing idempotency guarantees.
- Substantial change amplification (coupling that forces synchronized edits across multiple subsystems).
- Inverted dependency direction (core depending on adapters or framework implementations).
- Incomplete production readiness (missing required telemetry, absent rollback guarantees).

### P2 — Improvement
A genuine, material improvement that does not block approval:
- Bounded simplification that reduces cognitive overhead.
- Minor public contract polish or export narrowing with local blast radius.
- System consistency enhancement with clear consumer or maintenance value.

> [!NOTE]
> Suppress P3. If an issue is purely stylistic, formatting-related, or does not influence technical approval, it must be suppressed entirely rather than demoted to P2.

---

## 2. Severity Calibration: Blast Radius & Reversibility

When assigning severity, calibrate the finding along two objective axes:

### Reversibility
- **Easy:** Internal implementation detail, private module, or unreleased prototype; cheap to change.
- **Moderate:** Subsystem interface with localized consumers; requires straightforward refactor.
- **Expensive:** Published public API, cross-package contract, or shared database schema; breaking change.
- **Practically irreversible:** Persistent data migration, widely distributed external SDK contract, or wire protocol.

### Blast Radius
- **Local:** Contained within a single internal private function or file.
- **Feature:** Contained within a single feature boundary.
- **Package:** Affects an entire package's internal runtime or callers.
- **Application:** Affects the whole application runtime (CMS, API, or Web).
- **Cross-system:** Affects inter-service coordination, gateway routing, or shared state.
- **External consumers:** Breaks third-party developers consuming public SDK packages.
- **Persistent data:** Corrupts or alters persistent database storage.

### Calibration Rule
A defect in an internal private helper with `Easy` reversibility and `Local` blast radius is at most **P2**. The identical defect in a public SDK export with `Expensive` reversibility and `External consumers` blast radius escalates to **P1** or **P0**.

---

## 3. The 6-Verdict Contract

The review concludes with exactly one of six authoritative verdicts:

| Verdict | Meaning & Required State |
| --- | --- |
| `Approved` | All relevant criteria met; zero material findings (no P0, P1, or P2). |
| `Approved with minor issues` | Direction and engineering integrity are sound; only isolated, non-blocking P2 findings remain. |
| `Needs revision` | Overall architectural direction is valid, but one or more P1 material issues must be resolved before approval. |
| `Blocked` | A fixable P0 blocker halts approval or release, but the core direction is sound and recoverable (e.g., secret leak in browser bundle, unsafe migration, missing peer declaration). |
| `Rejected` | The fundamental direction is invalid (e.g., solves the wrong problem, core model violates business invariants, inverted trust boundary). Recovery requires discarding the direction. |
| `Withheld` | Decisive evidence is absent, preventing responsible technical judgment. Used with `Score: Not assessable`. |

---

## 4. Score Calibration & Discrete Precision

### Derivation Sequence
The score is never an arbitrary starting point. It must be derived strictly in this sequence:
```text
Traceable Evidence
  → Admitted Findings
    → Calibrated Severity (P0/P1/P2)
      → Decisive Verdict
        → Compatible Score
```

### Score Bands
- **9.0–10.0:** Production-grade / excellent; corresponds to `Approved`.
- **8.0–8.9:** Strong with limited minor weaknesses; corresponds to `Approved with minor issues`.
- **7.0–7.9:** Sound direction, but material revision needed; corresponds to `Needs revision`.
- **6.0–6.9:** Meaningful redesign or boundary correction needed; corresponds to `Needs revision` or recoverable `Blocked`.
- **4.0–5.9:** Major structural flaws or critical blockers; corresponds to `Blocked` or `Rejected`.
- **0.0–3.9:** Fundamentally broken or unsafe direction; corresponds to `Rejected`.

### Discrete Precision Rule
Avoid artificial pseudo-precision (e.g., 8.3, 7.2, 6.7). Calibrate scores to half-integer steps:
```text
10.0 | 9.5 | 9.0 | 8.5 | 8.0 | 7.5 | 7.0 | 6.5 | 6.0 | 5.0 | 4.0 | 2.0 | 0.0
```
When evidence is decisive but missing, output `Score: Not assessable` with verdict `Withheld`.

---

## 5. Finding Schema

Every admitted finding must adhere strictly to the following schema:

```text
[Priority] Title
Evidence:
<Traceable Evidence Anchor: file, line, symbol, export, or runtime trace>

Confidence:
<Confirmed | Strong inference>

Impact:
<Concrete operational, runtime, consumer, or maintenance consequence>

Why it matters:
<Concise architectural rationale connecting impact to technical invariants>

Required property:
<The architectural invariant or state that must become true>

Verification condition:
<The observable check or test condition that proves the finding is closed>

Preserve: [Optional]
<Explicit note protecting sound design decisions from collateral damage during revision>
```

> [!IMPORTANT]
> The **Required property** and **Verification condition** describe the necessary target state and closure criteria. They must **never** contain implementation code, patches, shell commands, or ordered fix sequences.

---

## 6. Compact Output Format

The final report must remain concise, structured, and free of extraneous conversation:

```text
Scope:
<Target artifact, boundary, and explicit subject>

Mode:
<proposal | implementation | change | readiness>

Score:
<X.X/10 | Not assessable>

Verdict:
<Approved | Approved with minor issues | Needs revision | Blocked | Rejected | Withheld>

Decision basis:
<1–2 sentences summarizing the core technical rationale>

Findings:

[P0] <Title>
Evidence: <Traceable anchor>
Confidence: <Confirmed | Strong inference>
Impact: <Concrete impact>
Why it matters: <Architectural rationale>
Required property: <Invariant that must be true>
Verification condition: <Observable closure proof>
Preserve: <Sound elements to protect> [Optional]

[P1] <Title>
...

Evidence limits:
<Missing facts or unverified lanes that constrain confidence, only if decision-relevant>

Strong points:
<Sound architectural choices worth preserving, only if helpful during revision>
```

---

## 7. Role-Boundary Scan Before Emitting Output

Before finalizing the review, perform a mandatory boundary scan:
1. Scan for any code snippets, class definitions, function implementations, or TS type definitions. **Remove them.**
2. Scan for diffs, patch blocks, or configuration file rewrites. **Remove them.**
3. Scan for shell commands or terminal invocation steps. **Remove them.**
4. Scan for numbered implementation roadmaps or execution plans. **Remove them.**
5. Confirm that all findings state **Required properties** and **Verification conditions**, not implementation guides.
