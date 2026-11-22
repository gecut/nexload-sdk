# Production Guides & Recipes

Advanced multi-resource contract patterns, Payload server endpoints with RBAC, transport plugins, safe error matching, Next.js server actions, and troubleshooting.

**Topic:** guides
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/guides/
## Multi-Resource Operations Tree

In real-world applications, operations should be grouped by domain resources instead of maintaining a flat list. `@nexload-sdk/payload-operations` supports arbitrary tree nesting:

```ts
import { defineCMSOperations, operation } from "@nexload-sdk/payload-operations";
import { z } from "zod";

const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});

export const cmsOperations = defineCMSOperations({
  auth: {
    login: operation({
      input: z.object({ email: z.string().email(), password: z.string().min(8) }),
      output: z.object({ token: z.string(), userId: z.string() }),
      errors: {
        INVALID_CREDENTIALS: { status: 401, message: "Invalid email or password." },
      },
    }),
    me: operation({
      input: z.void(),
      output: z.object({ email: z.string().email(), id: z.string() }),
    }),
  },

  inventory: {
    checkStock: operation({
      input: z.object({ sku: z.string() }),
      output: z.object({ available: z.number().int(), sku: z.string() }),
    }),
    reserve: operation({
      input: z.object({ sku: z.string(), quantity: z.number().int().positive() }),
      output: z.object({ reservationId: z.string(), expiresAt: dateCodec }),
      errors: {
        OUT_OF_STOCK: {
          status: 409,
          message: "Insufficient quantity available.",
          data: z.object({ available: z.number().int().nonnegative() }),
        },
      },
    }),
  },

  orders: {
    create: operation({
      input: z.object({
        items: z.array(z.object({ sku: z.string(), quantity: z.number().int() })),
      }),
      output: z.object({ orderId: z.string(), totalCents: z.number() }),
      errors: {
        PAYMENT_FAILED: {
          status: 402,
          message: "Payment declined by payment processor.",
          data: z.object({ gatewayCode: z.string() }),
        },
      },
    }),
  },
});
```

***

## Role-Based Access Control (RBAC) & Overrides

`access.default` is **strictly required** by `createPayloadEndpoints`. If missing, it throws `TypeError: createPayloadEndpoints requires access.default.` at configuration time.

You can specify default permissions and override them on a per-operation basis:

```ts
import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";
import { cmsOperations } from "./contract";

export const operationEndpoints = createPayloadEndpoints({
  operations: cmsOperations,
  access: {
    // Required default rule: Must be authenticated
    default: ({ req }) => Boolean(req.user),

    // Granular overrides
    overrides: {
      auth: {
        login: () => true, // Publicly accessible
      },
      inventory: {
        checkStock: () => true, // Public read check
      },
      orders: {
        // Only administrators can perform bulk admin operations
        create: ({ req }) => req.user?.collection === "users",
      },
    },
  },
  handlers: { /* ... handlers matching cmsOperations ... */ },
});
```

* When access returns `false` for an unauthenticated request, the endpoint returns **HTTP 401 Unauthorized**.
* When access returns `false` for an authenticated request with insufficient rights, it returns **HTTP 403 Forbidden**.

### Request Body Size Limiting (`maxBodyBytes`)

`createPayloadEndpoints` limits incoming request bodies via `maxBodyBytes` (defaults to `1_048_576` bytes / 1 MiB):

* Validates the incoming `Content-Length` header upfront to reject oversized requests before buffering.
* Streams the request body while counting bytes, aborting if the limit is exceeded.
* Oversized requests return **HTTP 413 Payload Too Large** (`PAYLOAD_TOO_LARGE`).

***

## Database Transactions & Local API Handlers

Handlers receive the incoming `req: PayloadRequest`, giving you direct access to `req.payload` for database queries:

> \[!NOTE]
> **Database Transactions & Local API Invariants:**
>
> * **No automatic transactions:** Operations do not automatically begin or commit database transactions. If your operation requires transactional integrity, manage transactions explicitly using Payload's transaction API.
> * **Local API `overrideAccess: true`:** By default, Payload 3 `req.payload` Local API calls run with `overrideAccess: true`. If collection-level access control must be enforced for the current user, pass `{ overrideAccess: false, req }` in each Local API call.

