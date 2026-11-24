# Core Primitives

This document covers the foundational runtime primitive in `nexload-sdk`: `@nexload-sdk/logger` in `packages/logger`.

Environment variables: `@nexload-sdk/env` is deprecated and removed from this repository. Validate environment variables with [`@t3-oss/env-core`](https://env.t3.gg/) or `@t3-oss/env-nextjs`.

---

## 1. `@nexload-sdk/logger`

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

`@nexload-sdk/payload-fields` remains in `packages/refactoring/`. Its public package identity and release lifecycle remain first-class.
