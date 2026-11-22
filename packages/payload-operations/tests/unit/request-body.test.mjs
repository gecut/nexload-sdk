import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import {
  createPayloadEndpoints,
  DEFAULT_MAX_BODY_BYTES,
} from "../../dist/server/index.js";

function createFakeRequest({
  body,
  bodyStream,
  headers = {},
  text,
  user = null,
} = {}) {
  const reqHeaders = new Headers({
    "content-type": "application/json",
    ...headers,
  });

  const req = {
    headers: reqHeaders,
    payload: {
      config: {},
    },
    user,
  };

  if (bodyStream !== undefined) {
    req.body = bodyStream;
  }

  if (text !== undefined) {
    req.text = text;
  } else if (body !== undefined) {
    req.text = async () => (typeof body === "string" ? body : JSON.stringify(body));
  } else {
    req.text = async () => "";
  }

  return req;
}

const operations = defineCMSOperations({
  greet: operation({
    input: z.object({ name: z.string() }),
    output: z.object({ message: z.string() }),
  }),
  ping: operation({
    input: z.void(),
    output: z.object({ ok: z.boolean() }),
  }),
});

test("DEFAULT_MAX_BODY_BYTES is exported from ./server and equals 1_048_576", () => {
  assert.equal(DEFAULT_MAX_BODY_BYTES, 1_048_576);
});

test("Content-Length 2000000 returns 413 PAYLOAD_TOO_LARGE and handler is not called without reading body", async () => {
  let handlerCalled = false;
  let bodyRead = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => {
        handlerCalled = true;
        return { message: "ok" };
      },
      ping: async () => ({ ok: true }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    headers: {
      "content-length": "2000000",
    },
    text: async () => {
      bodyRead = true;
      return JSON.stringify({ name: "Alice" });
    },
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 413);
  const data = await response.json();
  assert.equal(data.code, "PAYLOAD_TOO_LARGE");
  assert.equal(data.status, 413);
  assert.equal(handlerCalled, false);
  assert.equal(bodyRead, false);
});

test("streamed ReadableStream body with no Content-Length (2 MiB in 64 KiB chunks) returns 413 and cancels stream before last chunk", async () => {
  let handlerCalled = false;
  let cancelled = false;
  let chunksSent = 0;
  const totalChunks = 32; // 32 * 64 KiB = 2 MiB
  const chunkSize = 64 * 1024;
  const chunk = new Uint8Array(chunkSize);

  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
    pull(controller) {
      if (chunksSent < totalChunks) {
        chunksSent++;
        controller.enqueue(chunk);
      } else {
        controller.close();
      }
    },
  });

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => {
        handlerCalled = true;
        return { message: "ok" };
      },
      ping: async () => ({ ok: true }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    bodyStream: stream,
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 413);
  const data = await response.json();
  assert.equal(data.code, "PAYLOAD_TOO_LARGE");
  assert.equal(data.status, 413);
  assert.equal(handlerCalled, false);
  assert.equal(cancelled, true);
  assert.ok(
    chunksSent < totalChunks,
    `Expected stream to be cancelled before last chunk, but sent ${chunksSent}/${totalChunks}`
  );
});

test("maxBodyBytes: 10 with an 11-byte JSON body returns 413 PAYLOAD_TOO_LARGE", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => {
        handlerCalled = true;
        return { message: "ok" };
      },
      ping: async () => ({ ok: true }),
    },
    maxBodyBytes: 10,
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  // Exact 11-byte body: '{"a":"123"}' has byte length 11
  const body11 = '{"a":"123"}';
  assert.equal(Buffer.byteLength(body11, "utf8"), 11);

  // 1. Test via ReadableStream
  const chunk = new TextEncoder().encode(body11);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(chunk);
      controller.close();
    },
  });

  const reqStream = createFakeRequest({
    bodyStream: stream,
  });

  const streamResponse = await postEndpoint.handler(reqStream);
  assert.equal(streamResponse.status, 413);
  const streamData = await streamResponse.json();
  assert.equal(streamData.code, "PAYLOAD_TOO_LARGE");
  assert.equal(streamData.status, 413);
  assert.equal(handlerCalled, false);

  // 2. Test via text() fallback
  const reqText = createFakeRequest({
    body: body11,
  });

  const textResponse = await postEndpoint.handler(reqText);
  assert.equal(textResponse.status, 413);
  const textData = await textResponse.json();
  assert.equal(textData.code, "PAYLOAD_TOO_LARGE");
  assert.equal(textData.status, 413);
  assert.equal(handlerCalled, false);
});