```ts
handlers: {
  orders: {
    create: async ({ input, errors, req }) => {
      // 1. Validate permissions and inventory
      const outOfStockItems: string[] = [];

      for (const item of input.items) {
        const stockRecord = await req.payload.find({
          collection: "inventory",
          where: { sku: { equals: item.sku } },
          limit: 1,
          req,
        });

        if ((stockRecord.docs[0]?.quantity ?? 0) < item.quantity) {
          outOfStockItems.push(item.sku);
        }
      }

      if (outOfStockItems.length > 0) {
        throw errors.OUT_OF_STOCK({
          data: { available: 0 },
        });
      }

      // 2. Persist order with caller user context
      const newOrder = await req.payload.create({
        collection: "orders",
        data: {
          items: input.items,
          customer: req.user?.id,
          status: "confirmed",
        },
        req,
      });

      return {
        orderId: String(newOrder.id),
        totalCents: 5000,
      };
    },
  },
}
```

***

## Codec Wire Model & Serialization

`@nexload-sdk/payload-operations` uses a bidirectional Zod codec architecture on the wire:

* **Handler output is encoded:** The handler returns `z.output<output>`. The server encodes this output using `z.encodeAsync(output, result)`. Unknown keys on `z.object` schemas are automatically stripped, preventing database internals or secret properties from leaking to callers (`z.looseObject` or `.passthrough()` enables passing extra keys as an explicit opt-in).
* **Client decodes:** The client decodes the JSON response with `z.decodeAsync(output, json)`, reconstructing rich types like `Date`.
* **Defined errors are encoded/decoded identically:** Defined error `data` schemas undergo the same `z.encodeAsync` on the server and `z.decodeAsync` on the client.
* **Client sends original input:** The client pre-validates input with `safeParseAsync` (rejecting invalid calls upfront with 422 `INPUT_VALIDATION_FAILED`), then serializes and sends the caller's original input value (`z.input`). Defaults and transforms execute once on the server. The caller's input must be JSON-serializable.

### Codec Safety Rule for Outputs

Because outputs are encoded via `z.encodeAsync`, output schemas and defined-error `data` schemas must be **codec-safe**:

* Standard types (`z.string()`, `z.number()`, `z.boolean()`, `z.object()`, `z.array()`)
* Checks and overwrites (`z.string().trim()`, `z.string().toLowerCase()`)
* Symmetrical codecs (`z.codec(wireSchema, targetSchema, { decode, encode })`)

> \[!CAUTION]
> Unidirectional `.transform()` calls in output or error schemas cannot be encoded by `z.encodeAsync`. Returning such a schema from a handler causes the server to fail with **500 INTERNAL\_SERVER\_ERROR**. Always use `z.codec` for transformations in output schemas.

### Handling Dates with `z.codec`

To pass JavaScript `Date` instances between server handlers and client callers:

```ts
import { operation } from "@nexload-sdk/payload-operations";
import { z } from "zod";

export const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (dateObj) => dateObj.toISOString(),
});

export const getEvent = operation({
  input: z.object({ id: z.string() }),
  output: z.object({
    id: z.string(),
    scheduledAt: dateCodec, // Handler returns Date; wire sends ISO string; client receives Date
  }),
});
```

***

## Client Transport Plugins

The client uses an extensible middleware pipeline (`CMSClientPlugin`) that wraps every fetch request for both custom operations and native Payload SDK methods:

### 1. Built-in Timeout Plugin

Enforces strict client-side timeout thresholds with automatic `AbortSignal` management:

```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/cms";
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";

const cms = createCMSClient({
  operations: cmsOperations,
  payload: { baseURL: "https://cms.example.com" },
  plugins: [
    timeoutPlugin({ timeout: 5_000 }), // 5-second timeout
  ],
});
```

### 2. Custom Authorization Bearer Plugin

Automatically attaches JWT tokens to outgoing requests:

```ts
import { defineClientPlugin } from "@nexload-sdk/payload-operations/client";

export const authBearerPlugin = (getToken: () => string | null) =>
  defineClientPlugin({
    name: "auth-bearer",
    wrapTransport: (next) => (request) => {
      const token = getToken();
      if (!token) return next(request);

      const headers = new Headers(request.init.headers);
      headers.set("Authorization", `Bearer ${token}`);

      return next({
        ...request,
        init: { ...request.init, headers },
      });
    },
  });
```

