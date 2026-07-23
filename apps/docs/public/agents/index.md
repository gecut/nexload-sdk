# Agent skills

Package-scoped guidance for coding agents working with Nexload Healthcheck and Payload packages.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/
Agent Skills are task-specific, progressively disclosed instructions distributed with this repository. They complement the API docs by encoding source inspection, decision flow, invariants, security boundaries, verification, and handoff requirements that are easy for an agent to get wrong during implementation.

### Healthcheck skills

Seven Skills cover manager design, custom checks, diagnostics security, cgroups, exporters, Next.js routes, and Payload integration.

### Payload Fields skills

Four Skills cover semantic factories, managed slugs, Jalali dates, and minor-unit money contracts.

### Payload Editor skills

Three Skills cover core semantic configuration, preset contracts, and native Payload extensions.

### Payload Schema skills

Two Skills separate entity consumption and migration from package compiler, adapter, and release development.

## Use the smallest relevant skill

Install a Skill when the task matches its trigger. For example, install `healthcheck-nextjs-routes` when adding a Next App Router health route, not the entire collection by default.

Every Skill is self-contained for its primary task. A sibling Skill may be recommended for composition, but the primary workflow does not depend on reading it. Committed behavior evals cover a happy path, edge case, security/failure case, diagnosis/review case, and a near-miss or composition boundary; trigger evals balance 10 positive and 10 neighboring negative queries.

* [Install Skills](/agents/install/) — Use the official skills CLI with this public repository.

- [Healthcheck docs](/packages/healthcheck/) — Read the runtime and security contract behind the Healthcheck Skills.

* [Payload Fields docs](/packages/payload-fields/) — Read the persistence and Admin contract behind the Payload Skills.

- [Payload Editor docs](/packages/payload-editor/) — Read the semantic editor and native extension contracts.

* [Payload Schema docs](/packages/payload-schema/) — Read the canonical field, Payload adapter, and Zod derivation contracts.
