import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import {
  createHealthManager,
  defineHealthCheck,
  shutdownCheck
} from "../dist/index.mjs";

test("thrown checks become standardized results", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    checks: [
      defineHealthCheck({
        name: "throws",
        scopes: ["readiness"],
        run() {
          throw new Error("boom");
        }
      })
    ]
  });

  const report = await health.run("readiness");
  assert.equal(report.status, "unhealthy");
  assert.equal(report.checks[0].error.code, "CHECK_THROWN");
});

test("timeout checks become standardized results", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    defaults: { timeoutMs: 5 },
    checks: [
      defineHealthCheck({
        name: "slow",
        scopes: ["readiness"],
        async run() {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { status: "ok" };
        }
      })
    ]
  });

  const report = await health.run("readiness");
  assert.equal(report.checks[0].timedOut, true);
  assert.equal(report.checks[0].error.code, "CHECK_TIMEOUT");
});

test("retry policy retries configured statuses", async () => {
  let calls = 0;
  const health = createHealthManager({
    service: { name: "test" },
    checks: [
      defineHealthCheck({
        name: "retry",
        scopes: ["readiness"],
        retries: { attempts: 1 },
        run() {
          calls += 1;
          return { status: calls === 1 ? "unhealthy" : "ok" };
        }
      })
    ]
  });

  const report = await health.run("readiness");
  assert.equal(calls, 2);
  assert.equal(report.status, "ok");
});

test("non-critical unhealthy checks degrade the report", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    checks: [
      defineHealthCheck({
        name: "optional",
        scopes: ["diagnostics"],
        critical: false,
        run: () => ({ status: "unhealthy" })
      })
    ]
  });

  const report = await health.run("diagnostics");
  assert.equal(report.status, "degraded");
});

test("shutdown state is reflected by shutdownCheck", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    checks: [shutdownCheck()]
  });

  health.setShutdownState(true, "test");
  const report = await health.run("liveness");
  assert.equal(report.status, "unhealthy");
  assert.equal(report.checks[0].metrics.shuttingDown, true);
  health.dispose();
});

test("cjs export is available", () => {
  const require = createRequire(import.meta.url);
  const mod = require("../dist/index.cjs");
  assert.equal(typeof mod.createHealthManager, "function");
});