### 3. Distributed Tracing & Metrics Plugin

Inspect request latency and differentiate operation calls from native Payload SDK calls:

```ts
import { defineClientPlugin } from "@nexload-sdk/payload-operations/client";

export const tracingPlugin = defineClientPlugin({
  name: "tracing",
  wrapTransport: (next) => async (request) => {
    const started = performance.now();
    const response = await next(request);
    const duration = performance.now() - started;

    if (request.source === "operation" && request.operation) {
      console.log(`[Op: ${request.operation.path}] took ${duration.toFixed(2)}ms`);
    }

    return response;
  },
});
```

### 4. Pure Operations Client (Without Payload SDK)

If your frontend or BFF only calls custom operations and does not need the native Payload SDK:

```ts
import { createOperationsClient } from "@nexload-sdk/payload-operations/client";
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";

const client = createOperationsClient({
  baseURL: "https://cms.example.com",
  basePath: "/api/operations",
  operations: cmsOperations,
  plugins: [timeoutPlugin({ timeout: 5_000 })],
});

const stock = await client.inventory.checkStock({ sku: "TSHIRT-1" });
```

***

## Safe Error Pattern-Matching

Instead of messy `try/catch` blocks, use the `safe()` tuple utility. It differentiates declared business errors from catastrophic framework failures:

```ts
import { isDefinedError, isTimeoutError, safe } from "@nexload-sdk/payload-operations";

const [error, reservation, isDefined] = await safe(
  cms.operations.inventory.reserve({
    sku: "MACBOOK-M3",
    quantity: 1,
  })
);

// 1. Discriminated domain errors (statically typed by contract)
if (isDefined && isDefinedError(error, "OUT_OF_STOCK")) {
  console.warn("Out of stock! Available units:", error.data.available);
  return;
}

// 2. Client timeout error
if (isTimeoutError(error)) {
  console.error("The operation timed out after 5 seconds.");
  return;
}

// 3. Catastrophic errors (network failure, 500 server crash, malformed response)
if (error !== null || !reservation) {
  console.error("Unexpected error:", error);
  return;
}

// 4. Success path (fully typed output)
console.log("Reserved successfully! ID:", reservation.reservationId);
```

***

## Next.js App Router Integration (Server Actions)

Consume operations seamlessly in Next.js Server Actions with zero hydration overhead:

```ts
"use server";

import { cms } from "@/lib/cms";
import { isDefinedError, safe } from "@nexload-sdk/payload-operations";
import { revalidatePath } from "next/cache";

export async function placeOrderAction(formData: FormData) {
  const sku = String(formData.get("sku"));
  const quantity = Number(formData.get("quantity"));

  const [error, order, isDefined] = await safe(
    cms.operations.orders.create({
      items: [{ sku, quantity }],
    })
  );

  if (isDefined) {
    if (isDefinedError(error, "PAYMENT_FAILED")) {
      return { ok: false, error: "Payment was declined by payment gateway." };
    }
  }

  if (error) {
    return { ok: false, error: "An unexpected error occurred." };
  }

  revalidatePath("/orders");
  return { ok: true, orderId: order.orderId };
}
```

***

## Troubleshooting & Common Pitfalls

### 1. `INPUT_VALIDATION_FAILED` (No Network Request Sent)

Input validation happens on the client before the request is dispatched. If your client method throws or rejects immediately, check the Zod schema requirements (e.g. required string length, email regex, integer bounds).

### 2. Endpoint Responds with 401 or 403

`access.default` is required. The default access policy determines baseline permissions for all operations. If access returns `false` and `req.user` is absent, the endpoint returns **401 Unauthorized**. If `req.user` is present, it returns **403 Forbidden**. To make an operation publicly accessible, add an explicit override:

```ts
access: {
  default: ({ req }) => Boolean(req.user),
  overrides: {
    auth: { login: () => true },
  },
}
```

### 3. Route Returns 404 Not Found

