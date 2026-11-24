/* eslint-disable turbo/no-undeclared-env-vars -- These tests set and restore the runtime fallbacks. */

import assert from "node:assert/strict";
import { test } from "node:test";

test("getPinoLogger returns the configured pino instance", async () => {
  const { configureLogger, getPinoLogger } = await import("../dist/index.mjs?pino-bridge");
  const entries = [];
  configureLogger({
    service: "payload",
    destination: { write: (line) => entries.push(JSON.parse(line)) },
  });

  getPinoLogger().info({ password: "secret", event: "payload.test.created" }, "Created");

  assert.equal(entries.length, 1);
  assert.equal(entries[0].password, "[REDACTED]");
  assert.equal(entries[0].event, "payload.test.created");
  assert.equal(entries[0].service, "payload");
});

const createTestLogger = async (options) => {
  const testing = await import("../dist/testing.mjs");

  return testing.createTestLogger(options);
};

function capture() {
  const entries = [];

  return {
    entries,
    destination: {
      write(line) {
        entries.push(JSON.parse(line));
      },
    },
  };
}

test("createTestLogger captures info with service and lowercase level", async () => {
  const { logger, entries, clear } = await createTestLogger({
    service: "test",
    level: "info",
  });

  logger.info("hello");

  const [{ level, service, msg }] = entries;
  assert.deepEqual(
    { level, service, msg },
    { level: "info", service: "test", msg: "hello" },
  );
  clear();
  assert.deepEqual(entries, []);
});

test("success level is between info and warn", async () => {
  const { logger, entries } = await createTestLogger({ level: "success" });

  logger.info("dropped");
  logger.success("kept");
  logger.warn("also kept");

  assert.deepEqual(
    entries.map(({ level }) => level),
    ["success", "warn"],
  );
});

test("object-first call merges bindings", async () => {
  const { logger, entries } = await createTestLogger({ level: "info" });

  logger.info({ orderId: 7 }, "created");

  const [{ orderId, msg }] = entries;
  assert.deepEqual({ orderId, msg }, { orderId: 7, msg: "created" });
});

test("child adds bindings", async () => {
  const { logger, entries } = await createTestLogger({ level: "warn" });

  logger.child({ module: "pay" }).warn("x");

  assert.equal(entries[0].module, "pay");
});

test("configureLogger returns a proxy that serializes Error-first calls", async () => {
  const { configureLogger } = await import("../dist/index.mjs?configured-error");
  const output = capture();
  const configured = configureLogger({ service: "test", destination: output.destination });

  configured.error(new Error("boom"));

  assert.equal(output.entries[0].err.message, "boom");
});

test("configureLogger result child follows later forced reconfigure", async () => {
  const { configureLogger } = await import("../dist/index.mjs?configured-child");
  const first = capture();
  const second = capture();
  const child = configureLogger({ service: "first", destination: first.destination })
    .child({ module: "orders" });

  child.info("before");
  configureLogger({ service: "second", destination: second.destination, force: true });
  child.info("after");

  assert.equal(first.entries.length, 1);
  assert.equal(second.entries.length, 1);
  assert.equal(second.entries[0].service, "second");
  assert.equal(second.entries[0].module, "orders");
});

test("configureLogger twice keeps the first config and warns once", async () => {
  const { configureLogger, logger } = await import("../dist/index.mjs?once");
  const first = capture();
  const second = capture();

  const active = configureLogger({
    service: "first",
    level: "info",
    destination: first.destination,
  });
  const ignored = configureLogger({
    service: "second",
    destination: second.destination,
  });
  logger.info("still first");

  assert.equal(ignored, active);
  assert.deepEqual(second.entries, []);
  assert.equal(first.entries.length, 2);
  assert.equal(first.entries[0].level, "warn");
  assert.equal(first.entries[0].event, "logger.reconfigure.ignored");
  assert.equal(first.entries[1].service, "first");
});

test("module-level children follow configuration and forced replacements", async () => {
  const { configureLogger, logger } = await import("../dist/index.mjs?early");
  const early = logger.child({ m: 1 }).child({ nested: true });
  const first = capture();
  const second = capture();

  configureLogger({
    service: "svc",
    level: "info",
    destination: first.destination,
  });
  early.info("x");

  assert.equal(first.entries.length, 1);
  assert.equal(first.entries[0].service, "svc");
  assert.equal(first.entries[0].m, 1);
  assert.equal(first.entries[0].nested, true);

  configureLogger({
    service: "new",
    level: "warn",
    destination: second.destination,
    force: true,
  });
  assert.equal(early.isLevelEnabled("info"), false);
  early.info("dropped");
  early.warn("kept");

  assert.equal(first.entries.length, 1);
  assert.equal(second.entries.length, 1);
  assert.equal(second.entries[0].service, "new");
  assert.equal(second.entries[0].m, 1);
});

test("default export is the same proxy as named logger", async () => {
  const { default: defaultLogger, logger } = await import("../dist/index.mjs");

  assert.equal(defaultLogger, logger);
});

test("base fields include release, instance, environment, pid and ISO time", async () => {
  const base = { release: "r1", instance: "worker-1", environment: "test" };
  const { logger, entries } = await createTestLogger({
    ...base,
    level: "info",
  });

  logger.info("ready");

  const [{ release, instance, environment, pid, time }] = entries;
  assert.deepEqual({ release, instance, environment }, base);
  assert.equal(pid, process.pid);
  assert.equal(new Date(time).toISOString(), time);
});

test("LOG_LEVEL accepts uppercase and invalid values fall back", async (t) => {
  const previousLevel = process.env.LOG_LEVEL;
  const previousEnvironment = process.env.NODE_ENV;
  t.after(() => {
    restoreEnv("LOG_LEVEL", previousLevel);
    restoreEnv("NODE_ENV", previousEnvironment);
  });
  process.env.NODE_ENV = "production";
  process.env.LOG_LEVEL = "WARN";
  const { logger } = await createTestLogger();

  assert.equal(logger.isLevelEnabled("info"), false);
  assert.equal(logger.isLevelEnabled("warn"), true);

  process.env.LOG_LEVEL = "constructor";
  const { logger: fallback } = await createTestLogger();
  assert.equal(fallback.isLevelEnabled("debug"), false);
  assert.equal(fallback.isLevelEnabled("info"), true);
});

test("default level is info in production and debug otherwise", async (t) => {
  const previousLevel = process.env.LOG_LEVEL;
  const previousEnvironment = process.env.NODE_ENV;
  t.after(() => {
    restoreEnv("LOG_LEVEL", previousLevel);
    restoreEnv("NODE_ENV", previousEnvironment);
  });
  delete process.env.LOG_LEVEL;
  process.env.NODE_ENV = "production";
  const { logger: production } = await createTestLogger();
  assert.equal(production.isLevelEnabled("info"), true);
  assert.equal(production.isLevelEnabled("debug"), false);

  process.env.NODE_ENV = "development";
  const { logger: development } = await createTestLogger();
  assert.equal(development.isLevelEnabled("debug"), true);
  assert.equal(development.isLevelEnabled("trace"), false);
});

test("log-test subpath is gone", async () => {
  await assert.rejects(import("@nexload-sdk/logger/log-test"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  });
});

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
