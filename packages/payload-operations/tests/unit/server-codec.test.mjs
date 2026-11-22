import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import { createPayloadEndpoints } from "../../dist/server/index.js";

function createFakeRequest({
  body,
  headers = {},
  user = null,
} = {}) {
  const reqHeaders = new Headers({
    "content-type": "application/json",
    ...headers,
  });

  return {
    headers: reqHeaders,
    payload: {
      config: {},
    },
    text: async () => (body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : ""),
    user,
  };
}

test("handler returns { id, email, passwordHash } with output z.object({ id, email }) -> body keys exactly ['email','id']", async () => {
  const operations = defineCMSOperations({
    getUser: operation({
      input: z.object({}),
      output: z.object({
        email: z.string(),
        id: z.string(),
      }),
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      getUser: async () => ({
        email: "alice@example.com",
        id: "user-1",
        passwordHash: "$2b$10$hashedsecretpasswordvalue",
      }),
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/getUser"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), ["email", "id"]);
  assert.equal(data.id, "user-1");
  assert.equal(data.email, "alice@example.com");
  assert.equal(data.passwordHash, undefined);
});

test("codec Date -> ISO string", async () => {
  const dateCodec = z.codec(z.iso.datetime(), z.date(), {
    encode: (d) => d.toISOString(),
    decode: (s) => new Date(s),
  });

  const operations = defineCMSOperations({
    getTimestamp: operation({
      input: z.object({}),
      output: z.object({
        createdAt: dateCodec,
      }),
    }),
  });

  const testDate = new Date("2026-11-22T10:30:00.000Z");

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      getTimestamp: async () => ({
        createdAt: testDate,
      }),
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/getTimestamp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.createdAt, "2026-11-22T10:30:00.000Z");
});

test("unidirectional transform output -> 500 without cause", async () => {
  const operations = defineCMSOperations({
    transformOp: operation({
      input: z.object({}),
      output: z.object({
        length: z.string().transform((val) => val.length),
      }),
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      transformOp: async () => ({
        length: 5,
      }),
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/transformOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 500);
  const data = await response.json();
  assert.equal(data.code, "INTERNAL_SERVER_ERROR");
  assert.equal(data.status, 500);
  assert.equal(data.cause, undefined);
  assert.equal(data.stack, undefined);
  assert.equal("cause" in data, false);
  assert.equal("stack" in data, false);
});

test("handler output failing the schema -> 500", async () => {
  const operations = defineCMSOperations({
    invalidOp: operation({
      input: z.object({}),
      output: z.object({
        count: z.number(),
      }),
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      invalidOp: async () => ({
        count: "not-a-number",
      }),
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/invalidOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 500);
  const data = await response.json();
  assert.equal(data.code, "INTERNAL_SERVER_ERROR");
  assert.equal(data.status, 500);
  assert.equal(data.cause, undefined);
  assert.equal(data.stack, undefined);
  assert.equal("cause" in data, false);
  assert.equal("stack" in data, false);
});

test("defined error data with extra key 'internal' -> envelope data lacks it", async () => {
  const operations = defineCMSOperations({
    failOp: operation({
      input: z.object({}),
      output: z.object({ ok: z.boolean() }),
      errors: {
        ITEM_NOT_FOUND: {
          data: z.object({
            id: z.string(),
          }),
          message: "Item was not found",
          status: 404,
        },
      },
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      failOp: async ({ errors }) => {
        throw errors.ITEM_NOT_FOUND({
          data: {
            id: "item-123",
            internal: "internal-database-cluster-query-failure",
          },
        });
      },
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/failOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 404);
  const data = await response.json();
  assert.equal(data.code, "ITEM_NOT_FOUND");
  assert.equal(data.status, 404);
  assert.deepEqual(data.data, { id: "item-123" });
  assert.equal(data.data.internal, undefined);
  assert.equal("internal" in data.data, false);
});

test("definition without data -> envelope without data", async () => {
  const operations = defineCMSOperations({
    failNoDataOp: operation({
      input: z.object({}),
      output: z.object({ ok: z.boolean() }),
      errors: {
        FORBIDDEN_ACTION: {
          message: "Action not permitted",
          status: 403,
        },
      },
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      failNoDataOp: async ({ errors }) => {
        throw errors.FORBIDDEN_ACTION();
      },
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/failNoDataOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 403);
  const data = await response.json();
  assert.equal(data.code, "FORBIDDEN_ACTION");
  assert.equal(data.status, 403);
  assert.equal(data.message, "Action not permitted");
  assert.equal("data" in data, false);
  assert.equal(data.data, undefined);
});

test("output z.undefined() -> 204", async () => {
  const operations = defineCMSOperations({
    noContentOp: operation({
      input: z.object({}),
      output: z.undefined(),
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      noContentOp: async () => undefined,
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/noContentOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 204);
  const text = await response.text();
  assert.equal(text, "");
});

test("defined error data failing its schema -> 500", async () => {
  const operations = defineCMSOperations({
    failBadDataOp: operation({
      input: z.object({}),
      output: z.object({ ok: z.boolean() }),
      errors: {
        BAD_PAYLOAD: {
          data: z.object({
            code: z.number(),
          }),
          message: "Bad payload",
          status: 400,
        },
      },
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      failBadDataOp: async ({ errors }) => {
        throw errors.BAD_PAYLOAD({
          data: {
            code: "not-a-number",
          },
        });
      },
    },
    operations,
  });

  const endpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/failBadDataOp"
  );
  assert.ok(endpoint);

  const req = createFakeRequest({ body: {} });
  const response = await endpoint.handler(req);

  assert.equal(response.status, 500);
  const data = await response.json();
  assert.equal(data.code, "INTERNAL_SERVER_ERROR");
  assert.equal(data.status, 500);
  assert.equal("cause" in data, false);
  assert.equal("stack" in data, false);
});
