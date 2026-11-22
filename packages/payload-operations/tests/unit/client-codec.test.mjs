import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { createOperationsClient } from "../../dist/client/index.js";
import { createCMSClient } from "../../dist/cms/index.js";
import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import { CMSOperationError, isCMSOperationError } from "../../dist/errors/index.js";
import { createPayloadEndpoints } from "../../dist/server/index.js";

function createDateCodec () {
  return z.codec(z.iso.datetime(), z.date(), {
    decode: (s) => new Date(s),
    encode: (d) => d.toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Requirement 1: Success response decoding
// ---------------------------------------------------------------------------

test("success response: client decodes output with z.decodeAsync (Date codec)", async () => {
  const dateCodec = createDateCodec();

  const operations = defineCMSOperations({
    getTimestamp: operation({
      input: z.object({}),
      output: z.object({
        createdAt: dateCodec,
      }),
    }),
  });

  const stubFetch = async () => new Response(
    JSON.stringify({ createdAt: "2026-11-22T10:30:00.000Z" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  const result = await client.getTimestamp({});
  assert.ok(result.createdAt instanceof Date, "createdAt should be a Date instance");
  assert.equal(result.createdAt.toISOString(), "2026-11-22T10:30:00.000Z");
});

test("success response: 204 status resolves undefined for output z.undefined()", async () => {
  const operations = defineCMSOperations({
    deleteItem: operation({
      input: z.object({ id: z.string() }),
      output: z.undefined(),
    }),
  });

  const stubFetch = async () => new Response(null, { status: 204 });

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  const result = await client.deleteItem({ id: "123" });
  assert.equal(result, undefined);
});

test("success response: decode failure rejects with INTERNAL_SERVER_ERROR", async () => {
  const dateCodec = createDateCodec();

  const operations = defineCMSOperations({
    getTimestamp: operation({
      input: z.object({}),
      output: z.object({
        createdAt: dateCodec,
      }),
    }),
  });

  const stubFetch = async () => new Response(
    JSON.stringify({ createdAt: "not-an-iso-datetime" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.getTimestamp({}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.ok(error instanceof CMSOperationError);
      assert.equal(error.code, "INTERNAL_SERVER_ERROR");
      assert.equal(error.status, 500);
      assert.equal(error.defined, false);
      return true;
    }
  );
});

test("success response: 204 status with non-undefined output schema rejects with INTERNAL_SERVER_ERROR", async () => {
  const operations = defineCMSOperations({
    getItem: operation({
      input: z.object({}),
      output: z.object({ id: z.string() }),
    }),
  });

  const stubFetch = async () => new Response(null, { status: 204 });

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.getItem({}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "INTERNAL_SERVER_ERROR");
      assert.equal(error.status, 500);
      assert.equal(error.defined, false);
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Requirement 2: Defined-error response decoding
// ---------------------------------------------------------------------------

test("defined-error response: data is decoded with z.decodeAsync (Date codec)", async () => {
  const dateCodec = createDateCodec();

  const operations = defineCMSOperations({
    sensitiveAction: operation({
      errors: {
        TOKEN_EXPIRED: {
          data: z.object({
            expiredAt: dateCodec,
          }),
          message: "Session token has expired",
          status: 401,
        },
      },
      input: z.object({}),
      output: z.boolean(),
    }),
  });

  const stubFetch = async () => new Response(
    JSON.stringify({
      code: "TOKEN_EXPIRED",
      data: {
        expiredAt: "2026-11-22T12:00:00.000Z",
      },
      defined: true,
      message: "Session token has expired",
      status: 401,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 401,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.sensitiveAction({}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "TOKEN_EXPIRED");
      assert.equal(error.status, 401);
      assert.equal(error.defined, true);
      assert.equal(error.message, "Session token has expired");
      assert.ok(error.data.expiredAt instanceof Date, "expiredAt should be decoded into Date");
      assert.equal(error.data.expiredAt.toISOString(), "2026-11-22T12:00:00.000Z");
      return true;
    }
  );
});

test("defined-error response: data decode mismatch rejects with INTERNAL_SERVER_ERROR", async () => {
  const dateCodec = createDateCodec();

  const operations = defineCMSOperations({
    sensitiveAction: operation({
      errors: {
        TOKEN_EXPIRED: {
          data: z.object({
            expiredAt: dateCodec,
          }),
          message: "Session token has expired",
          status: 401,
        },
      },
      input: z.object({}),
      output: z.boolean(),
    }),
  });

  // Server returned invalid date in envelope data
  const stubFetch = async () => new Response(
    JSON.stringify({
      code: "TOKEN_EXPIRED",
      data: {
        expiredAt: "not-a-valid-datetime",
      },
      defined: true,
      message: "Session token has expired",
      status: 401,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 401,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.sensitiveAction({}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "INTERNAL_SERVER_ERROR");
      assert.equal(error.status, 500);
      assert.equal(error.defined, false);
      return true;
    }
  );
});

test("defined-error response: error without data preserves defined error with undefined data", async () => {
  const operations = defineCMSOperations({
    simpleOp: operation({
      errors: {
        RATE_LIMITED: {
          message: "Too many requests",
          status: 429,
        },
      },
      input: z.object({}),
      output: z.boolean(),
    }),
  });

  const stubFetch = async () => new Response(
    JSON.stringify({
      code: "RATE_LIMITED",
      defined: true,
      message: "Too many requests",
      status: 429,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 429,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.simpleOp({}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "RATE_LIMITED");
      assert.equal(error.status, 429);
      assert.equal(error.defined, true);
      assert.equal(error.data, undefined);
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Requirement 3: Input processing order
// ---------------------------------------------------------------------------

test("input (a): safeParseAsync fails -> rejects INPUT_VALIDATION_FAILED and does not call fetch", async () => {
  let fetchCalled = false;

  const operations = defineCMSOperations({
    createUser: operation({
      input: z.object({
        email: z.string().email(),
      }),
      output: z.object({ id: z.string() }),
    }),
  });

  const stubFetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ id: "1" }), { status: 200 });
  };

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  await assert.rejects(
    async () => client.createUser({ email: "invalid-email-address" }),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "INPUT_VALIDATION_FAILED");
      assert.equal(error.status, 422);
      assert.equal(error.defined, false);
      assert.ok(Array.isArray(error.data?.issues));
      assert.equal(error.data.issues[0]?.path[0], "email");
      return true;
    }
  );

  assert.equal(fetchCalled, false, "fetch must not be called when input validation fails");
});

test("input (b): JSON.stringify fails -> rejects BAD_REQUEST 'Operation input is not JSON serializable.' and does not call fetch", async () => {
  let fetchCalled = false;

  const operations = defineCMSOperations({
    anyData: operation({
      input: z.custom(() => true),
      output: z.object({ ok: z.boolean() }),
    }),
  });

  const stubFetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  // Circular object passes custom validator but cannot be stringified
  const circular = {};
  circular.self = circular;

  await assert.rejects(
    async () => client.anyData(circular),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "BAD_REQUEST");
      assert.equal(error.status, 400);
      assert.equal(error.message, "Operation input is not JSON serializable.");
      assert.equal(error.defined, false);
      return true;
    }
  );

  assert.equal(fetchCalled, false, "fetch must not be called when JSON.stringify fails");
});

test("input (c): sends original input JSON, discarding client-side parse/transform results", async () => {
  let capturedBody;

  const operations = defineCMSOperations({
    search: operation({
      input: z.object({
        q: z.string().transform((s) => s.toUpperCase()),
      }),
      output: z.object({ count: z.number() }),
    }),
  });

  const stubFetch = async (_url, init) => {
    capturedBody = init?.body;
    return new Response(
      JSON.stringify({ count: 1 }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  };

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
  });

  const result = await client.search({ q: "a" });
  assert.deepEqual(result, { count: 1 });
  assert.equal(capturedBody, JSON.stringify({ q: "a" }), "body must be original input, not transformed");
});

test("input (c): createCMSClient also sends original input and decodes output", async () => {
  const dateCodec = createDateCodec();
  let capturedBody;

  const operations = defineCMSOperations({
    transformAndCodec: operation({
      input: z.object({
        query: z.string().transform((s) => s.toUpperCase()),
      }),
      output: z.object({
        timestamp: dateCodec,
      }),
    }),
  });

  const stubFetch = async (_url, init) => {
    capturedBody = init?.body;
    return new Response(
      JSON.stringify({ timestamp: "2026-11-22T10:30:00.000Z" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  };

  const cms = createCMSClient({
    operations,
    payload: {
      baseURL: "https://cms.example.com/api",
      fetch: stubFetch,
    },
  });

  const result = await cms.operations.transformAndCodec({ query: "lowercase" });
  assert.equal(capturedBody, JSON.stringify({ query: "lowercase" }));
  assert.ok(result.timestamp instanceof Date);
  assert.equal(result.timestamp.toISOString(), "2026-11-22T10:30:00.000Z");
});

// ---------------------------------------------------------------------------
// Requirement 5: End-to-end case
// ---------------------------------------------------------------------------

function createFakePayloadRequest ({
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

test("end-to-end: server endpoints wired to client fetch (204 undefined & looseObject extra key reach wire and client)", async () => {
  const operations = defineCMSOperations({
    getLoose: operation({
      input: z.object({ id: z.string() }),
      output: z.looseObject({ id: z.string() }),
    }),
    voidAction: operation({
      input: z.void(),
      output: z.undefined(),
    }),
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      getLoose: async ({ input }) => ({
        extraKey: "extra-value-from-handler",
        id: input.id,
      }),
      voidAction: async () => undefined,
    },
    operations,
  });

  const wireResponses = [];

  const client = createOperationsClient({
    baseURL: "https://cms.example.com",
    fetch: async (url, init) => {
      const urlObj = new URL(url);
      const endpoint = endpoints.find(
        (ep) => ep.method === init.method.toLowerCase() && ep.path === urlObj.pathname
      );

      if (!endpoint) {
        return new Response("Not Found", { status: 404 });
      }

      const req = createFakePayloadRequest({
        body: init.body,
        headers: init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : (init.headers ?? {}),
      });

      const response = await endpoint.handler(req);
      const cloned = response.clone();
      const text = await cloned.text();
      wireResponses.push({ status: response.status, text, url });

      return response;
    },
    operations,
  });

  // Case 1: output z.undefined() -> server 204, client resolves undefined
  const voidResult = await client.voidAction();
  assert.equal(voidResult, undefined, "client must resolve undefined");
  assert.equal(wireResponses.length, 1);
  assert.equal(wireResponses[0].status, 204, "server must respond with 204");
  assert.equal(wireResponses[0].text, "", "204 body on wire must be empty");

  // Case 2: output z.looseObject({ id: z.string() }) with extra key
  // -> extra key reaches the wire AND the client result
  const looseResult = await client.getLoose({ id: "item-42" });
  assert.equal(wireResponses.length, 2);
  assert.equal(wireResponses[1].status, 200, "server must respond with 200");

  // The extra key reaches the wire:
  const wireData = JSON.parse(wireResponses[1].text);
  assert.equal(wireData.id, "item-42");
  assert.equal(wireData.extraKey, "extra-value-from-handler", "extra key must reach the wire");

  // AND reaches the client result:
  assert.equal(looseResult.id, "item-42");
  assert.equal(looseResult.extraKey, "extra-value-from-handler", "extra key must reach client result");
});

test("client input: non-JSON-serializable input (function with z.any() input) rejects BAD_REQUEST and fetch is not called", async () => {
  let fetchCalled = false;
  const operations = defineCMSOperations({
    evalFn: operation({
      input: z.any(),
      output: z.object({ ok: z.boolean() }),
    }),
  });

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ ok: true }));
    },
    operations,
  });

  await assert.rejects(
    async () => client.evalFn(() => {}),
    (error) => {
      assert.ok(isCMSOperationError(error));
      assert.equal(error.code, "BAD_REQUEST");
      assert.equal(error.message, "Operation input is not JSON serializable.");
      return true;
    }
  );

  assert.equal(fetchCalled, false);
});
