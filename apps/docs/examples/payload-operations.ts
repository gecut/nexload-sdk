import {
  createCMSClient,
  defineCMSOperations,
  isDefinedError,
  operation,
  safe,
  timeoutPlugin,
} from "@nexload-sdk/payload-operations";
import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";
import { z } from "zod";

export const cmsOperations = defineCMSOperations({
  inventory: {
    reserve: operation({
      input: z.object({
        quantity: z.int().positive(),
        sku: z.string().min(1),
      }),
      output: z.object({
        expiresAt: z.iso.datetime().transform((value) => new Date(value)),
        reservationId: z.string(),
      }),
      errors: {
        OUT_OF_STOCK: {
          data: z.object({ available: z.int().nonnegative() }),
          message: "Insufficient stock.",
          status: 409,
        },
      },
    }),
  },
  status: {
    ping: operation({
      input: z.void(),
      output: z.void(),
    }),
  },
});

const basePath = "/application/operations";

export const operationEndpoints = createPayloadEndpoints({
  access: {
    overrides: {
      status: {
        ping: () => true,
      },
    },
  },
  basePath,
  handlers: {
    inventory: {
      reserve: async ({ errors, input }) => {
        if (input.quantity > 10) {
          throw errors.OUT_OF_STOCK({ data: { available: 10 } });
        }

        return {
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          reservationId: `${input.sku}-${input.quantity}`,
        };
      },
    },
    status: {
      ping: async () => undefined,
    },
  },
  operations: cmsOperations,
});

export const cms = createCMSClient({
  basePath,
  operations: cmsOperations,
  payload: {
    baseInit: {
      credentials: "include",
      headers: { "X-Application": "docs-example" },
    },
    baseURL: "https://cms.example.com/api",
  },
  plugins: [timeoutPlugin({ timeout: 5_000 })],
});

export async function reserveInventory() {
  const [error, reservation, defined] = await safe(
    cms.operations.inventory.reserve({
      quantity: 2,
      sku: "SKU-1",
    }),
  );

  if (defined && isDefinedError(error, "OUT_OF_STOCK")) {
    return { available: error.data.available };
  }

  if (error !== null || reservation === undefined) {
    throw error ?? new Error("Operation returned no result.");
  }

  return {
    expiresAt: reservation.expiresAt,
    reservationId: reservation.reservationId,
  };
}
