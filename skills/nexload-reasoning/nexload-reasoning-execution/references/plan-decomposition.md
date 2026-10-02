# Plan Decomposition & Phased Delivery

This reference governs how `nexload-reasoning-execution` breaks complex implementation initiatives into atomic, dependency-ordered, and verifiable phases.

---

## 1. Principles of Atomic Plan Decomposition

A delivery plan must avoid "monolithic execution" where all changes are written at once before testing. An effective plan enforces:

1. **Topological Dependency Ordering:** Dependencies are constructed before dependents (e.g. Models $\rightarrow$ Core Services $\rightarrow$ API Controllers $\rightarrow$ Client Hooks $\rightarrow$ UI).
2. **Phase Compilability:** After every phase, the repository must compile cleanly (`pnpm build`). Never leave the repository in a broken state across phases.
3. **Embedded Verification Checkpoints:** Every phase contains an empirical verification command, not a generic assertion.

---

## 2. Standard 4-Phase Delivery Template

```text
┌────────────────────────────────────────────────────────┐
│               PHASE 1: FOUNDATIONS & TYPES             │
│   • Domain schemas, interfaces, database models        │
│   • Verification: `pnpm typecheck` or `tsc --noEmit`   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               PHASE 2: CORE LOGIC & ENGINES            │
│   • Pure domain logic, validators, transforms          │
│   • Verification: Unit tests pass (`pnpm test:unit`)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               PHASE 3: ADAPTERS & INTEGRATION          │
│   • Database queries, external API clients, routes     │
│   • Verification: Integration test / local reproduction│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               PHASE 4: CONSUMER WIRING & CLEANUP       │
│   • UI binding, export updates, dead-code removal      │
│   • Verification: End-to-end check & clean linter      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Scope Boundaries & Plan-Only Discipline

When the user specifies:
- "Create an implementation plan only"
- "Analyze what changes are needed without writing code"
- "Give me a dry run of the migration"

**The agent must halt immediately after phase decomposition.**
Under no circumstance should the agent start creating or modifying implementation source files without authorization.
