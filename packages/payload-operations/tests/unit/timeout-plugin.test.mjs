import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import { createOperationsClient } from "../../dist/client/index.js";
import { defineCMSOperations, operation } from "../../dist/contract/index.js";
import { isTimeoutError, timeoutPlugin } from "../../dist/plugins/timeout/index.js";

test("timeoutPlugin({ timeout }) aborts a slow stub fetch; the rejection satisfies isTimeoutError(e) === true", async () => {
  const operations = defineCMSOperations({
    slowOp: operation({
      input: z.void(),
      output: z.boolean(),
    }),
  });

  let fetchAborted = false;
  const stubFetch = async (_url, init) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(new Response("ok")), 1000);
      init?.signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        fetchAborted = true;
        reject(init.signal.reason);
      });
    });
  };

  const timeout = 50;
  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
    plugins: [timeoutPlugin({ timeout })],
  });

  const startTime = Date.now();
  await assert.rejects(
    async () => client.slowOp(),
    (error) => {
      assert.equal(isTimeoutError(error), true, "isTimeoutError(error) should be true");
      assert.equal(error.name, "CMSClientTimeoutError");
      assert.equal(error.code, "TIMEOUT");
      assert.equal(error.status, 408);
      assert.equal(error.defined, false);
      assert.ok(error.message.includes(`${timeout}ms`), `error message should include timeout duration: ${error.message}`);
      return true;
    }
  );

  const elapsed = Date.now() - startTime;
  assert.ok(elapsed < 900, `elapsed time (${elapsed}ms) should be well before stub finishes (< 900ms)`);
  assert.equal(fetchAborted, true, "fetch should have received abort event on signal");
});

test("timeoutPlugin validates timeout options", () => {
  for (const invalid of [0, -1, 1.5, "50", null, undefined, NaN, Infinity]) {
    assert.throws(
      () => timeoutPlugin({ timeout: invalid }),
      {
        message: "Timeout must be a positive finite integer.",
        name: "TypeError",
      }
    );
  }
});

test("fast fetch completes without timeout", async () => {
  const operations = defineCMSOperations({
    fastOp: operation({
      input: z.object({ value: z.string() }),
      output: z.object({ echoed: z.string() }),
    }),
  });

  const stubFetch = async () => new Response(
    JSON.stringify({ echoed: "hello" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );

  const client = createOperationsClient({
    baseURL: "https://cms.example.com/api",
    fetch: stubFetch,
    operations,
    plugins: [timeoutPlugin({ timeout: 500 })],
  });

  const result = await client.fastOp({ value: "hello" });
  assert.deepEqual(result, { echoed: "hello" });
});
