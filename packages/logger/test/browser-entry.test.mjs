import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import * as node from "../dist/index.mjs";

const importBrowser = () => import("../dist/index.browser.mjs");

test("browser entry exports the same names as the Node entry", async () => {
  const browser = await importBrowser();
  assert.deepEqual(Object.keys(browser), Object.keys(node));
  assert.equal(browser.default, browser.logger);
});

test("browser bundle contains no async_hooks import", async () => {
  const bundle = await readFile(new URL("../dist/index.browser.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(bundle, /async_hooks/);
});

test("browser withLogContext passes through the callback and leaves context empty", async () => {
  const browser = await importBrowser();
  const result = Promise.resolve(42);

  assert.equal(browser.withLogContext({ traceId: "abcd1234-ef" }, () => {
    assert.deepEqual(browser.getLogContext(), {});
    assert.deepEqual(browser.traceHeaders(), {});

    return result;
  }), result);
  assert.equal(await result, 42);
});

for (const condition of ["browser", "edge-light", "worker"]) {
  test(`the ${condition} condition resolves the browser entry before import`, () => {
    const resolved = execFileSync(process.execPath, [
      "--conditions=" + condition,
      "--input-type=module",
      "--eval",
      'process.stdout.write(import.meta.resolve("@nexload-sdk/logger"))',
    ], { encoding: "utf8", cwd: new URL("..", import.meta.url) });

    assert.equal(resolved, new URL("../dist/index.browser.mjs", import.meta.url).href);
  });
}

test("browser logger writes redacted, serialized records without a Node process global", async (t) => {
  const write = t.mock.method(console, "error", () => {});
  const previousProcess = globalThis.process;
  globalThis.process = undefined;

  try {
    const { configureLogger, logger } = await import("../dist/index.browser.mjs?no-process");
    configureLogger({ service: "edge", level: "info" });
    logger.child({ module: "requests" }).error({
      err: new Error("failed"),
      token: "secret",
    }, "request failed");
  } finally {
    globalThis.process = previousProcess;
  }

  const [record] = write.mock.calls[0].arguments;
  assert.equal(record.service, "edge");
  assert.equal(record.module, "requests");
  assert.equal(record.level, "error");
  assert.equal(record.err.message, "failed");
  assert.equal(record.token, "[REDACTED]");
  assert.equal(record.msg, "request failed");
  assert.equal(new Date(record.time).toISOString(), record.time);
});
