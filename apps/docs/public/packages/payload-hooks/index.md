# Overview & Quick Start

Audit Payload collection operations with structured log events.

**Topic:** overview
**Package:** `@nexload-sdk/payload-hooks` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-hooks/
**Package:** `@nexload-sdk/payload-hooks`

**Workspace version:** `2.1.0`

Effortless, type-safe logging for Payload CMS collection operations.

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-hooks) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-hooks)

`auditPlugin` attaches log-only collection hooks. It stores no audit records and does not change collection fields.

**Upcoming release:** this page documents `@nexload-sdk/payload-hooks` 3.0.0, which ships with the next Changesets release and is not on npm yet.

## Installation

```bash
pnpm add @nexload-sdk/payload-hooks payload
```

## Quick Start

```ts
import { auditPlugin } from "@nexload-sdk/payload-hooks";

const plugins = [auditPlugin({ operations: ["create", "update", "delete", "read", "auth"] })];
```

Reads are off by default; auth is on for auth collections. See [guides](./guides/) for event names, options, and transaction caveats. Payload `>=3.85.0 <4.0.0` is a peer dependency; the hooks run in Node.js Payload configuration.

## Next steps

[Optimization](./optimization/)

[Agent usage](./agents/)
