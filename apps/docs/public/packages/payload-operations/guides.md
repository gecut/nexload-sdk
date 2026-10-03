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
      output: z.object({ reservationId: z.string(), expiresAt: z.string() }),
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

By default, `createPayloadEndpoints` applies `access.default` to all operations. If unspecified, it enforces `Boolean(req.user)`.

You can override permissions on a per-operation basis:

```ts
import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";
import { cmsOperations } from "./contract";

export const operationEndpoints = createPayloadEndpoints({
  operations: cmsOperations,
  access: {
    // Default rule: Must be authenticated
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

***

## Database Transactions & Local API Handlers

Handlers receive the incoming `req: PayloadRequest`, giving you direct access to `req.payload` for transactional database queries:

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

## Client Transport Plugins

The client uses an extensible middleware pipeline (`CMSClientPlugin`) that wraps every fetch request for both custom operations and native Payload SDK methods:

### 1. Built-in Timeout Plugin

Enforces strict client-side timeout thresholds with automatic `AbortSignal` management:

```ts
import { createCMSClient, timeoutPlugin } from "@nexload-sdk/payload-operations";

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
import { defineClientPlugin } from "@nexload-sdk/payload-operations";

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

The default access policy requires an authenticated user (`req.user`). If an endpoint should be public, add an explicit override in `createPayloadEndpoints`:

```ts
access: {
  overrides: {
    auth: { login: () => true },
  },
}
```

### 3. Route Returns 404 Not Found

* Verify that both `createCMSClient` and `createPayloadEndpoints` use the identical `basePath` (e.g. `"/api/operations"`).
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

***

## Migration from Legacy Custom Handlers

When migrating from ad-hoc Payload REST routes:

1. Move request/response validation logic into `operation({ input, output, errors })`.
2. Replace manual `new Response(JSON.stringify(...))` with standard async return values.
3. Remove manual `req.json()` calls; input is parsed and injected directly into `({ input })`.
