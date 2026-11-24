# Nexload SDK

Production TypeScript packages for building recurring Payload CMS + Next.js
products, starting with Iranian e-commerce sites: logging, service health, and
Payload CMS building blocks.

## Why this repository exists

We build many sites with the same shape: a Payload CMS backend, a Next.js
storefront, Persian admin, Iranian payment and SMS providers. Each project used
to re-implement the same parts (logger, Persian settings, payment and SMS
integrations, OTP, order and inventory rules) and the copies drifted.

The goal is a **stable, high-performance "WordPress-like" base made of code
modules**:

- **Developers compose modules in code.** A new site is assembled from these
  packages with plain TypeScript and plain Payload plugins, not from a runtime
  plugin marketplace.
- **The site owner configures runtime settings in the admin.** Choices that
  change per client (for example which payment gateways are active, including
  installment gateways, and their credentials) belong in a Payload global the
  client edits, not in code or environment variables.
- **Fastest and cheapest path to ship.** Extract only what at least two or three
  real projects already repeat. Shorten the simple, feasible parts first.
- **Stay thin over Payload.** Our types are Payload's types; no wrapper around
  `buildConfig`. Defaults must not cost read or list performance.

Contributors and coding agents: read the project intent in
[`docs/README.md`](./docs/README.md#project-intent) before designing a new
package.

This repository currently documents and supports twelve released packages. Install
only the package that owns your task. Package versions, peer dependencies, and
runtime compatibility are listed in the
[documentation](https://gecut.github.io/nexload-sdk/).

## Packages

### Core

| Package                                                                       | Use it for                                                                                                                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@nexload-sdk/logger`](https://gecut.github.io/nexload-sdk/packages/logger/) | One global pino-based logger, configured once per service, with redaction, error serialization, request context, and the same API in Node.js, Edge, and the browser. |
| [`@nexload-sdk/persian`](https://gecut.github.io/nexload-sdk/packages/persian/) | Persian and Iranian normalization, validation, formatting, dates and money. |

### Healthcheck

Start with `@nexload-sdk/healthcheck`, then add the runtime, framework, CMS, or
monitoring integration your service needs.

| Package                                                                                                       | Use it for                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@nexload-sdk/healthcheck`](https://gecut.github.io/nexload-sdk/packages/healthcheck/core/)                  | Defining checks, collectors, scopes, health reports, timeouts, status aggregation, and serialization without coupling the core to a framework. |
| [`@nexload-sdk/healthcheck-node`](https://gecut.github.io/nexload-sdk/packages/healthcheck/node/)             | Reading Node.js process data, Linux cgroup limits, TCP reachability, and DNS resolution.                                                       |
| [`@nexload-sdk/healthcheck-bun`](https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/)               | Adapting the health manager to Bun and observing `Bun.serve` server metrics.                                                                   |
| [`@nexload-sdk/healthcheck-next`](https://gecut.github.io/nexload-sdk/packages/healthcheck/next/)             | Creating no-store health and metrics route handlers for the Next.js App Router.                                                                |
| [`@nexload-sdk/healthcheck-prometheus`](https://gecut.github.io/nexload-sdk/packages/healthcheck/prometheus/) | Serializing health reports as Prometheus or OpenMetrics text.                                                                                  |
| [`@nexload-sdk/healthcheck-otel`](https://gecut.github.io/nexload-sdk/packages/healthcheck/otel/)             | Converting health reports into OpenTelemetry-friendly resource attributes and metric records without requiring an OpenTelemetry SDK.           |
| [`@nexload-sdk/healthcheck-payload`](https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/)       | Checking Payload CMS readiness through a small, controlled Local API query.                                                                    |

The runtime adapters do not create HTTP endpoints. Route ownership stays with
your application or framework integration. Monitoring serializers only convert
reports; they do not start exporters or register SDK providers.

### Payload CMS

These packages solve separate problems and can be used independently.

| Package                                                                                               | Use it for                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`@nexload-sdk/payload-fields`](https://gecut.github.io/nexload-sdk/packages/payload-fields/)         | Adding managed Unicode slugs, Jalali date inputs, and integer minor-unit money fields to Payload collections.  |
| [`@nexload-sdk/payload-editor`](https://gecut.github.io/nexload-sdk/packages/payload-editor/)         | Building deterministic Payload Lexical editor configurations from explicit presets and feature options.        |
| [`@nexload-sdk/payload-operations`](https://gecut.github.io/nexload-sdk/packages/payload-operations/) | Exposing typed custom Payload operations through shared Zod contracts, secure endpoints, and the native SDK.   |
| [`@nexload-sdk/payload-schema`](https://gecut.github.io/nexload-sdk/packages/payload-schema/)         | Defining canonical field validation and normalization once, then reusing it as Payload fields and Zod schemas. |

`payload-fields` owns specific field behavior and Admin UI integrations.
`payload-editor` owns Lexical configuration. `payload-schema` owns canonical
data contracts shared by Payload and Zod. `payload-operations` owns custom
operation transport, endpoint, access, and error boundaries; it does not replace
Payload CRUD or the other packages.

## Agent Skills (6+1 Cognitive Graph & Engineering Standards)

This repository distributes production-grade, progressively disclosed [Agent Skills](https://gecut.github.io/nexload-sdk/agents/) compliant with the Agent Skills Specification v1.0.

- **The 6+1 Cognitive Graph (`nexload-reasoning-*`):** Kernel router, depth controller, and 6 standalone-capable specialists (Discovery, Investigation, Ideation, Design, Evaluation, Execution) enforcing evidence-first reasoning and the Divergence Firewall.
- **Engineering Standards (`nexload-*`):** Core standards for TypeScript precision (`nexload-code`), package boundaries (`nexload-package`), React render safety (`nexload-react`), visual systems (`nexload-design`), pre-design context compilation ([`nexload-design-context`](skills/nexload/design-context/SKILL.md)), and principal architecture reviews (`nexload-cto-review`).
- **Domain Specialists:** Operational skills for Healthcheck reliability, Payload CMS, and [Persian inputs and display](skills/persian/SKILL.md).

Install skills directly into any project using the official CLI:

```bash
# Install the Cognitive Reasoning Kernel
npx skills add gecut/nexload-sdk --skill nexload-reasoning

# Install the Persian skill
npx skills add gecut/nexload-sdk --skill persian

# Install the Payload Preset skill
npx skills add gecut/nexload-sdk --skill payload-preset

# View all available skills
npx skills add gecut/nexload-sdk --list
```

See the [Agent Skills Documentation](https://gecut.github.io/nexload-sdk/agents/) for the complete catalog and the **One-Shot Project Adoption Prompt**.

## Documentation

The [package catalog](https://gecut.github.io/nexload-sdk/packages/) is the
starting point for installation, quick starts, concepts, guides, API references,
examples, troubleshooting, migration, and compatibility.

The site documents the current released version of each package. Historical
versioned pages are not hosted; use the package changelog and migration guide
when upgrading.

## Repository development

The workspace uses pnpm and Turbo. Node.js 20 or newer and pnpm 10 are
recommended for repository development.

```bash
pnpm install
pnpm build
pnpm lint
```

Package source lives under `packages/`. Build output is generated in `dist/`
and should not be edited directly. Releases are managed with Changesets.

See [`AGENTS.md`](./AGENTS.md) for repository-specific contribution guidance.
