# @nexload-sdk/healthcheck-bun

**Bun runtime adapter and `Bun.serve` metrics checks for `@nexload-sdk/healthcheck`.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-bun)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-bun)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Bun](https://img.shields.io/badge/runtime-Bun-lightgrey.svg)

> [!IMPORTANT]
> A new major release is pending across the healthcheck family in `.changeset/healthcheck-major.md` (import ordering updates, no runtime behavior changes).

## Table of contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Runtime and compatibility](#runtime-and-compatibility)
- [Caveats](#caveats)
- [Related packages](#related-packages)
- [License](#license)

## Overview

`@nexload-sdk/healthcheck-bun` provides a `RuntimeAdapter` for Bun (`bunRuntimeAdapter`), a Bun runtime diagnostics check (`bunRuntimeInfoCheck`), and a `Bun.serve` metrics check (`bunServerMetricsCheck`). It solves reporting Bun version, revision, and active request/WebSocket counts inside `@nexload-sdk/healthcheck` reports. It is for Bun HTTP services and APIs.

What it is not:

- Not an HTTP route handler for Bun (wire `health.run(...)` inside your `Bun.serve` `fetch` handler).
- Not a cgroup container probe (unlike `@nexload-sdk/healthcheck-node`).

## Philosophy

- **Lightweight global inspection:** Reads `globalThis.Bun` and `globalThis.process` safely without crashing if fields are absent.
- **Diagnostics by default:** `bunRuntimeInfoCheck` and `bunServerMetricsCheck` default to `scopes: ["diagnostics"]` and `critical: false`.

## Install

```bash
bun add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-bun
# or
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-bun
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| *(none)* | — | No peer dependencies (`@nexload-sdk/healthcheck` is a direct dependency) |

## Quick start

```ts
import { createHealthManager, shutdownCheck } from "@nexload-sdk/healthcheck";
import { bunRuntimeAdapter, bunServerMetricsCheck } from "@nexload-sdk/healthcheck-bun";

const server = Bun.serve({ fetch: () => new Response("ok") });

export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [shutdownCheck(), bunServerMetricsCheck(server)],
});
```

## Usage

### Checking Bun runtime info

```ts
import { bunRuntimeInfoCheck } from "@nexload-sdk/healthcheck-bun";

const runtimeCheck = bunRuntimeInfoCheck({ scopes: ["diagnostics"] });
```

`bunRuntimeInfoCheck` reports `"ok"` when `ctx.runtime.getRuntimeInfo().name === "bun"` and `"degraded"` otherwise.

## API

### Root entry (`@nexload-sdk/healthcheck-bun`)

| Export | Kind | Summary |
| --- | --- | --- |
| `bunRuntimeAdapter` | `function` | `RuntimeAdapter` reading Bun version, revision, uptime, and process memory |
| `bunRuntimeInfoCheck` | `function` | Check `"bun.runtime"` reporting uptime and runtime details |
| `bunServerMetricsCheck` | `function` | Check `"bun.server.metrics"` reporting `pendingRequests` and `pendingWebSockets` |
| `BunServerLike` | `interface` | Structural type matching `Bun.serve()` return object |

## Configuration

| Function | Option | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `bunRuntimeInfoCheck` | `scopes` | `readonly HealthScope[]` | `["diagnostics"]` | Scopes where the check runs |
| `bunServerMetricsCheck` | `scopes` | `readonly HealthScope[]` | `["diagnostics"]` | Scopes where the check runs |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtime:** Designed for Bun.

## Caveats

> [!NOTE]
> `bunRuntimeAdapter()` reads process memory via `process.memoryUsage()` when available and sets `totalBytes`, `constrainedBytes`, `availableBytes`, `availableRatio`, and `usedRatio` to `null` (it does not read Linux cgroups). `memoryCheck()` therefore reports degraded with this adapter.

> [!WARNING]
> Protect endpoints exposing `bun.runtime` or `bun.server.metrics` diagnostics so runtime versions and server load are not leaked publicly.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and runtime-neutral checks
- [healthcheck-prometheus](../prometheus/README.md) — Prometheus text exporter

## License

MIT
