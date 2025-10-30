# @nexload-sdk/env

<div align="center">
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/env?style=flat-square" alt="npm version" />
  <br><br>
  <strong>Modern, type-safe, and extensible environment variable manager for fullstack JS/TS projects</strong>
</div>

---

## Features

- ⚡ **Type-safe:** Blazing fast, zero-runtime, schema-typed envs.
- 🛡️ **Automatic validation:** Checks type, required, and default values.
- 🔥 **Composable presets:** Designed for Node.js, Web, API, and CMS projects.
- 🚦 **Advanced logging:** Colored, context-aware feedback for every env load (missing/warn/fail/success).
- 🧩 **Extensible:** Add your own presets or extend built-ins easily.
- 🧠 **Cache control:** Fast repeated reads with safe override for live hot-reload.
- 📦 **Framework ready:** Perfect for Next.js, Node.js, tRPC, or any JavaScript back-end/front-end.

---

## Installation

```bash
pnpm add @nexload-sdk/env
# or
yarn add @nexload-sdk/env
# or
npm install @nexload-sdk/env
```

---

## Quick Start

### 1. Basic Usage

```typescript
import { EnvManager } from '@nexload-sdk/env';

const variables = {
  PORT:    { type: 'number', default: 4000 },
  NODE_ENV: { type: 'string', default: 'development' },
  DEBUG:    { type: 'boolean', default: false },
  JWT_SECRET: { type: 'string' },
};

const env = new EnvManager('MyService', variables);

// Retrieve env variable (string/number/boolean, type-safe)
const port = env.$('PORT');        // number | 4000
const isDev = env.$('NODE_ENV');   // string
const debug = env.$('DEBUG');      // boolean
```

### 2. With Built-in Presets

```typescript
import { EnvManager } from '@nexload-sdk/env';
import { $ApiServicePreset } from '@nexload-sdk/env/presets';

const env = new EnvManager('ApiService', $ApiServicePreset);

const webUrl = env.$('WEB_URL');          // string
const apiPort = env.$('PORT');            // number (default: 3000)
const secret = env.$('JWT_SECRET');       // string
```

---

## Presets

@env ships with out-of-the-box presets for typical JS/TS stacks:

- **$NodePreset**: Core node-related vars (`NODE_ENV`, `LOG_LEVEL`, ...)
- **$WebServicePreset**: For Next.js/web frontend (public/url, port...)
- **$ApiServicePreset**: For backend API services (URLs, secrets, ports)
- **$CmsServicePreset**: For CMS projects (admin, db, secrets)

```typescript
import { $NodePreset, $WebServicePreset, $ApiServicePreset, $CmsServicePreset } from '@nexload-sdk/env/presets';
```

Custom presets or overrides:

```typescript
import { merge } from '@nexload-sdk/env/manager/merge';
const CustomPreset = merge($ApiServicePreset, {
  OPTIONAL_FLAG: { type: 'boolean', default: true }
});
```

---

## API Reference

### `EnvManager<T>`

- `constructor(serviceName: string, variables: T)`
  - Instantiates a new environment manager with schema `T`.
  - Auto-validates and logs all missing/invalid/fallback envs.
- `env.$(key: keyof T, [cache]): T[key]` — Reads a variable, memoized (optional cache = true).
- Extends internal logger for colored output per variable.

#### Example Advanced Usage

```typescript
const env = new EnvManager('Billing', {
  TAX_RATE: { type: 'number', default: 0.09 },
  ENABLE_FEATURE: { type: 'boolean', default: false },
});

if (env.$('ENABLE_FEATURE')) {
  // feature code
}
```

---

## Best Practices & Structure

- Define all expected envs in one place (schema)
- Use presets where possible
- Always check for log output at service boot for misconfigs
- Use type annotations for business logic

---

## Contributing

1. Fork this repo, create a feature branch (`feat/name`)
2. Make your changes — ensure all types, tests, and lint pass
3. Follow commit message convention: `feat(scope): your description`
4. Open a pull request (PR) — BugBot checks and feedback required

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Scalable, modern, and robust developer tooling for next-generation software.
