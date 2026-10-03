# Domain Operational Skills

This document details the domain-specific operational Agent Skills provided by `nexload-sdk` under `skills/`. These skills empower autonomous coding agents to build, configure, and maintain Payload CMS collections and Healthcheck subsystems with expert-level precision.

---

## 1. Domain Skills Catalog

All skills comply with the **Agent Skills Specification v1.0**, featuring progressive disclosure (`SKILL.md` + detailed `references/` and `evals/fixtures/`).

### A. Healthcheck Skills (`skills/healthcheck/*`)
- **`healthcheck/core`:** Guides configuring the central `HealthManager`, scopes (`liveness`, `readiness`, `startup`), timeouts, and status aggregation.
- **`healthcheck/custom-checks`:** Patterns for writing reliable custom checks vs collectors, retry handling, and error mapping.
- **`healthcheck/container-resources`:** Detecting and parsing Linux cgroups (v1/v2) memory and CPU limits in containerized workloads.
- **`healthcheck/nextjs-routes`:** Creating robust Next.js App Router route handlers with proper `no-store` headers and proxy protection.
- **`healthcheck/monitoring-exporters`:** Mapping health reports to Prometheus and OpenTelemetry formats.
- **`healthcheck/payload`:** Configuring Payload Local API readiness checks.
- **`healthcheck/diagnostics-security`:** Hardening health endpoints against information leaks, sensitive data redaction, and access exposure rules.

### B. Payload Field Skills (`skills/payload-fields/*`)
- **`payload-fields/core`:** Architecture of custom semantic field factories and override contracts.
- **`payload-fields/slug`:** Generating and synchronizing secure, URL-safe Unicode slugs from non-Latin titles (Persian, Arabic).
- **`payload-fields/jalali-date`:** Integrating Jalali (Solar Hijri) date pickers with timezone normalization and persistence integrity.
- **`payload-fields/money`:** Minor-unit integer money fields (preventing floating point corruption in Tomans/Rials) with Admin UI formatting.

### C. Payload Schema Skills (`skills/payload-schema/*`)
- **`payload-schema/develop`:** Extending canonical schema factories and maintaining type-level invariants.
- **`payload-schema/use`:** Integrating canonical schemas into Payload collections and generating reusable Zod validation contracts.

### D. Payload Editor Skills (`skills/payload-editor/*`)
- **`payload-editor/core`:** Core semantic contract for Lexical feature configuration.
- **`payload-editor/presets`:** Applying declarative editor presets (`minimal`, `article`, `admin`).
- **`payload-editor/extensions`:** Adding custom blocks and features without plugin collisions.

### E. Payload Operations Skills (`skills/payload-operations/*`)
- **`payload-operations/core`:** Designing contract-first custom operations.
- **`payload-operations/server`:** Registering operation endpoints and handling execution boundaries inside Payload.
- **`payload-operations/client`:** Constructing typed SDK facades and handling transport pipelines.

### F. Payload Collection Architecture (`skills/payload/collection-design`)
- **`payload/collection-design`:** Canonical collection naming, field semantics, relation design, delete constraints, snapshot preservation, and event access control.

---

## 2. Distributing & Installing Skills

Any external project (such as `nexload-e-commerce` or a new microservice) can adopt these skills directly using the official `skills` CLI:

```bash
# 1. View all available skills in this repository
npx skills add gecut/nexload-sdk --list

# 2. Install the 6+1 Cognitive Reasoning Kernel
npx skills add gecut/nexload-sdk --skill nexload-reasoning

# 3. Install Payload domain skills
npx skills add gecut/nexload-sdk --skill payload-operations
npx skills add gecut/nexload-sdk --skill payload-fields
npx skills add gecut/nexload-sdk --skill healthcheck
```

### The One-Shot Adoption Pattern
When bootstrapping an AI agent in a new Nexload project, prompt the agent with:
> "Install the Nexload Reasoning ecosystem and relevant domain skills from `gecut/nexload-sdk` using `npx skills add` to guide all architectural and implementation decisions."
