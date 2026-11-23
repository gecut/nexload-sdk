import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout } from "node:timers/promises";

import * as sdk from "../dist/index.mjs";
import { createTestLogger } from "../dist/testing.mjs";

test("context bindings appear on each scoped log and disappear outside the scope", () => {
  const { logger, entries } = createTestLogger();
  const child = logger.child({ module: "requests" });

  child.info("before");
  sdk.withLogContext({ requestId: "request-1" }, () => {
    child.info({ extra: true, requestId: "override" }, "first");
    child.info("second");
    assert.deepEqual(sdk.getLogContext(), { requestId: "request-1" });
  });
  child.info("after");

  assert.deepEqual(entries.map(({ requestId }) => requestId), [
    undefined, "override", "request-1", undefined,
  ]);
  assert.equal(entries[2].extra, undefined);
  assert.deepEqual(sdk.getLogContext(), {});
});

test("two concurrent contexts preserve their own request IDs across awaits", async () => {
  const entries = [];
  const logger = sdk.configureLogger({
    service: "requests",
    level: "info",
    destination: { write: (line) => entries.push(JSON.parse(line)) },
  });

  await Promise.all(
    ["request-1", "request-2"].map((requestId, index) =>
      sdk.withLogContext({ requestId }, async () => {
        logger.info({ expected: requestId }, "before");
        await setTimeout(index === 0 ? 10 : 0);
        logger.info({ expected: requestId }, "after");
      }),
    ),
  );

  assert.equal(entries.length, 4);
  for (const entry of entries) assert.equal(entry.requestId, entry.expected);
  assert.deepEqual(sdk.getLogContext(), {});
});

test("nested scopes inherit bindings and restore the outer scope on exit", () => {
  const result = sdk.withLogContext({ requestId: "outer", traceId: "trace-123" }, () => {
    sdk.withLogContext({ requestId: "inner", module: "nested" }, () => {
      assert.deepEqual(sdk.getLogContext(), {
        requestId: "inner",
        traceId: "trace-123",
        module: "nested",
      });
    });
    assert.equal(sdk.getLogContext().requestId, "outer");

    return 42;
  });
  assert.equal(result, 42);
});

test("resolveTraceId reuses valid IDs from Headers and records", () => {
  assert.equal(sdk.TRACE_HEADER, "x-trace-id");
  for (const headers of [
    new Headers({ "X-Trace-ID": "abcd1234-ef" }),
    { "x-trace-id": "abcd1234-ef" },
  ]) {
    assert.equal(sdk.resolveTraceId(headers), "abcd1234-ef");
  }
});

test("resolveTraceId generates a UUID for invalid and missing IDs", () => {
  for (const headers of [
    new Headers({ "x-trace-id": "bad id!" }),
    { "x-trace-id": "short" },
    { "x-trace-id": "a".repeat(65) },
    {},
  ]) {
    assert.match(sdk.resolveTraceId(headers), /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  }
});

test("traceHeaders uses the current traceId", () => {
  assert.deepEqual(sdk.traceHeaders(), {});
  sdk.withLogContext({ traceId: "abcd1234-ef" }, () => {
    assert.deepEqual(sdk.traceHeaders(), { "x-trace-id": "abcd1234-ef" });
  });
});
