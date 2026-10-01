# @nexload-sdk/env

Type-safe environment variable reader with schema definitions, presets, and a small merge utility.

## Install

```bash
pnpm add @nexload-sdk/env
```

## Exports

- `EnvManager`
- `merge`
- presets from `@nexload-sdk/env/presets`

## Quick Start

```ts
import { EnvManager } from "@nexload-sdk/env";

const env = new EnvManager({
  PORT: { type: "number", default: 3000 },
  NODE_ENV: { type: "string", default: "development" },
  DEBUG: { type: "boolean", default: false },
  JWT_SECRET: { type: "string" }
});

const port = env.$("PORT");
const debug = env.$("DEBUG");
const secret = env.$("JWT_SECRET");
```

## Presets

```ts
import { EnvManager, merge } from "@nexload-sdk/env";
import { $ApiServicePreset, $NodePreset } from "@nexload-sdk/env/presets";

const env = new EnvManager(
  merge($NodePreset, $ApiServicePreset, {
    FEATURE_FLAG: { type: "boolean", default: true }
  })
);
```

Built-in presets:

- `$NodePreset`
- `$WebServicePreset`
- `$ApiServicePreset`
- `$CmsServicePreset`

## API

### `new EnvManager(schema)`

Creates an env manager and immediately:

- validates the declared keys against `process.env`
- loads all declared values into an internal cache

### `env.$(key, cache = true)`

Returns a cached typed value (`string | number | boolean`) based on the field definition.

### `merge(...schemas)`

Merges multiple env schemas while preserving TypeScript inference.

## Notes / Caveats

- Validation logs warnings/errors but does not throw.
- Values are read from `process.env` and coerced by the declared `type`.
- Logging is guarded by a global flag (`globalThis.envFirstLogging`), which is `false` by default in this package.
