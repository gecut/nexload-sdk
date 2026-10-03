# Healthcheck Payload: Payload CMS Health Readiness | Nexload SDK

Verify Payload CMS database connectivity, collection accessibility, and initialization state.

**Topic:** overview
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/
**Package:** `@nexload-sdk/healthcheck-payload`

**Current released version:** `2.1.0`

Payload CMS health checks for @nexload-sdk/healthcheck.

[npm](https://www.npmjs.com/package/@nexload-sdk/healthcheck-payload) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/healthcheck/payload)

`@nexload-sdk/healthcheck-payload` connects `@nexload-sdk/healthcheck` to Payload CMS 3 instance state, verifying database connectivity, adapter health, and collection availability.

***

## 10-Second Code Snippet

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { payloadReadinessCheck } from "@nexload-sdk/healthcheck-payload";
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });

export const health = createHealthManager({
  service: { name: "payload-cms" },
  checks: [
    payloadReadinessCheck(payload, {
      collection: "users",
      expectedMinDocuments: 1,
    }),
  ],
});
```

***

## What You Get

* **Database Connectivity Verification**: Executes lightweight count queries via Payload Local API to confirm database accessibility.
* **Boot Readiness Check**: Guarantees that Payload has finished compiling collections, globals, and plugins before Kubernetes directs traffic.
* **Zero Raw SQL/Mongo Dependency**: Interacts solely through the authoritative Payload Local API.

***

## Installation & Requirements

```bash
pnpm add @nexload-sdk/healthcheck-payload @nexload-sdk/healthcheck payload
```

Requires Payload CMS `>=3.85.0 <4.0.0` and Node.js `>=20.9.0`.

***

## Next Steps

* Explore [Production Guides & Queries](./guides/) for collection verification, timeout tuning, and troubleshooting.
* Check the [API Reference & Signatures](./api/) for check configuration options.
