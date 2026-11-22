import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { createOperationsClient, defineClientPlugin } from "../../dist/client/index.js";
import { createCMSClient, createPayloadFetchAdapter } from "../../dist/cms/index.js";
import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import {
  CMSOperationError as ErrorsCMSOperationError,
  isCMSOperationError as errorsIsCMSOperationError,
} from "../../dist/errors/index.js";
import {
  CMSOperationError as ServerCMSOperationError,
} from "../../dist/server/index.js";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireFromTest = createRequire(import.meta.url);
const esbuildPath = createRequire(requireFromTest.resolve("@nexload-sdk/bundler")).resolve("esbuild");
const esbuild = requireFromTest(esbuildPath);

const entriesToTest = [
  "dist/index.js",
  "dist/contract/index.js",
  "dist/errors/index.js",
  "dist/client/index.js",
  "dist/plugins/timeout/index.js",
];

for (const entry of entriesToTest) {
  test(`${entry} bundles for platform browser with no PayloadSDK and no payload import`, async () => {
    const result = await esbuild.build({
      entryPoints: [path.join(packageDirectory, entry)],
      platform: "browser",
      bundle: true,
      write: false,
      logLevel: "silent",
      format: "esm",
    });

    assert.deepEqual(result.errors, []);
    const output = result.outputFiles.map(({ text }) => text).join("\n");

    assert.equal(output.includes("PayloadSDK"), false, `${entry} should not contain PayloadSDK`);
    assert.equal(
      /from\s+["']payload(?:\/[^"']*)?["']|import\s*\(["']payload(?:\/[^"']*)?["']\)|require\s*\(\s*["']payload(?:\/[^"']*)?["']\s*\)/.test(output),
      false,
      `${entry} should not import payload`
    );
  });
}

test("dist/client/index.js imports cleanly when @payloadcms/sdk is unresolvable", () => {
  const code = `
    import { register } from "node:module";
    register("data:text/javascript," + encodeURIComponent(\`
      export async function resolve(specifier, context, nextResolve) {
        if (specifier === "@payloadcms/sdk" || specifier.startsWith("@payloadcms/sdk/")) {
          const error = new Error("Cannot find package '" + specifier + "'");
          error.code = "ERR_MODULE_NOT_FOUND";
          throw error;
        }
        return nextResolve(specifier, context);
      }
    \`));

    try {
      await import("@payloadcms/sdk");
      process.exit(2);
    } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND") {
        process.exit(3);
      }
    }

    const clientModule = await import("./dist/client/index.js");
    if (typeof clientModule.createOperationsClient !== "function") {
      process.exit(4);
    }
    process.exit(0);
  `;

  const child = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: packageDirectory,
    encoding: "utf8",
  });

  assert.equal(child.status, 0, `Child process failed with stderr: ${child.stderr}\nstdout: ${child.stdout}`);
});

