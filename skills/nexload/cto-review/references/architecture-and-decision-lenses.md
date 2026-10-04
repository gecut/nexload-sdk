# Architecture and Decision Lenses

This reference defines the architectural reasoning tools used by `nexload-cto-review`: the Two-Pass Judgment model, the Complexity Ledger, the Three-Question Complexity Test, the 11 Core CTO Decision Lenses, and specialist routing.

---

## 1. Two-Pass Judgment Discipline

Every evaluation must separate problem satisfaction from technical hygiene into two independent mental passes:

```text
Incoming Artifact
  ├── Pass A: Requirement Fidelity  → "Does this solve the exact requested problem?"
  └── Pass B: Engineering Integrity → "Is this technically sound, safe, and proportionate?"
```

### Pass A — Requirement Fidelity
Examine whether the solution delivers on its core promise:
- Stated scope, requested behavior, and explicit constraints.
- Core domain problem vs tangential distractions.
- Contract alignment and acceptance expectations.
- Business invariants of the specified domain.

*Trap:* A system can be architecturally elegant, beautifully tested, and modular, yet implement the wrong feature or violate a core business constraint.

### Pass B — Engineering Integrity
Examine whether the implementation is robust, maintainable, and sound:
- Correctness, ownership, and boundary integrity.
- Complexity vs necessity.
- Runtime isolation, failure semantics, and data integrity.
- Blast radius, operational risk, and consumer cost.

*Trap:* A solution can fulfill every literal requirement while introducing unmaintainable coupling, global mutable state, or catastrophic failure modes.

> [!NOTE]
> The two passes are a mental reasoning discipline, not necessarily separate output sections.

---

## 2. Smallest Correct Architecture & The Complexity Ledger

Architecture must earn its keep. Every layer, wrapper, factory, registry, cache, state machine, and dependency imposes a permanent tax on the codebase.

### The Complexity Ledger

| Current Benefits | Permanent Costs |
| --- | --- |
| Verifiable correctness | Cognitive overhead & onboarding load |
| Clear policy ownership | Public API surface to support forever |
| Clean runtime separation | Long-term maintenance ownership |
| Deterministic lifecycle management | Change amplification across subsystems |
| Concrete, active variants (e.g., Node + Bun) | Dependency & version coupling |
| Host interoperability & consumer isolation | Runtime hops & serialization cost |
| Measured performance improvement | Configuration surface & state coordination |
| Explicit security/trust boundary | Operational burden & failure modes |

### The Golden Ledger Rule
```text
Current Evidenced Benefit > Permanent System Cost
```
- **Speculative Future Benefit** cannot justify present complexity.
- Future requirements are admissible only when explicitly stated in project requirements or locked specs.
- When an abstraction's current benefit is negligible or unsupported, it is overengineering.
- When a necessary boundary or invariant is omitted to save a few lines of code, it is underengineering. Simplicity follows correctness.

---

## 3. The Three-Question Complexity Test

Apply this test to any significant abstraction, adapter, plugin system, factory, or registry:

### Question 1: If removed, what real capability today is lost?
- If the answer is "nothing" or "we might need it later," the abstraction is speculative and fails review.
- If a real capability is lost (e.g., multi-runtime execution, isolated testing), proceed to Question 2.

### Question 2: What permanent cost does its presence add?
- Identify the ongoing friction: extra files, type gymnastics, indirections, configuration burden, or failure points.

### Question 3: Can the same capability be achieved with a simpler boundary?
- If a direct native platform API, a focused helper, or a cohesive single file achieves the exact same capability with lower cost, the design requires simplification.

---

## 4. The 11 Core CTO Decision Lenses

Activate lenses only when relevant to the reviewed scope; do not execute an exhaustive, irrelevant checklist.

### Lens 1: Correctness
Does the solution produce correct results across normal and edge operations? Are calculations, data transformations, and state transitions mathematically and logically sound?

### Lens 2: Requirement Fidelity
Does the implementation address the requested problem, or did it veer into unrequested scope? Are stated constraints honored?

### Lens 3: Ownership
Does every critical resource have a single, unambiguous owner?
- **State:** Who initializes, updates, and disposes of it?
- **Configuration:** Is it passed explicitly or hidden in global singletons?
- **Policy:** Is business logic separated from transport/plumbing?
- **Lifecycle:** Are connections, timers, listeners, and resources cleanly torn down?

### Lens 4: Boundary Integrity
Are architectural boundaries clean and unidirectional?
- `public / internal`: Are internal helpers hidden from public entrypoints?
- `server / client`: Does client code stay free of server secrets and Node imports?
- `core / adapter`: Does core stay free of adapter and framework specifics?
- `contract / implementation`: Are interfaces decoupled from concrete backing engines?
- `trusted / untrusted`: Is external input validated at ingress?

### Lens 5: Single Source of Truth (SSOT)
For every significant business rule, configuration value, or schema:
- Where is the canonical authority?
- Does the system duplicate knowledge across layers (e.g., pricing validation in frontend + pricing validation in API + pricing in CMS) without deriving from a single contract?

### Lens 6: Change Amplification
When a single logical change occurs in the domain:
- How many independent subsystems, files, or packages must be modified in lockstep?
- If a minor requirement change forces edits across 4 packages, the architecture suffers from unhealthy coupling.

### Lens 7: Business Invariants
In transactional, financial, authentication, or lifecycle systems, are domain invariants rigidly enforced?
- Can a payment be verified twice?
- Can an approved order transition backward?
- Can an account credit balance become negative without explicit override policy?
- Are state machines deterministic and exhaustive?

### Lens 8: Data Integrity
When mutating persistent state:
- Are mutations atomic and idempotent?
- What happens on partial failure?
- Is there a clear migration path for schema evolutions?

### Lens 9: Failure Semantics
How does the system behave when operations fail?
- Are timeouts, retries, and cancellation tokens propagated cleanly?
- Does retry logic handle idempotency keys, or does it risk duplicate execution?
- Is fallback behavior safe and predictable?

### Lens 10: Operational Readiness
*(Primarily for `readiness` mode or release reviews)*
- Deployment safety: Can this be deployed with zero downtime?
- Rollback safety: If rolled back, will persistent state or schema changes break the previous version?
- Observability: Are errors logged with actionable context without leaking PII?
- Configuration: Are environment variables validated at startup?

### Lens 11: Consumer Impact
*(For public SDK packages and published libraries)*
- SemVer impact: Does this constitute a breaking public contract change?
- Upgrade cost: What is required of consumers upgrading from the previous minor version?
- API surface: Is the API surface minimal, ergonomic, and hard to misuse?

---

## 5. Specialist Routing

`nexload-cto-review` is an architectural judge, not a duplicate repository encyclopedia. Delegate domain standards to the smallest relevant installed specialist:

| Specialist | Domain Delegated | CTO Gate Role |
| --- | --- | --- |
| `nexload-code` | TypeScript strictness, module structure, naming, trust narrowing | Weighs whether type or module defects create material architecture risk |
| `nexload-package` | Package exports, entrypoints, subpaths, bundle formats, dependency classes | Weighs package contract integrity, runtime isolation, and SemVer stability |
| `nexload-react` | Component contracts, render purity, client/server boundaries, hook lifecycle | Weighs whether React defects impact application architecture or runtime safety |
| `nexload-design` | Semantic tokens, responsive/RTL layout, geometry preservation | Weighs whether design defects break design system cohesion or approved UI |

### Composition Rule
The specialist identifies domain-level issues; `nexload-cto-review` filters them through the Finding Admission Test, compresses them into root causes, and assigns the final score and verdict.
