import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig, createPayloadRequest, getPayload } from "payload";
import { z } from "zod";

import { createOperationsClient } from "../../dist/client/index.js";
import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import { isDefinedError } from "../../dist/errors/index.js";
import { createPayloadEndpoints } from "../../dist/server/index.js";

test("Payload with SQLite and typed operations", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "payload-sqlite-test-"));
  const dbPath = path.join(tempDir, "test.db");

  let payload;
  try {
    const operations = defineCMSOperations({
      orders: {
        create: operation({
          errors: {
            OUT_OF_STOCK: {
              data: z.object({
                available: z.number(),
              }),
              message: "Item is out of stock",
              status: 400,
            },
          },
          input: z.object({
            item: z.string().optional(),
            orderId: z.string(),
            quantity: z.number().int().positive().optional(),
          }),
          output: z.object({
            orderId: z.string(),
          }),
        }),
      },
    });

    const endpoints = createPayloadEndpoints({
      access: {
        default: ({ req }) => Boolean(req.user),
      },
      handlers: {
        orders: {
          create: async ({ errors, input, req }) => {
            if (input.quantity !== undefined && input.quantity > 10) {
              throw errors.OUT_OF_STOCK({ data: { available: 3 } });
            }

            const doc = await req.payload.create({
              collection: "orders",
              data: {
                item: input.item ?? "standard-item",
                orderId: input.orderId,
                quantity: input.quantity ?? 1,
              },
              overrideAccess: false,
              req,
            });

            return doc;
          },
        },
      },
      operations,
    });

    const config = await buildConfig({
      collections: [
        {
          auth: true,
          fields: [],
          slug: "users",
        },
        {
          access: {
            create: ({ req: { user } }) => Boolean(user),
            read: () => true,
          },
          fields: [
            { name: "orderId", required: true, type: "text" },
            { name: "item", type: "text" },
            { name: "quantity", type: "number" },
          ],
          slug: "orders",
        },
      ],
      db: sqliteAdapter({
        client: {
          url: `file:${dbPath}`,
        },
      }),
      secret: "test-secret-must-be-at-least-32-chars-long!",
    });

    payload = await getPayload({ config });

    // Seed auth user
    await payload.create({
      collection: "users",
      data: {
        email: "buyer@example.com",
        password: "secret-password-123",
      },
    });

    const { token } = await payload.login({
      collection: "users",
      data: {
        email: "buyer@example.com",
        password: "secret-password-123",
      },
    });

    const wireResponses = [];

    const client = createOperationsClient({
      baseURL: "http://localhost:3000",
      fetch: async (url, init) => {
        const request = new Request(url, init);
        const parsedUrl = new URL(request.url);

        const endpoint = endpoints.find(
          (ep) => ep.method === request.method.toLowerCase() && ep.path === parsedUrl.pathname
        );

        if (!endpoint) {
          return new Response("Not Found", { status: 404 });
        }

        const payloadReq = await createPayloadRequest({
          config: payload.config,
          request,
        });

        const response = await endpoint.handler(payloadReq);
        const cloned = response.clone();
        const text = await cloned.text();
        wireResponses.push({
          status: response.status,
          text,
          url,
        });

        return response;
      },
      operations,
    });

    // 1. Success returns exactly { orderId } (no other keys on the wire)
    const successResult = await client.orders.create(
      { item: "laptop", orderId: "ord-success-1", quantity: 2 },
      { headers: { Authorization: `JWT ${token}` } }
    );
    assert.deepEqual(successResult, { orderId: "ord-success-1" });

    const successWire = wireResponses[wireResponses.length - 1];
    assert.equal(successWire.status, 200);
    const parsedWire = JSON.parse(successWire.text);
    assert.deepEqual(
      Object.keys(parsedWire),
      ["orderId"],
      "success returns exactly { orderId } with no other keys on the wire"
    );
    assert.equal(parsedWire.orderId, "ord-success-1");

    // 2. Unauthenticated call -> 401
    await assert.rejects(
      async () => client.orders.create({
        item: "laptop",
        orderId: "ord-unauth-2",
        quantity: 1,
      }),
      (error) => {
        assert.equal(error.status, 401);
        assert.equal(error.code, "UNAUTHORIZED");
        assert.equal(error.defined, false);
        return true;
      }
    );

    // 3. Invalid input -> 422 INPUT_VALIDATION_FAILED
    await assert.rejects(
      async () => client.orders.create(
        { orderId: 99999 },
        { headers: { Authorization: `JWT ${token}` } }
      ),
      (error) => {
        assert.equal(error.status, 422);
        assert.equal(error.code, "INPUT_VALIDATION_FAILED");
        assert.equal(error.defined, false);
        return true;
      }
    );

    // 4. OUT_OF_STOCK -> defined error with decoded data
    await assert.rejects(
      async () => client.orders.create(
        { item: "laptop", orderId: "ord-stock-3", quantity: 50 },
        { headers: { Authorization: `JWT ${token}` } }
      ),
      (error) => {
        assert.equal(isDefinedError(error, "OUT_OF_STOCK"), true);
        assert.equal(error.code, "OUT_OF_STOCK");
        assert.equal(error.status, 400);
        assert.equal(error.defined, true);
        assert.deepEqual(error.data, { available: 3 });
        return true;
      }
    );
  } finally {
    await payload?.destroy();
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
});