* Verify that both client (`createCMSClient` or `createOperationsClient`) and `createPayloadEndpoints` use the identical `basePath` (e.g. `"/api/operations"`).
* Make sure you spread `...operationEndpoints` into Payload's `endpoints` array in `payload.config.ts`.
* Ensure `baseURL` contains only the origin and API mount, without query strings or trailing hash tags.

### 4. Browser CORS Pre-flight (`OPTIONS`) Failure

`createPayloadEndpoints` generates matching `OPTIONS` endpoints for every operation. Ensure your Payload server has CORS headers configured for your client origin:

```ts
// payload.config.ts
export default buildConfig({
  cors: ["https://myfrontend.com"],
  csrf: ["https://myfrontend.com"],
  endpoints: [...operationEndpoints],
});
```

### 5. Domain Error Was Downgraded to Internal Error

If a handler throws an error object that doesn't match the contract's defined status or code, the server boundary deliberately downgrades it to an `INTERNAL_ERROR` to protect internal stack traces from leaking. **Always use the handler's injected error factories**:

```ts
// Correct
throw errors.OUT_OF_STOCK({ data: { available: 5 } });

// Incorrect
throw new Error("Out of stock");
```

### 6. Endpoint Responds with 413 Payload Too Large

`createPayloadEndpoints` enforces `maxBodyBytes` (default 1 MiB / `1_048_576`). Requests exceeding this limit return `PAYLOAD_TOO_LARGE`. If your endpoint legitimately requires larger payloads, increase `maxBodyBytes`:

```ts
createPayloadEndpoints({
  operations,
  handlers,
  access: { default: () => true },
  maxBodyBytes: 10_485_760, // 10 MiB
});
```

### 7. Server Responds with 500 During Response Encoding

If your handler output schema uses a unidirectional `.transform()`, `z.encodeAsync` cannot invert it to JSON wire format and throws an error, resulting in a 500 `INTERNAL_SERVER_ERROR`. Replace unidirectional transforms in output schemas with `z.codec(wireSchema, targetSchema, { decode, encode })`.

***

## Migrating to 2.0

`@nexload-sdk/payload-operations` 2.0 introduces secure-by-default execution, strict boundary isolation, bidirectional codecs, and a lightweight standalone client.

### New in 2.0

* **Pure client entry (`@nexload-sdk/payload-operations/client`):** Standalone RPC client via `createOperationsClient` with zero runtime dependency on `payload` or `@payloadcms/sdk`.
* **Codec wire model:** Symmetrical output and defined-error encoding via `z.encodeAsync`, automatically dropping unknown `z.object` keys to prevent sensitive data leaks.
* **Bidirectional Date handling:** Full support for `Date` instances using `z.codec(z.iso.datetime(), z.date(), { decode, encode })`.
* **Request body limits:** Built-in `maxBodyBytes` (default 1 MiB) with fast-fail `Content-Length` checks and stream byte counting returning 413 `PAYLOAD_TOO_LARGE`.
* **Enforced access control:** `access.default` is required at config time; missing it throws `TypeError`.
* **Complete test coverage:** Full automated test suite for contract traversal, access evaluation, codec roundtrips, and SQLite integration.

### Breaking Changes & Migration Steps

#### 1. `createCMSClient` moved to `@nexload-sdk/payload-operations/cms`

The integrated client that wraps the native `PayloadSDK` now lives in its own `./cms` subpath:

Before (1.0):

```ts
// Exported from package root in 1.0 (removed from root in 2.0)
// import { createCMSClient } from "<package-root>";
```

After (2.0):

```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/cms";
```

#### 2. `timeoutPlugin` moved to `@nexload-sdk/payload-operations/plugins/timeout`

The timeout plugin is no longer exported from the package root:

Before (1.0):

```ts
// Exported from package root in 1.0 (removed from root in 2.0)
// import { timeoutPlugin } from "<package-root>";
```

After (2.0):

```ts
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";
```

#### 3. `createOperationsClient` is public in `@nexload-sdk/payload-operations/client`

For clients that do not need the Payload REST SDK, import `createOperationsClient` from `./client`:

Before (1.0):

```ts
// In 1.0, only createCMSClient was available (requiring @payloadcms/sdk)
const cms = createCMSClient({
  operations,
  payload: { baseURL: "https://cms.example.com" },
});
```

