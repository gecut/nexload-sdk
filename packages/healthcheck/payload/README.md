# @nexload-sdk/healthcheck-payload

**Payload CMS readiness health check for `@nexload-sdk/healthcheck`.**

[Documentation](https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/) · [API reference](https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/api/)

[![npm version](https://img.shields.io/npm/v/@nexload-sdk/healthcheck-payload)](https://www.npmjs.com/package/@nexload-sdk/healthcheck-payload)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Module: ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-green.svg)
![Runtime: Node | Payload 3](https://img.shields.io/badge/runtime-Node%20%7C%20Payload%203-lightgrey.svg)

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

`@nexload-sdk/healthcheck-payload` provides `payloadHealthCheck(payload, options)` to verify that Payload CMS and its underlying database can execute a controlled Local API `payload.find()` query. It solves silent database/CMS initialization failures without importing `payload` into `@nexload-sdk/healthcheck` core. It is for Payload 3 services exposing readiness or diagnostics probes.

What it is not:

- Not a database migration or schema validation check.
- Not a liveness probe; database failures should fail readiness, not restart the process.

## Philosophy

- **Controlled minimal query:** Defaults to `limit: 1`, `depth: 0`, and `scopes: ["readiness"]` so readiness checks stay fast and predictable.
- **Structural `Payload` typing:** Accepts any `Pick<Payload, "find">` instance without forcing a hard runtime dependency on `payload`.

## Install

```bash
pnpm add @nexload-sdk/healthcheck @nexload-sdk/healthcheck-payload payload
# or
npm install @nexload-sdk/healthcheck @nexload-sdk/healthcheck-payload payload
```

| Package | Range | Required / Optional |
| --- | --- | --- |
| `payload` | `>=3` | Optional peer, used only for types; your app supplies an initialized Payload instance |

## Quick start

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });

export const health = createHealthManager({
  service: { name: "cms" },
  checks: [
    payloadHealthCheck(payload, {
      collection: "users",
      limit: 1,
      depth: 0,
    }),
  ],
});
```

## Usage

### Enforcing minimum document count

Use `expectedMinDocuments` only when an empty collection indicates an operationally unhealthy state (for example, unseeded required configuration):

```ts
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

const seededCheck = payloadHealthCheck(payload, {
  collection: "settings",
  limit: 1,
  expectedMinDocuments: 1,
  timeoutMs: 2000,
});
```

## API

### Root entry (`@nexload-sdk/healthcheck-payload`)

| Export | Kind | Summary |
| --- | --- | --- |
| `payloadHealthCheck` | `function` | Creates a `"payload"` `HealthCheckDefinition` running `payload.find()` |
| `PayloadHealthCheckOptions` | `interface` | Options for `payloadHealthCheck` |

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collection` | `string` | Required | Collection slug to query |
| `limit` | `number` | `1` | Max documents requested in `payload.find()` |
| `depth` | `number` | `0` | Relationship population depth |
| `where` | `Record<string, unknown>` | `undefined` | Optional Payload `where` filter |
| `expectedMinDocuments` | `number` | `undefined` | Minimum `totalDocs` required to report `"ok"` |
| `timeoutMs` | `number` | Manager default | Per-check timeout override |
| `scopes` | `readonly HealthScope[]` | `["readiness"]` | Scopes where the check runs |

## Runtime and compatibility

- **Module format:** Dual ESM (`import`) and CJS (`require`).
- **Runtime:** Node.js / Payload 3 (`>=3`).

## Caveats

> [!WARNING]
> Always target a small, deterministic collection with `depth: 0` and a narrow `where` clause. Heavy queries on readiness endpoints can overload the database under frequent Kubernetes polling.

> [!NOTE]
> `payloadHealthCheck` sets `critical: { readiness: true, diagnostics: false }`. Failures emit `HEALTH_ERROR_CODES.PAYLOAD_QUERY_FAILED`.

## Related packages

- [healthcheck](../core/README.md) — Core `HealthManager` and `HEALTH_ERROR_CODES`
- [healthcheck-node](../node/README.md) — Node.js runtime and TCP/DNS probes

## License

MIT
