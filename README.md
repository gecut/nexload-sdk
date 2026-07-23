# Nexload SDK

Production TypeScript packages for service health and Payload CMS.

This repository currently documents and supports ten released packages. Install
only the package that owns your task. Package versions, peer dependencies, and
runtime compatibility are listed in the
[documentation](https://gecut.github.io/nexload-sdk/).

## Packages

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

| Package                                                                                       | Use it for                                                                                                     |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`@nexload-sdk/payload-fields`](https://gecut.github.io/nexload-sdk/packages/payload-fields/) | Adding managed Unicode slugs, Jalali date inputs, and integer minor-unit money fields to Payload collections.  |
| [`@nexload-sdk/payload-editor`](https://gecut.github.io/nexload-sdk/packages/payload-editor/) | Building deterministic Payload Lexical editor configurations from explicit presets and feature options.        |
| [`@nexload-sdk/payload-schema`](https://gecut.github.io/nexload-sdk/packages/payload-schema/) | Defining canonical field validation and normalization once, then reusing it as Payload fields and Zod schemas. |

`payload-fields` owns specific field behavior and Admin UI integrations.
`payload-editor` owns Lexical configuration. `payload-schema` owns canonical
data contracts shared by Payload and Zod; it does not replace either of the
other packages.

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
