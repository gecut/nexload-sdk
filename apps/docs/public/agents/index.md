# AI Agent Skills: Overview & Mental Model | Nexload SDK

Equip Cursor, Claude Code, Antigravity, and Codex with automated knowledge of Nexload SDK standards, preventing hallucinations and ensuring zero-shot compliance.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/
**Equip Cursor, Claude Code, Antigravity, Windsurf, and Copilot with automated knowledge of Nexload SDK standards.**

Nexload Agent Skills are lightweight, standardized instructions adhering to the Agent Skills Specification v1.0. When installed in your repository, your AI assistant gains immediate, zero-shot compliance with production invariants:

* **Zero-Hallucination Health Routes**: Avoid database cascade failures in liveness probes, configure zero-cache Next.js route handlers, and monitor Linux cgroup resource limits accurately.
* **Deterministic Payload Schemas**: Craft unified Payload collection fields and Zod schemas without double-declaring types or violating synchronous validation boundaries.
* **Clean Architecture & Boundary Narrowing**: Write minimal, reviewable TypeScript changes that respect trust boundaries and package export seams.

***

## How Nexload Skills Compose (The 3-Tier Mental Model)

Rather than treating skills as an unstructured list of tools, the Nexload ecosystem is engineered as a **three-tier symbiotic architecture**:

```text
┌─────────────────────────────────────────────────────────────────┐
│               TIER 1: THE COGNITIVE BRAIN                       │
│             nexload-reasoning-* (6+1 Graph)                     │
│  Frames problems, investigates reality, ideates mechanisms,    │
│  synthesizes architecture, evaluates trade-offs, plans delivery │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Handoffs & Boundaries)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              TIER 2: THE ENGINEERING HANDS                      │
│            nexload-code | nexload-package | ...                 │
│  Executes precise TypeScript changes, enforces type safety,     │
│  maintains React render purity, preserves UI, conducts CTO review│
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Domain Contracts)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│             TIER 3: DOMAIN & PACKAGE SPECIALISTS                │
│             healthcheck-* | payload-*                           │
│  Applies deep, battle-tested operational rules for service      │
│  reliability, Lexical editors, custom fields, and operations   │
└─────────────────────────────────────────────────────────────────┘
```

1. **The Cognitive Brain** (`nexload-reasoning-*`): Decides *what* problem to solve, *how deeply* to reason, and *which trade-offs* to accept through an orchestrated cognitive graph.
2. **The Engineering Hands** (`nexload-*`): Knows *how* to write correct TypeScript, maintain package boundaries, and prevent architectural debt.
3. **The Domain Specialists** (`healthcheck-*`, `payload-*`): Owns *package-specific invariants*, security models, and lifecycle behaviors.

***

## Explore the Agent Ecosystem

* [Quickstart & Setup](/agents/install/) — Run the One-Shot Adoption Prompt or install skills selectively using the official CLI.

- [Cognitive Graph (Tier 1)](/agents/reasoning/) — Explore the Kernel and 6 cognitive specialists: Discovery, Investigation, Ideation, Design, Evaluation, Execution.

* [Engineering Standards (Tier 2)](/agents/engineering/) — Enforce foundational standards: TypeScript narrowing, React render purity, dual ESM/CJS packaging, and CTO review.

- [Domain Specialists (Tier 3)](/agents/domain-skills/) — Battle-tested skills for @nexload-sdk/healthcheck and @nexload-sdk/payload suite packages.

* [Governance & Protocols](/agents/protocols/) — The Inviolable Constitution (8 Laws) and Sparse Pointer Handoff Protocol for cross-agent coordination.

- [Package Catalog](/packages/) — Browse all published runtime packages powering these skills.
