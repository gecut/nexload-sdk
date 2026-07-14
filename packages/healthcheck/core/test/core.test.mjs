import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import {
  createHealthManager,
  defineHealthCheck,
  shutdownCheck,
  toHealthJson
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
  assert.equal(report.status, "unhealthy");
});

test("timeouts can degrade instead of failing health", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    defaults: { timeoutMs: 5, unhealthyOnTimeout: false },
    checks: [
      defineHealthCheck({
        name: "slow-optional",
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
  assert.equal(report.checks[0].status, "degraded");
  assert.equal(report.status, "degraded");
});

test("selected profile is available to checks as a context hint", async () => {
  const health = createHealthManager({
    service: { name: "test" },
    checks: [
      defineHealthCheck({
        name: "profile",
        scopes: ["diagnostics"],
        run: (ctx) => ({ status: "ok", metrics: { profile: ctx.profile } })
      })
    ]
  });

  const report = await health.run("diagnostics", { profile: "full" });
  assert.equal(report.checks[0].metrics.profile, "full");
});

test("public JSON suppresses error causes unless explicitly enabled", () => {
  const report = {
    schemaVersion: "2.0",
    service: { name: "test" },
    scope: "readiness",
    status: "unhealthy",
    observedAt: new Date().toISOString(),
    durationMs: 1,
    runtime: { name: "node" },
    summary: { ok: 0, degraded: 0, unhealthy: 1, total: 1, criticalFailed: 1, nonCriticalFailed: 0 },
    checks: [{
      name: "database",
      scope: "readiness",
      status: "unhealthy",
      critical: true,
      observedAt: new Date().toISOString(),
      durationMs: 1,
      timedOut: false,
      attempt: 1,
      metrics: {},
      error: { code: "DATABASE_DOWN", message: "Database failed.", causeMessage: "postgres://secret" }
    }],
    metrics: []
  };

  const publicReport = toHealthJson(report);
  assert.equal(publicReport.checks[0].error.message, "Health check failed.");
  assert.equal(publicReport.checks[0].error.causeMessage, undefined);

  const privateReport = toHealthJson(report, {
    redaction: { includeErrorMessage: true }
  });
  assert.equal(privateReport.checks[0].error.message, "Database failed.");
  assert.equal(privateReport.checks[0].error.causeMessage, "postgres://secret");
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
