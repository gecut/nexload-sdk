import assert from "node:assert/strict";
import test from "node:test";
import { toPrometheusText } from "../dist/index.mjs";

test("serializes stable health metrics without raw error labels", () => {
  const text = toPrometheusText({
    schemaVersion: "2.0",
    service: { name: "api" },
    scope: "readiness",
    status: "ok",
    observedAt: new Date().toISOString(),
    durationMs: 5,
    runtime: { name: "node" },
    summary: { ok: 1, degraded: 0, unhealthy: 0, total: 1, criticalFailed: 0, nonCriticalFailed: 0 },
    checks: [
      {
        name: "database",
        scope: "readiness",
        status: "ok",
        critical: true,
        observedAt: new Date().toISOString(),
        durationMs: 2,
        timedOut: false,
        attempt: 1,
        metrics: {}
      }
    ],
    metrics: [
      { name: "process.memory.rss_bytes", value: 100, unit: "bytes", type: "gauge", labels: { runtime: "node" } },
      { name: "bad.metric", value: 1, labels: { request_id: "abc" } }
    ]
  });

  assert.match(text, /nexload_health_status/);
  assert.match(text, /nexload_health_check_duration_milliseconds/);
  assert.doesNotMatch(text, /request_id/);
});

test("includeDescriptions emits HELP for built-in and collector metrics", () => {
  const text = toPrometheusText({
    schemaVersion: "2.0",
    service: { name: "api" },
    scope: "diagnostics",
    status: "ok",
    observedAt: new Date().toISOString(),
    durationMs: 5,
    runtime: { name: "node" },
    summary: { ok: 0, degraded: 0, unhealthy: 0, total: 0, criticalFailed: 0, nonCriticalFailed: 0 },
    checks: [],
    metrics: [{ name: "queue.depth", value: 3, description: "Current queue depth." }]
  }, { includeDescriptions: true });

  assert.match(text, /# HELP nexload_health_status Current aggregate health status\./);
  assert.match(text, /# HELP nexload_queue_depth Current queue depth\./);
});
