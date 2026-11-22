# @nexload-sdk/payload-operations

Typed custom operations for Payload CMS with shared Zod contracts, secure server endpoints, and type-safe RPC clients.

[Documentation](https://gecut.github.io/nexload-sdk/packages/payload-operations/) ·
[API reference](https://gecut.github.io/nexload-sdk/packages/payload-operations/api/)

## Install

```bash
# Core package (pure contracts, error handling, server endpoints)
pnpm add @nexload-sdk/payload-operations payload zod

# If using createCMSClient with the native Payload REST SDK:
pnpm add @payloadcms/sdk
```

Requires Node `>=20.9.0` (for `/server`), Payload `>=3.85.0 <4`, and Zod `>=4.1.0 <5`. The package is ESM-only. `@payloadcms/sdk` (`>=3.85.0 <4.0.0`) is an optional peer dependency, required only for the `./cms` entry.

## Entry Points

To preserve clean bundle boundaries and prevent leaking Payload server code into client applications, `@nexload-sdk/payload-operations` exposes explicit subpaths:

| Subpath | Contents | Target / Runtime | Runtime Dependencies |
|---|---|---|---|
| `@nexload-sdk/payload-operations` (root) | `operation`, `defineCMSOperations`, `safe`, `isDefinedError`, `isTimeoutError`, and types | Universal (Browser/Node) | `zod` (no client, no payload, no `@payloadcms/sdk`) |
| `@nexload-sdk/payload-operations/contract` | `operation`, `defineCMSOperations`, and contract types | Universal (Browser/Node) | `zod` |
| `@nexload-sdk/payload-operations/errors` | `safe`, `isDefinedError`, `CMSOperationError`, `isCMSOperationError`, and types | Universal (Browser/Node) | None |
| `@nexload-sdk/payload-operations/client` | `createOperationsClient`, `defineClientPlugin`, and client transport types | Universal (Browser/Node) | `zod` (peer; no `@payloadcms/sdk` or `payload`) |
| `@nexload-sdk/payload-operations/cms` | `createCMSClient`, `createPayloadFetchAdapter`, and CMS client types | Universal (Browser/Node) | `@payloadcms/sdk` (optional peer) + `zod` |
| `@nexload-sdk/payload-operations/plugins/timeout` | `timeoutPlugin`, `isTimeoutError`, `TimeoutPluginOptions` | Universal (Browser/Node) | None |
| `@nexload-sdk/payload-operations/server` | `createPayloadEndpoints`, `CMSOperationError`, `DEFAULT_MAX_BODY_BYTES`, server types | **Node.js / Payload Server only** | `payload` + `zod` |

## Quick Start

### 1. Define the Shared Contract

Contracts are universal and safe to import anywhere (browser, server actions, workers):

```ts
import { defineCMSOperations, operation } from "@nexload-sdk/payload-operations";
import { z } from "zod";

const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});

export const appOperations = defineCMSOperations({
  inventory: {
    checkStock: operation({
      input: z.object({ sku: z.string().min(1) }),
      output: z.object({
        available: z.int().nonnegative(),
        sku: z.string(),
      }),
      errors: {
        SKU_NOT_FOUND: {
          message: "Requested SKU does not exist.",
          status: 404,
        },
      },
    }),
    reserve: operation({
      input: z.object({
        quantity: z.int().positive(),
        sku: z.string().min(1),
      }),
      output: z.object({
        expiresAt: dateCodec,
        reservationId: z.string().uuid(),
      }),
      errors: {
        OUT_OF_STOCK: {
          data: z.object({ available: z.int().nonnegative() }),
          message: "Insufficient quantity available in warehouse.",
          status: 409,
        },
      },
    }),
  },
});
```

### 2. Mount Server Endpoints in Payload Config

In `payload.config.ts`, mount the endpoints with required access control:

```ts
import { buildConfig } from "payload";
import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";
import { appOperations } from "./operations";

const operationEndpoints = createPayloadEndpoints({
  operations: appOperations,
  basePath: "/api/operations",
  access: {
    // access.default is REQUIRED (throws TypeError if missing)
    default: ({ req }) => Boolean(req.user),
    overrides: {
      inventory: {
        checkStock: () => true, // Public read check
      },
    },
  },
  handlers: {
    inventory: {
      checkStock: async ({ input, errors }) => {
        if (input.sku === "UNKNOWN") {
          throw errors.SKU_NOT_FOUND();
        }
        return { available: 42, sku: input.sku };
      },
      reserve: async ({ input, errors }) => {
        if (input.quantity > 10) {
          throw errors.OUT_OF_STOCK({ data: { available: 10 } });
        }
        // Handler returns z.output<output>, where expiresAt is a Date instance
        return {
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          reservationId: "123e4567-e89b-12d3-a456-426614174000",
        };
      },
    },
  },
});

export default buildConfig({
  endpoints: [...operationEndpoints],
  // ... collections, db, etc.
});
```

### 3. Consume from the Client

#### Option A: Pure Operations Client (`@nexload-sdk/payload-operations/client`)

Zero dependency on `@payloadcms/sdk`. Ideal for BFFs, external microservices, and client bundles:

```ts
import { createOperationsClient } from "@nexload-sdk/payload-operations/client";
import { isDefinedError, safe } from "@nexload-sdk/payload-operations";
import { appOperations } from "./operations";

const client = createOperationsClient({
  baseURL: "https://cms.example.com",
  basePath: "/api/operations",
  operations: appOperations,
});

const [error, reservation, isDefined] = await safe(
  client.inventory.reserve({ quantity: 2, sku: "ITEM-1" })
);

if (isDefined && isDefinedError(error, "OUT_OF_STOCK")) {
  console.warn(`Only ${error.data.available} items left.`);
} else if (reservation) {
  // reservation.expiresAt is decoded to a JavaScript Date instance
  console.log("Reserved until:", reservation.expiresAt.toISOString());
}
```

#### Option B: Integrated CMS Client (`@nexload-sdk/payload-operations/cms`)

Shares transport and credentials between custom operations and the native `PayloadSDK`:

```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/cms";
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";
import { appOperations } from "./operations";

const cms = createCMSClient({
  operations: appOperations,
  basePath: "/api/operations",
  payload: {
    baseURL: "https://cms.example.com",
    baseInit: { credentials: "include" },
  },
  plugins: [timeoutPlugin({ timeout: 5000 })],
});

// Native Payload SDK
const posts = await cms.payload.find({ collection: "posts" });

// Typed Custom Operations
const stock = await cms.operations.inventory.checkStock({ sku: "ITEM-1" });
```

## Codec Wire Model & Serialization

`@nexload-sdk/payload-operations` uses a bidirectional Zod codec architecture:

| Direction | Caller / Handler Type | Wire (JSON) | Mechanism |
|---|---|---|---|
| **Input** | Caller passes `z.input<input>` | Caller's value as JSON | Client pre-validates with `safeParseAsync` for fast `422`, then sends the **original** JSON-serializable input. The server runs `safeParseAsync` so defaults and transforms run once on the server. |
| **Output** | Handler returns `z.output<output>` | `z.encodeAsync(output, result)` | Server encodes with `z.encodeAsync`. Unknown `z.object` keys are stripped automatically, guaranteeing internal and secret fields never leak. Client decodes via `z.decodeAsync(output, json)`. |
| **Defined Error Data** | Factory receives `z.output<data>` | `z.encodeAsync(data, value)` | Server encodes defined error data; client decodes via `z.decodeAsync(data, json)`. |

### Codec Safety Rule

Output schemas and defined-error `data` schemas must be **codec-safe**:
- Plain schemas (e.g. `z.string()`, `z.number()`, `z.object()`)
- Checks and overwrites (e.g. `z.string().trim()`, `z.string().toLowerCase()`)
- Symmetrical codecs via `z.codec(wireSchema, targetSchema, { decode, encode })`

> [!WARNING]
> Unidirectional `.transform()` calls in output or error-data schemas cannot be encoded by `z.encodeAsync` and will cause the server to return **500 INTERNAL_SERVER_ERROR**. Always use `z.codec` for bidirectional types.

### Date Handling Example

Date objects should use `z.codec`:

```ts
import { operation } from "@nexload-sdk/payload-operations/contract";
import { z } from "zod";

export const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (dateObj) => dateObj.toISOString(),
});

export const orderOperation = operation({
  input: z.object({ orderId: z.string() }),
  output: z.object({
    createdAt: dateCodec, // handler returns Date; wire sends ISO string; client receives Date
    orderId: z.string(),
  }),
});
```

### Unknown Keys & Data Leak Prevention

`z.object` encode drops unrecognized keys by default. Even if your handler returns extra internal properties (such as password hashes or internal IDs), they are stripped before serialization. If you explicitly want to pass extra keys, use `z.looseObject(...)` or `.passthrough()`.

## Server Endpoints & Access Control

### Required `access.default`

`createPayloadEndpoints` requires `access.default`. Omitting it throws `TypeError: createPayloadEndpoints requires access.default.` at configuration time:

```ts
createPayloadEndpoints({
  operations,
  handlers,
  access: {
    // REQUIRED: default access function for all operations
    default: ({ req, operation }) => Boolean(req.user),
    // Optional per-operation overrides
    overrides: {
      publicGroup: {
        publicOp: () => true,
      },
    },
  },
});
```

- When access returns `false` for an unauthenticated request, the endpoint returns **401 UNAUTHORIZED**.
- When access returns `false` for an authenticated request, the endpoint returns **403 FORBIDDEN**.

### Request Body Limit (`maxBodyBytes`)

`createPayloadEndpoints` limits incoming request bodies via `maxBodyBytes` (defaults to `1_048_576` bytes / 1 MiB):
- Checks the `Content-Length` header upfront to reject oversized payloads before buffering.
- Counts bytes during stream reading to abort if the stream exceeds the threshold.
- Oversized requests return **413 PAYLOAD_TOO_LARGE**.

```ts
createPayloadEndpoints({
  operations,
  handlers,
  access: { default: () => true },
  maxBodyBytes: 5_242_880, // Allow up to 5 MiB
});
```

## Known Limitations

- **No automatic transactions:** Operations do not automatically wrap database mutations in a transaction. If multi-step database consistency is required, manage transactions explicitly via Payload's transaction API.
- **Local API `overrideAccess: true`:** By default, Payload 3 `req.payload` Local API calls execute with `overrideAccess: true`. If collection-level access control must be enforced for the current user, pass `{ overrideAccess: false, req }` in each Local API call.

## Fixed in 2.0 (Previously Known Caveats)

- **Raw output leak:** Handlers now encode output via `z.encodeAsync`, dropping unknown keys and honoring schemas instead of serializing raw return values.
- **Unsafe default access:** `access.default` is strictly required at config time; operations are no longer implicitly exposed if access configuration is omitted.
- **Unbounded body read:** Stream reads are bounded by `maxBodyBytes` (default 1 MiB), preventing server OOM from unbounded request bodies.
- **Root runtime bloat:** Root and pure entries (`./client`, `./contract`, `./errors`, `./plugins/timeout`) have zero runtime dependency on `payload` or `@payloadcms/sdk`.