test("createOperationsClient calls <baseURL>/operations/<path> and plugins see the request", async () => {
  const operations = defineCMSOperations({
    greet: operation({
      input: z.object({ name: z.string() }),
      output: z.object({ message: z.string() }),
    }),
    users: {
      find: operation({
        input: z.object({ id: z.string() }),
        output: z.object({ id: z.string(), role: z.string() }),
      }),
    },
  });

  const observedRequests = [];
  const testPlugin = defineClientPlugin({
    name: "test-recorder",
    wrapTransport: (next) => async (request) => {
      observedRequests.push(request);
      return next(request);
    },
  });

  const fetchCalls = [];
  const stubFetch = async (url, init) => {
    fetchCalls.push({ url, init });
    if (url.endsWith("/operations/greet")) {
      return new Response(JSON.stringify({ message: "Hello Alice" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/operations/users/find")) {
      return new Response(JSON.stringify({ id: "user-1", role: "admin" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({}), { status: 404 });
  };

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api/",
    operations,
    fetch: stubFetch,
    plugins: [testPlugin],
  });

  const greetResult = await client.greet({ name: "Alice" });
  assert.deepEqual(greetResult, { message: "Hello Alice" });

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, "https://cms.example.com/api/operations/greet");

  assert.equal(observedRequests.length, 1);
  assert.equal(observedRequests[0].url, "https://cms.example.com/api/operations/greet");
  assert.equal(observedRequests[0].source, "operation");
  assert.equal(observedRequests[0].operation?.name, "greet");
  assert.equal(observedRequests[0].operation?.path, "/operations/greet");

  const userResult = await client.users.find({ id: "user-1" });
  assert.deepEqual(userResult, { id: "user-1", role: "admin" });

  assert.equal(fetchCalls.length, 2);
  assert.equal(fetchCalls[1].url, "https://cms.example.com/api/operations/users/find");

  assert.equal(observedRequests.length, 2);
  assert.equal(observedRequests[1].url, "https://cms.example.com/api/operations/users/find");
  assert.equal(observedRequests[1].source, "operation");
  assert.equal(observedRequests[1].operation?.name, "users.find");
  assert.equal(observedRequests[1].operation?.path, "/operations/users/find");
});

test("dist/errors/index.js exports CMSOperationError and isCMSOperationError, sharing identity with ./server", () => {
  assert.equal(typeof ErrorsCMSOperationError, "function");
  assert.equal(typeof errorsIsCMSOperationError, "function");
  assert.equal(ErrorsCMSOperationError, ServerCMSOperationError);

  const error = new ErrorsCMSOperationError({
    code: "CUSTOM_ERROR",
    defined: false,
    message: "Custom error",
    status: 400,
  });
  assert.equal(errorsIsCMSOperationError(error), true);
  assert.equal(errorsIsCMSOperationError(new Error("standard")), false);
});

test("createPayloadFetchAdapter preserves method, headers, body, signal, credentials when input is a Request", async () => {
  let capturedRequest;
  const transport = async (req) => {
    capturedRequest = req;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  };

  const adapter = createPayloadFetchAdapter(transport);
  const controller = new AbortController();
  const request = new Request("https://cms.example.com/api/posts", {
    body: JSON.stringify({ title: "hello" }),
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-Custom": "custom-value" },
    method: "POST",
    signal: controller.signal,
  });

  await adapter(request);

  assert.equal(capturedRequest.url, "https://cms.example.com/api/posts");
  assert.equal(capturedRequest.source, "payload");
  assert.equal(capturedRequest.init.method, "POST");
  assert.equal(capturedRequest.init.credentials, "include");
  assert.equal(capturedRequest.init.signal, request.signal);
  assert.ok(capturedRequest.init.body);
  assert.equal(new Headers(capturedRequest.init.headers).get("x-custom"), "custom-value");

  // With init taking precedence
  const overrideController = new AbortController();
  await adapter(request, {
    credentials: "omit",
    headers: { "X-Custom": "overridden" },
    method: "PUT",
    signal: overrideController.signal,
  });

  assert.equal(capturedRequest.init.method, "PUT");
  assert.equal(capturedRequest.init.credentials, "omit");
  assert.equal(new Headers(capturedRequest.init.headers).get("x-custom"), "overridden");
  assert.equal(capturedRequest.init.signal, overrideController.signal);
});

test("createCMSClient payload fetch preserves Request properties using stub fetch", async () => {
  let capturedUrl;
  let capturedInit;

  const stubFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return new Response(JSON.stringify({ docs: [] }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  };

  const operations = defineCMSOperations({
    ping: operation({
      input: z.void(),
      output: z.boolean(),
    }),
  });

  const cms = createCMSClient({
    operations,
    payload: {
      baseURL: "https://cms.example.com/api",
      fetch: stubFetch,
    },
  });

  const controller = new AbortController();
  const request = new Request("https://cms.example.com/api/posts", {
    body: JSON.stringify({ name: "item" }),
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Auth": "token-123" },
    method: "POST",
    signal: controller.signal,
  });

  await cms.payload.fetch(request);

  assert.equal(capturedUrl, "https://cms.example.com/api/posts");
  assert.equal(capturedInit.method, "POST");
  assert.equal(capturedInit.credentials, "same-origin");
  assert.equal(capturedInit.signal, request.signal);
  assert.ok(capturedInit.body);
  assert.equal(new Headers(capturedInit.headers).get("x-auth"), "token-123");
});

test("createCMSClient: a single plugin sees both cms.operations.<op>() and cms.payload SDK requests", async () => {
  const operations = defineCMSOperations({
    ping: operation({
      input: z.object({ msg: z.string() }),
      output: z.object({ pong: z.string() }),
    }),
  });

  const seenRequests = [];
  const testPlugin = defineClientPlugin({
    name: "shared-recorder",
    wrapTransport: (next) => async (request) => {
      seenRequests.push(request);
      return next(request);
    },
  });

  const stubFetch = async (url) => {
    if (url.includes("/operations/ping")) {
      return new Response(JSON.stringify({ pong: "pong" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (url.includes("/posts")) {
      return new Response(JSON.stringify({ docs: [{ id: "post-1", title: "Post 1" }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    return new Response(JSON.stringify({}), { status: 404 });
  };

  const cms = createCMSClient({
    operations,
    payload: {
      baseURL: "https://cms.example.com/api",
      fetch: stubFetch,
    },
    plugins: [testPlugin],
  });

  const pingResult = await cms.operations.ping({ msg: "hello" });
  assert.deepEqual(pingResult, { pong: "pong" });

  const payloadResult = await cms.payload.find({ collection: "posts" });
  assert.deepEqual(payloadResult, { docs: [{ id: "post-1", title: "Post 1" }] });

  assert.equal(seenRequests.length, 2);
  assert.equal(seenRequests[0].source, "operation");
  assert.equal(seenRequests[0].url, "https://cms.example.com/api/operations/ping");
  assert.equal(seenRequests[0].operation?.name, "ping");

  assert.equal(seenRequests[1].source, "payload");
  assert.ok(seenRequests[1].url.startsWith("https://cms.example.com/api/posts"));
});

test("createCMSClient: with basePath omitted, operation URLs are '<baseURL>/operations/<path>'", async () => {
  const operations = defineCMSOperations({
    greet: operation({
      input: z.object({ name: z.string() }),
      output: z.object({ message: z.string() }),
    }),
    users: {
      find: operation({
        input: z.object({ id: z.string() }),
        output: z.object({ id: z.string() }),
      }),
    },
  });

  const fetchUrls = [];
  const stubFetch = async (url) => {
    fetchUrls.push(url);
    return new Response(JSON.stringify({ id: "u1", message: "hi" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  };

  const cms = createCMSClient({
    operations,
    payload: {
      baseURL: "https://cms.example.com/api",
      fetch: stubFetch,
    },
  });

  await cms.operations.greet({ name: "Bob" });
  await cms.operations.users.find({ id: "u1" });

  assert.equal(fetchUrls.length, 2);
  assert.equal(fetchUrls[0], "https://cms.example.com/api/operations/greet");
  assert.equal(fetchUrls[1], "https://cms.example.com/api/operations/users/find");
});

test("createCMSClient: two plugins run in declared order", async () => {
  const operations = defineCMSOperations({
    ping: operation({
      input: z.void(),
      output: z.boolean(),
    }),
  });

  const order = [];
  const pluginOne = defineClientPlugin({
    name: "plugin-one",
    wrapTransport: (next) => async (request) => {
      order.push("plugin-one:start");
      const response = await next(request);
      order.push("plugin-one:end");
      return response;
    },
  });

  const pluginTwo = defineClientPlugin({
    name: "plugin-two",
    wrapTransport: (next) => async (request) => {
      order.push("plugin-two:start");
      const response = await next(request);
      order.push("plugin-two:end");
      return response;
    },
  });

  const stubFetch = async () => {
    order.push("terminal-fetch");
    return new Response(JSON.stringify(true), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  };

  const cms = createCMSClient({
    operations,
    payload: {
      baseURL: "https://cms.example.com/api",
      fetch: stubFetch,
    },
    plugins: [pluginOne, pluginTwo],
  });

  await cms.operations.ping();

  assert.deepEqual(order, [
    "plugin-one:start",
    "plugin-two:start",
    "terminal-fetch",
    "plugin-two:end",
    "plugin-one:end",
  ]);
});
