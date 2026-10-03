# Core Primitives

This document covers the foundational runtime primitives in `nexload-sdk`: `@nexload-sdk/env` and `@nexload-sdk/logger`. Both packages reside in `packages/refactoring/` and provide zero-friction, cross-environment utilities for all applications and packages.

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

### Overview
- **Location:** `packages/refactoring/logger`
- **Published Name:** `@nexload-sdk/logger`
- **Purpose:** High-performance, structured leveled logger with beautiful ANSI terminal formatting, contextual child tags, and JSON output mode.

### Key Capabilities:
- **Contextual Child Loggers:** Create scoped loggers (`logger.child('PaymentService')`) that prefix all messages with color-coded component tags.
- **Log Levels:** Strict level filtering: `debug`, `info`, `warn`, `error`, `fatal`.
- **Environment Awareness:** Automatically uses human-friendly color formatting in local development (`NODE_ENV=development`) and compact single-line JSON formatting in production environments (`NODE_ENV=production`) for log aggregators (Datadog, Loki, CloudWatch).
- **Zero Heavy Native Dependencies:** Avoids heavy C++ bindings or slow multi-megabyte logging frameworks.

### Usage Example:
```typescript
import { NexloadLogger } from '@nexload-sdk/logger';

const logger = new NexloadLogger({ name: 'api-server' });

logger.info('Server initialized on port 8080');

const orderLogger = logger.child('OrderProcessor');
orderLogger.debug('Processing order #1024', { totalAmount: 450000 });
orderLogger.error('Payment gateway timeout', new Error('Gateway unreachable'));
```

---

## 3. Note on the `packages/refactoring/` Directory

Both `@nexload-sdk/env` and `@nexload-sdk/logger` (along with `@nexload-sdk/payload-fields`) are situated inside `packages/refactoring/`.

> [!NOTE]
> This folder reflects a past internal reorganization during which these packages underwent significant architectural modernizations. Their public package identity (`@nexload-sdk/env`, `@nexload-sdk/logger`) and release lifecycle are completely stable and first-class. They are not experimental.