After (2.0):

```ts
// Pure RPC client with zero @payloadcms/sdk dependency
import { createOperationsClient } from "@nexload-sdk/payload-operations/client";

const client = createOperationsClient({
  baseURL: "https://cms.example.com",
  operations,
});
```

#### 4. Client sends original input value

Clients pre-validate input with `safeParseAsync` and then serialize and transmit the original input value (`z.input`). Defaults and transformations execute once on the server. Input values must be JSON-serializable:

Before (1.0):

```ts
// Client transformed values before transmission
const input = z.string().transform((val) => val.trim());
```

After (2.0):

```ts
// Transforms and defaults execute once on the server; caller passes original input
const input = z.string().trim();
```

#### 5. `access.default` is required in `createPayloadEndpoints`

Omitting `access.default` now throws a `TypeError` at config time instead of silently defaulting to `Boolean(req.user)`:

Before (1.0):

```ts
// access.default was optional
const endpoints = createPayloadEndpoints({
  operations,
  handlers,
});
```

After (2.0):

```ts
// access.default is strictly required
const endpoints = createPayloadEndpoints({
  operations,
  handlers,
  access: {
    default: ({ req }) => Boolean(req.user),
  },
});
```

#### 6. Handler return type is `z.output<output>` and is encoded

Handlers must return `z.output<output>`. The server encodes the result with `z.encodeAsync`, and unrecognized keys on `z.object` schemas are dropped:

Before (1.0):

```ts
// Handlers could return extra unmodeled fields that leaked to the client
handlers: {
  getUser: async () => ({
    id: "user-1",
    email: "user@example.com",
    passwordHash: "$2b$10$...", // leaked!
  }),
}
```

After (2.0):

```ts
// Handler returns z.output<output>; server encodes and drops unmodeled keys
handlers: {
  getUser: async () => ({
    id: "user-1",
    email: "user@example.com",
  }),
}
```

#### 7. Output and error-data schemas must be codec-safe

Unidirectional `.transform()` calls in output or error-data schemas cannot be encoded by `z.encodeAsync` (which causes a 500 error). Use `z.codec` instead:

Before (1.0):

```ts
// One-way transform in output schema
output: z.object({
  expiresAt: z.iso.datetime().transform((s) => new Date(s)),
})
```

After (2.0):

```ts
// Bidirectional codec using z.codec
const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});

output: z.object({
  expiresAt: dateCodec,
})
```

#### 8. Zod floor raised to `>=4.1.0 <5.0.0`

Codec encoding and decoding require Zod 4.1+:

Before (1.0):

```json
"peerDependencies": {
  "zod": ">=4.0.0 <5.0.0"
}
```

After (2.0):

```json
"peerDependencies": {
  "zod": ">=4.1.0 <5.0.0"
}
```

#### 9. `@payloadcms/sdk` is an optional peer dependency

`@payloadcms/sdk` is only required if you import `@nexload-sdk/payload-operations/cms`:

Before (1.0):

```bash
# @payloadcms/sdk was a required peer dependency for all use cases
pnpm add @payloadcms/sdk
```

After (2.0):

```bash
# Install @payloadcms/sdk only if using createCMSClient from ./cms
pnpm add @payloadcms/sdk
```

#### 10. Request body size limit (`maxBodyBytes`)

Incoming request bodies exceeding `maxBodyBytes` (default 1 MiB) are now rejected with HTTP 413:

Before (1.0):

```ts
// Unbounded body reads could cause server out-of-memory errors
createPayloadEndpoints({ operations, handlers });
```

After (2.0):

```ts
// Bodies over maxBodyBytes (default 1_048_576 bytes) return 413 PAYLOAD_TOO_LARGE
createPayloadEndpoints({
  operations,
  handlers,
  access: { default: () => true },
  maxBodyBytes: 2_097_152, // Custom 2 MiB limit (optional)
});
```

***

## Migration from Legacy Custom Handlers

When migrating from ad-hoc Payload REST routes:

1. Move request/response validation logic into `operation({ input, output, errors })`.
2. Replace manual `new Response(JSON.stringify(...))` with standard async return values.
3. Remove manual `req.json()` calls; input is parsed and injected directly into `({ input })`.
