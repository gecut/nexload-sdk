# Agent skills

Repository-wide engineering standards and package-scoped guidance for coding agents working with Nexload SDK.

**Topic:** agents
**Canonical page:** https://gecut.github.io/nexload-sdk/agents/
Agent Skills are task-specific, progressively disclosed instructions distributed with this repository. They complement the API docs by encoding source inspection, decision flow, invariants, security boundaries, verification, and handoff requirements that are easy for an agent to get wrong during implementation.

### Nexload engineering standards

Four foundational Skills cover TypeScript implementation, publishable package
design, React boundaries, and semantic UI design.

### Nexload CTO review

One reviewer-only Skill combines relevant standards into a scoped score,
verdict, and small set of approval-level findings without implementing fixes.

### Healthcheck skills

Seven Skills cover manager design, custom checks, diagnostics security,
cgroups, exporters, Next.js routes, and Payload integration.

### Payload Fields skills

Four Skills cover semantic factories, managed slugs, Jalali dates, and
minor-unit money contracts.

### Payload Editor skills

Three Skills cover core semantic configuration, preset contracts, and native
Payload extensions.

### Payload Schema skills

Two Skills separate entity consumption and migration from package compiler,
adapter, and release development.

### Payload Operations skills

Three Skills cover operation contracts, the shared Payload SDK client, and
secure custom endpoints.

## Use the smallest relevant skill

Install a Skill when the task matches its trigger. Use a foundational Skill for repository-wide engineering decisions and a package Skill for package-specific contracts. For example, compose `nexload-package` with `payload-operations-core` when changing that package's public entrypoints; do not install the entire collection by default.

Use `nexload-cto-review` only for an explicit review or evaluation of meaningful engineering work, including architecture, production-readiness, overengineering, or approval judgment. It sits above the four foundational implementation standards, consults only the relevant ones, and remains review-only even when asked to fix the result.

Every Skill is self-contained for its primary task. A sibling Skill may be recommended for composition, but the primary workflow does not depend on reading it. Committed behavior evals cover a happy path, edge case, security/failure case, diagnosis/review case, and a near-miss or composition boundary; trigger evals balance 10 positive and 10 neighboring negative queries.

* [Install Skills](/agents/install/) — Use the official skills CLI with this public repository.

- [Healthcheck docs](/packages/healthcheck/) — Read the runtime and security contract behind the Healthcheck Skills.

* [Payload Fields docs](/packages/payload-fields/) — Read the persistence and Admin contract behind the Payload Skills.

- [Payload Editor docs](/packages/payload-editor/) — Read the semantic editor and native extension contracts.

* [Payload Schema docs](/packages/payload-schema/) — Read the canonical field, Payload adapter, and Zod derivation contracts.

- [Payload Operations docs](/packages/payload-operations/) — Read the contract, client transport, endpoint, access, and error boundaries.
