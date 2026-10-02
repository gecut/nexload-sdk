# Dynamic Reasoning Depth Heuristics

This reference establishes the operational heuristics used by `nexload-reasoning` to determine the depth of reasoning required for a given prompt or task.

---

## 1. Depth Classification Levels

```text
┌─────────────────────────────────────────────────────────────┐
│                       REASONING DEPTH                       │
├─────────────────┬───────────────────────┬───────────────────┤
│    LOW DEPTH    │     MEDIUM DEPTH      │    HIGH DEPTH     │
│  (0 Specialists)│    (1-2 Specialists)  │ (3+ Specialists)  │
├─────────────────┼───────────────────────┼───────────────────┤
│ • Deterministic │ • Local architecture  │ • Cross-cutting   │
│ • Fully local   │ • Non-trivial bug     │ • Irreversible    │
│ • Instant proof │ • 2-3 design options  │ • High blast zone │
│ • Safe fallback │ • Unclear edge cases  │ • Hard trade-offs │
└─────────────────┴───────────────────────┴───────────────────┘
```

---

## 2. Classification Criteria

### Level 1: Low Depth (`NONE`)
- **Characteristics:**
  - Zero material architectural ambiguity.
  - Reversible in seconds (e.g. single git checkout).
  - Scope is strictly bounded within a single file or function.
  - Verification is deterministic (compiler, linter, formatting check).
- **Examples:**
  - "Rename `getUserData` to `fetchUserProfile` across `src/user.ts`."
  - "Add a missing type export to `src/index.ts`."
  - "What does HTTP status 429 mean?"
- **Operational Action:** Bypass specialist activation. Execute directly.

### Level 2: Medium Depth (Single Specialist Pass)
- **Characteristics:**
  - One dimension of material uncertainty (e.g., intent ambiguity, unknown bug cause, or choice between two libraries).
  - Blast radius is contained within a single module or package.
  - Verification requires targeted integration checks or reproduction steps.
- **Examples:**
  - "Why is our Redis cache key expiring immediately after write?" $\rightarrow$ `nexload-reasoning-investigation`
  - "The customer says 'make the export faster', what do they actually care about?" $\rightarrow$ `nexload-reasoning-discovery`
  - "Should we use `pnpm-workspace` or `turbo` for this task orchestration?" $\rightarrow$ `nexload-reasoning-evaluation`
- **Operational Action:** Activate exactly one primary specialist. If that specialist discovers unexpected cross-cutting complexity, escalate to High Depth via a sparse handoff.

### Level 3: High Depth (Multi-Specialist Graph Traversal)
- **Characteristics:**
  - Multiple dimensions of uncertainty: intent is ambiguous AND architecture is unformed AND trade-offs carry heavy operational or financial risk.
  - One-way door decisions (data migrations, public API deprecations, new external dependencies).
  - System crashes under load with conflicting or incomplete telemetry.
- **Examples:**
  - "We need to replace our entire auth system with Passkeys while keeping SMS fallback." $\rightarrow$ Discovery $\rightarrow$ Design $\rightarrow$ Evaluation $\rightarrow$ Execution.
  - "Production database OOMs every Tuesday at 03:00 UTC." $\rightarrow$ Investigation $\rightarrow$ Design $\rightarrow$ Execution.
- **Operational Action:** Execute sequential specialist passes with formal `[NEXLOAD HANDOFF]` checkpoints. Enforce stopping conditions after each step.

---

## 3. Dynamic Budget Throttling (Stopping Heuristics)

Reasoning must immediately stop when any of the following conditions is met:

1. **Uncertainty is Immaterial:** Remaining unknown details have no impact on the choice of architecture, libraries, interfaces, or verification strategy.
2. **Reversible Default Exists:** A sensible default exists that is trivial to change later without migrating data or breaking consumers.
3. **Evidence Cap Reached:** Further speculative analysis cannot yield new information without running an empirical experiment or code execution.
4. **Dominance Established:** One option strictly dominates all alternatives on critical dimensions (performance, simplicity, operational burden) with zero fatal weaknesses.