test("maxBodyBytes 0 and -1 throw TypeError at creation", () => {
  assert.throws(
    () => createPayloadEndpoints({
      access: { default: () => true },
      handlers: {
        greet: async () => ({ message: "ok" }),
        ping: async () => ({ ok: true }),
      },
      maxBodyBytes: 0,
      operations,
    }),
    {
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: () => true },
      handlers: {
        greet: async () => ({ message: "ok" }),
        ping: async () => ({ ok: true }),
      },
      maxBodyBytes: -1,
      operations,
    }),
    {
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: () => true },
      handlers: {
        greet: async () => ({ message: "ok" }),
        ping: async () => ({ ok: true }),
      },
      maxBodyBytes: 1.5,
      operations,
    }),
    {
      name: "TypeError",
    }
  );

  assert.throws(
    () => createPayloadEndpoints({
      access: { default: () => true },
      handlers: {
        greet: async () => ({ message: "ok" }),
        ping: async () => ({ ok: true }),
      },
      maxBodyBytes: "100",
      operations,
    }),
    {
      name: "TypeError",
    }
  );
});

test("non-JSON Content-Type returns 415 UNSUPPORTED_MEDIA_TYPE", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => {
        handlerCalled = true;
        return { message: "ok" };
      },
      ping: async () => ({ ok: true }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: "hello world",
    headers: {
      "content-type": "text/plain",
    },
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 415);
  const data = await response.json();
  assert.equal(data.code, "UNSUPPORTED_MEDIA_TYPE");
  assert.equal(data.status, 415);
  assert.equal(handlerCalled, false);
});

test("malformed JSON body returns 400 BAD_REQUEST", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => {
        handlerCalled = true;
        return { message: "ok" };
      },
      ping: async () => ({ ok: true }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: "{invalid json",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await postEndpoint.handler(req);

  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.code, "BAD_REQUEST");
  assert.equal(data.status, 400);
  assert.equal(handlerCalled, false);
});

test("a small valid JSON body reaches the handler", async () => {
  let handlerCalled = false;

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async ({ input }) => {
        handlerCalled = true;
        return { message: `Hello ${input.name}` };
      },
      ping: async () => ({ ok: true }),
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/greet"
  );
  assert.ok(postEndpoint);

  // 1. With stream
  const chunk = new TextEncoder().encode(JSON.stringify({ name: "Alice" }));
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(chunk);
      controller.close();
    },
  });

  const reqStream = createFakeRequest({
    bodyStream: stream,
  });

  const streamResponse = await postEndpoint.handler(reqStream);
  assert.equal(streamResponse.status, 200);
  const streamData = await streamResponse.json();
  assert.deepEqual(streamData, { message: "Hello Alice" });
  assert.equal(handlerCalled, true);

  // 2. With text() fallback
  handlerCalled = false;
  const reqText = createFakeRequest({
    body: { name: "Bob" },
  });

  const textResponse = await postEndpoint.handler(reqText);
  assert.equal(textResponse.status, 200);
  const textData = await textResponse.json();
  assert.deepEqual(textData, { message: "Hello Bob" });
  assert.equal(handlerCalled, true);
});

test("empty body produces undefined input", async () => {
  let receivedInput = "not-called";

  const endpoints = createPayloadEndpoints({
    access: {
      default: () => true,
    },
    handlers: {
      greet: async () => ({ message: "ok" }),
      ping: async ({ input }) => {
        receivedInput = input;
        return { ok: true };
      },
    },
    operations,
  });

  const postEndpoint = endpoints.find(
    (ep) => ep.method === "post" && ep.path === "/operations/ping"
  );
  assert.ok(postEndpoint);

  const req = createFakeRequest({
    body: "",
  });

  const response = await postEndpoint.handler(req);
  assert.equal(response.status, 200);
  assert.equal(receivedInput, undefined);
});
