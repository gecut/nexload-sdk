# @nexload-sdk/orpc-client

Minimal wrapper around oRPC client creation for server-side usage.

## Install

```bash
pnpm add @nexload-sdk/orpc-client
```

## Export

- default export: `ORPCClient` class

## Quick Start

```ts
import ORPCClient from "@nexload-sdk/orpc-client";
import type { AppRouter } from "./contract";

const factory = new ORPCClient<AppRouter>("http://localhost:3000");
const client = factory.createClient();
```

## Behavior

`ORPCClient`:

- reads env values using `@nexload-sdk/env`
- merges `@nexload-sdk/env/presets` node preset with `PAYLOAD_API_URL`
- builds default headers for RPC requests:
  - `Content-Type`
  - `Accept`
  - `Accept-Encoding`
  - `User-Agent`
  - `X-Service`
  - `X-Communication`

## Environment Variables

- `PAYLOAD_API_URL`: optional override for the constructor URL
- `NODE_ENV`
- `SERVICE_NAME`
- `LOG_LEVEL` (through logger)

## API

### `new ORPCClient(defaultApiUrl?)`

Creates a client factory instance.

### `createClient(options?)`

Returns a typed `ContractRouterClient<TRouter>` using `@orpc/client` + fetch `RPCLink`.

## Notes

- This package currently uses oRPC's fetch link directly.
