# Core Primitives

This document covers the foundational runtime primitives in `nexload-sdk`: `@nexload-sdk/env` and `@nexload-sdk/logger`. `@nexload-sdk/env` resides in `packages/refactoring/env` and `@nexload-sdk/logger` in `packages/logger`; they provide zero-friction, cross-environment utilities for all applications and packages.

---

## 1. `@nexload-sdk/env`

### Overview
- **Location:** `packages/refactoring/env`
- **Published Name:** `@nexload-sdk/env`
- **Purpose:** Type-safe, validated environment variable manager for Node.js, Bun, and Next.js applications with composable presets and structured error diagnostics.

### Key Capabilities:
- **Type Coercion & Validation:** Reads from `process.env` (or custom sources) and parses strings into validated types (strings, booleans, integers, ports, URLs).
- **Composable Presets:** Pre-packaged environment definitions for common services:
  - Database presets (`DATABASE_URL`, `POSTGRES_USER`, etc.)
  - Server presets (`PORT`, `HOST`, `NODE_ENV`)
  - Payload presets (`PAYLOAD_SECRET`, `SERVER_URL`)
- **Fault-Tolerant Startup:** Collects all validation failures across the entire environment specification on boot, printing a consolidated diagnostic report via `@nexload-sdk/logger` before cleanly failing, rather than crashing on the first missing variable.

### Usage Example:
```typescript
import { createEnv, zEnv } from '@nexload-sdk/env';

export const env = createEnv({
  schema: {
    NODE_ENV: zEnv.enum(['development', 'production', 'test']).default('development'),
    PORT: zEnv.port().default(3000),
    DATABASE_URL: zEnv.url(),
    ENABLE_DEBUG: zEnv.boolean().default(false),
  },
});

// Fully type-safe:
console.log(env.PORT); // number
```

---

## 2. `@nexload-sdk/logger`

- **Location:** `packages/logger`
- **Published Name:** `@nexload-sdk/logger`
- **Purpose:** Configure-once structured logging built on pino for Node, Bun, Edge and browser.

Configure with `configureLogger({ service })` at runtime startup and import the lazy `logger` proxy anywhere. Object-bound children follow later configuration. Levels are `trace`, `debug`, `info`, `success`, `warn`, `error`, and `fatal`. Default redaction covers sensitive keys at the top level and one level deep, plus specific header and body paths; deeper paths require explicit configuration. Errors under `err` are serialized. Node request context uses `withLogContext` and trace helpers; Edge and browser context is pass-through. Tests can use `createTestLogger` from `@nexload-sdk/logger/testing`. See the [package README](../../packages/logger/README.md) for configuration, runtime limits, and migration.

```typescript
import { configureLogger, logger } from '@nexload-sdk/logger';

configureLogger({ service: 'api-server' });
logger.info({ event: 'app.lifecycle.started' }, 'Server started');
```

## 3. Note on the `packages/refactoring/` Directory

`@nexload-sdk/env` and `@nexload-sdk/payload-fields` remain in `packages/refactoring/`. Their public package identities and release lifecycles remain first-class.
