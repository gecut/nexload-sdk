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
    unit: "count",
    type: "gauge",
    observedAt: "2026-01-01T00:00:01.000Z",
    labels: { queue: "critical", request_id: "request-123" }
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
  assert.ok(records.some((record) => (
    record.name === "queue.depth"
    && record.value === 3
    && record.unit === "count"
    && record.type === "gauge"
    && record.observedAt === "2026-01-01T00:00:01.000Z"
  )));
  assert.ok(!records.some((record) => record.name === "latencyMs"));
});

test("maps statuses and preserves labels for caller-side cardinality review", () => {
  const degraded = toOtelMetricRecords({
    ...report,
    status: "degraded",
    checks: [{ ...report.checks[0], status: "unhealthy" }]
  });

  assert.equal(degraded.find((record) => record.name === "health.status").value, 0.5);
  assert.equal(degraded.find((record) => record.name === "health.check.status").value, 0);
  const queue = degraded.find((record) => record.name === "queue.depth");
  assert.equal(queue.attributes.queue, "critical");
  assert.equal(queue.attributes.request_id, "request-123");
});
