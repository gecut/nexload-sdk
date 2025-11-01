# @nexload-sdk/pool-fetch

Fast, resilient, modular fetch client for Node.js — with automatic undici connection pooling, runtime resilience, and full Next.js & SSR compatibility.

## Features

- ⚡ **Connection Pooling**: Automatic per-origin undici pooling for maximum Node.js network efficiency
- 🔄 **Graceful Fallback**: If undici fails, falls back to native fetch API with diagnostic headers
- 🛡 **Resilient by Design**: Handles connection cleanup, process shutdowns, and runtime detection (Next.js, Edge, CI)
- 🧩 **Modular Structure**: Clean layering — base client, pool manager, and undici-powered client
- 🔍 **Zero-Config Observability**: Health snapshot, detailed debug logs (via @nexload-sdk/logger)
- 🧪 **Full TypeScript & Workspace support**: Easy monorepo integration
- 🚀 **Latest standards**: Targets Next.js 15+, TypeScript 5.x, undici ^7.x

## Installation

```sh
pnpm add @nexload-sdk/pool-fetch
# or
npm install @nexload-sdk/pool-fetch
```

## Usage

Basic:

```typescript
import { UndiciHttpClient } from "@nexload-sdk/pool-fetch";

const httpClient = new UndiciHttpClient();

const resp = await httpClient.fetch("https://api.example.com/data", {
  method: "GET",
  headers: { "Authorization": "Bearer TOKEN" }
});

const json = await resp.json();
```

Advanced (Custom pool manager):

```typescript
import { UndiciHttpClient, ConnectionPoolManager } from "@nexload-sdk/pool-fetch";

const poolManager = ConnectionPoolManager.getInstance();

const client = new UndiciHttpClient(poolManager);

await client.fetch("https://microservice.internal/path");
```

## API

### `UndiciHttpClient`

- `.fetch(input, init?)`: Promise<Response>
  - Optimized pipeline: undici first, native fetch fallback
- Injectable poolManager for custom lifetime control

### `ConnectionPoolManager`

- `.getPool(url: string)`
- `.closeAll()`: Closes all pools
- `.getHealth()`: Returns health snapshot

### `BaseHttpClient` (for advanced extension)

- Provides reusable utility methods for HTTP client development

## Best Practices & Notes

- **Runs only in Node.js**: Not designed for browser execution
- **Optimized for SSR/ISR/Backend**
- **No runtime state sharing for Edge or on-demand stateless runners**
- Logs can be controlled via `@nexload-sdk/logger` config

## License

MIT © [S. MohammadMahdi Zamanian](https://mm25zamanian.ir)
