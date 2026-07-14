import assert from "node:assert/strict";
import test from "node:test";

import {
  toOtelMetricRecords,
  toOtelResourceAttributes
} from "../dist/index.mjs";

const report = {
  schemaVersion: "2.0",
  service: { name: "api", version: "1.2.3", environment: "production", instanceId: "api-1" },
  scope: "diagnostics",
  status: "ok",
  observedAt: "2026-01-01T00:00:00.000Z",
  durationMs: 5,
  runtime: { name: "node", version: "v24", platform: "linux", arch: "x64" },
  summary: { ok: 1, degraded: 0, unhealthy: 0, total: 1, criticalFailed: 0, nonCriticalFailed: 0 },
  checks: [{
    name: "database",
    scope: "diagnostics",
    status: "ok",
    critical: false,
    observedAt: "2026-01-01T00:00:00.000Z",
    durationMs: 2,
    timedOut: false,
    attempt: 1,
    metrics: { latencyMs: 2 }
  }],
  metrics: [{
    name: "queue.depth",
    value: 3,
    type: "gauge",
    labels: { queue: "critical" }
  }]
};

test("creates stable OpenTelemetry resource attributes", () => {
  assert.deepEqual(toOtelResourceAttributes(report), {
    "service.name": "api",
    "service.version": "1.2.3",
    "deployment.environment.name": "production",
    "service.instance.id": "api-1",
    "process.runtime.name": "node",
    "process.runtime.version": "v24",
    "host.arch": "x64",
    "os.type": "linux"
  });
});

test("exports collector metrics but not check-local metrics", () => {
  const records = toOtelMetricRecords(report);
  assert.ok(records.some((record) => record.name === "queue.depth" && record.value === 3));
  assert.ok(!records.some((record) => record.name === "latencyMs"));
});
