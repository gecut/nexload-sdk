import {
  createCMSClient,
  defineClientPlugin,
  defineCMSOperations,
  isDefinedError,
  isTimeoutError,
  operation,
  safe,
  timeoutPlugin,
  type InferOperationsClient,
} from "@nexload-sdk/payload-operations";
import type {
  InferOperationInput,
  InferOperationOutput,
} from "@nexload-sdk/payload-operations/contract";

import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";
import { z } from "zod";

// ============================================================================
// 1. Contract Definition: Multi-Resource Operations Tree
// ============================================================================

export const appOperations = defineCMSOperations({
  auth: {
    login: operation({
      input: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
      output: z.object({
        token: z.string(),
        user: z.object({
          email: z.string().email(),
          id: z.string(),
          role: z.enum(["admin", "customer"]),
        }),
      }),
      errors: {
        INVALID_CREDENTIALS: {
          message: "Incorrect email or password.",
          status: 401,
        },
        USER_SUSPENDED: {
          data: z.object({ reason: z.string(), suspendedUntil: z.string() }),
          message: "Your account is temporarily suspended.",
          status: 403,
        },
      },
    }),
    me: operation({
      input: z.void(),
      output: z.object({
        email: z.string().email(),
        id: z.string(),
        role: z.enum(["admin", "customer"]),
      }),
      errors: {
        UNAUTHORIZED: {
          message: "Session expired or missing.",
          status: 401,
        },
      },
    }),
  },

  inventory: {
    checkStock: operation({
      input: z.object({ sku: z.string().min(1) }),
      output: z.object({
        available: z.int().nonnegative(),
        sku: z.string(),
      }),
      errors: {
        SKU_NOT_FOUND: {
          message: "Requested SKU does not exist in catalog.",
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
        expiresAt: z.iso.datetime().transform((val) => new Date(val)),
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

  orders: {
    create: operation({
      input: z.object({
        customerEmail: z.string().email(),
        items: z
          .array(
            z.object({
              quantity: z.int().positive(),
              sku: z.string().min(1),
            }),
          )
          .min(1),
        shippingAddress: z.object({
          city: z.string().min(1),
          postalCode: z.string().min(1),
          street: z.string().min(1),
        }),
      }),
      output: z.object({
        createdAt: z.iso.datetime().transform((val) => new Date(val)),
        orderId: z.string(),
        status: z.enum(["pending_payment", "confirmed"]),
        totalCents: z.int().positive(),
      }),
      errors: {
        PAYMENT_FAILED: {
          data: z.object({ errorCode: z.string(), gateway: z.string() }),
          message: "Payment transaction declined by gateway.",
          status: 402,
        },
        STOCK_EXHAUSTED: {
          data: z.object({ unavailableSkus: z.array(z.string()) }),
          message: "One or more items in the cart are no longer in stock.",
          status: 409,
        },
      },
    }),
    cancel: operation({
      input: z.object({
        orderId: z.string(),
        reason: z.string().min(3),
      }),
      output: z.object({
        cancelledAt: z.iso.datetime().transform((val) => new Date(val)),
        orderId: z.string(),
      }),
      errors: {
        ORDER_NOT_FOUND: {
          message: "Target order does not exist.",
          status: 404,
        },
        ORDER_SHIPPED: {
          message: "Orders that have already shipped cannot be cancelled.",
          status: 400,
        },
      },
    }),
  },
});

// Type helpers derived from contract
export type AppOperations = typeof appOperations;
export type AppClient = InferOperationsClient<AppOperations>;
export type CreateOrderInput = InferOperationInput<typeof appOperations.orders.create>;
export type CreateOrderOutput = InferOperationOutput<typeof appOperations.orders.create>;

// ============================================================================
// 2. Server Endpoints Assembly (Mounted in payload.config.ts)
// ============================================================================

const basePath = "/api/operations";

export const appEndpoints = createPayloadEndpoints({
  access: {
    // Default rule: All operations require an authenticated user
    default: ({ req }) => Boolean(req.user),
    // Granular overrides: Public operations bypass authentication
    overrides: {
      auth: {
        login: () => true,
      },
      inventory: {
        checkStock: () => true,
      },
    },
  },
  basePath,
  handlers: {
    auth: {
      login: async ({ errors, input }) => {
        if (input.email === "locked@example.com") {
          throw errors.USER_SUSPENDED({
            data: {
              reason: "Security flag",
              suspendedUntil: new Date(Date.now() + 86400000).toISOString(),
            },
          });
        }
        if (input.password !== "correct-password-123") {
          throw errors.INVALID_CREDENTIALS();
        }

        return {
          token: "jwt-token-sample-value",
          user: {
            email: input.email,
            id: "user-123",
            role: "customer" as const,
          },
        };
      },
      me: async ({ errors, req }) => {
        if (!req.user) {
          throw errors.UNAUTHORIZED();
        }

        return {
          email: String(req.user.email ?? ""),
          id: String(req.user.id),
          role: "customer" as const,
        };
      },
    },

    inventory: {
      checkStock: async ({ errors, input }) => {
        if (input.sku === "MISSING-SKU") {
          throw errors.SKU_NOT_FOUND();
        }

        return {
          available: 42,
          sku: input.sku,
        };
      },
      reserve: async ({ errors, input }) => {
        if (input.quantity > 10) {
          throw errors.OUT_OF_STOCK({ data: { available: 10 } });
        }

        return {
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          reservationId: "123e4567-e89b-12d3-a456-426614174000",
        };
      },
    },

    orders: {
      create: async ({ errors, input }) => {
        if (input.items.some((item) => item.sku === "OUT-OF-STOCK")) {
          throw errors.STOCK_EXHAUSTED({
            data: { unavailableSkus: ["OUT-OF-STOCK"] },
          });
        }

        const totalCents = input.items.reduce(
          (acc, item) => acc + item.quantity * 2_500,
          0,
        );

        return {
          createdAt: new Date().toISOString(),
          orderId: `ORD-${Date.now()}`,
          status: "pending_payment" as const,
          totalCents,
        };
      },
      cancel: async ({ errors, input }) => {
        if (input.orderId === "ORD-SHIPPED") {
          throw errors.ORDER_SHIPPED();
        }
        if (input.orderId === "ORD-UNKNOWN") {
          throw errors.ORDER_NOT_FOUND();
        }

        return {
          cancelledAt: new Date().toISOString(),
          orderId: input.orderId,
        };
      },
    },
  },
  operations: appOperations,
});

// ============================================================================
// 3. Client Factory with Plugins (Bearer Auth & Tracing)
// ============================================================================

// Custom plugin to inject authorization bearer header
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

// Custom plugin to record operation request latency
export const metricsTracingPlugin = defineClientPlugin({
  name: "metrics-tracing",
  wrapTransport: (next) => async (request) => {
    const start = performance.now();
    const response = await next(request);
    const duration = performance.now() - start;

    if (request.operation) {
      // Log or export telemetry metrics
      void duration;
    }

    return response;
  },
});

let currentToken: string | null = null;
export function setAuthToken(token: string | null) {
  currentToken = token;
}

export const cmsClient = createCMSClient({
  basePath,
  operations: appOperations,
  payload: {
    baseInit: {
      credentials: "include",
      headers: { "X-Client-App": "web-storefront" },
    },
    baseURL: "https://cms.example.com",
  },
  plugins: [
    timeoutPlugin({ timeout: 8_000 }),
    authBearerPlugin(() => currentToken),
    metricsTracingPlugin,
  ],
});

// ============================================================================
// 4. Client Consumption Patterns & Safe Error Handling
// ============================================================================

// Pattern 1: Discriminated domain error handling with `safe()`
export async function handleStockReservation(sku: string, quantity: number) {
  const [error, reservation, isDefined] = await safe(
    cmsClient.operations.inventory.reserve({ quantity, sku }),
  );

  if (isDefined && isDefinedError(error, "OUT_OF_STOCK")) {
    return {
      message: `Only ${error.data.available} units available.`,
      ok: false,
    };
  }

  if (isTimeoutError(error)) {
    return { message: "Inventory service timed out. Please retry.", ok: false };
  }

  if (error !== null || !reservation) {
    return { message: "Internal server error.", ok: false };
  }

  return {
    expiresAt: reservation.expiresAt,
    ok: true,
    reservationId: reservation.reservationId,
  };
}

// Pattern 2: Next.js Server Action with complete error branch handling
export async function createOrderAction(input: CreateOrderInput) {
  const [error, order, isDefined] = await safe(
    cmsClient.operations.orders.create(input),
  );

  if (isDefined) {
    if (isDefinedError(error, "STOCK_EXHAUSTED")) {
      return {
        error: `Items out of stock: ${error.data.unavailableSkus.join(", ")}`,
        status: 409,
      };
    }
    if (isDefinedError(error, "PAYMENT_FAILED")) {
      return {
        error: `Payment failed on gateway ${error.data.gateway}`,
        status: 402,
      };
    }
  }

  if (isTimeoutError(error)) {
    return { error: "Order service timeout", status: 504 };
  }

  if (error !== null || !order) {
    return { error: "Failed to process order", status: 500 };
  }

  return {
    orderId: order.orderId,
    status: 200,
    totalCents: order.totalCents,
  };
}
