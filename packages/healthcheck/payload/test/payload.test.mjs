import assert from "node:assert/strict";
import test from "node:test";

import { createHealthManager } from "@nexload-sdk/healthcheck";
import { payloadHealthCheck } from "../dist/index.mjs";

test("runs a small deterministic readiness query", async () => {
  let received;
  const payload = {
    async find(options) {
      received = options;
      return { totalDocs: 1, docs: [{}] };
    }
  };
  const manager = createHealthManager({
    service: { name: "cms" },
    checks: [payloadHealthCheck(payload, { collection: "users" })]
  });

  const report = await manager.run("readiness");
  assert.equal(report.status, "ok");
  assert.deepEqual(received, { collection: "users", limit: 1, depth: 0, where: undefined });
});

test("fails readiness when the expected document count is not met", async () => {
  const payload = { find: async () => ({ totalDocs: 0, docs: [] }) };
  const manager = createHealthManager({
    service: { name: "cms" },
    checks: [payloadHealthCheck(payload, { collection: "settings", expectedMinDocuments: 1 })]
  });

  const report = await manager.run("readiness");
  assert.equal(report.status, "unhealthy");
  assert.equal(report.checks[0].error.code, "PAYLOAD_QUERY_FAILED");
});

test("normalizes Payload query failures", async () => {
  const payload = { find: async () => { throw new Error("database url secret"); } };
  const manager = createHealthManager({
    service: { name: "cms" },
    checks: [payloadHealthCheck(payload, { collection: "users" })]
  });

  const report = await manager.run("readiness");
  assert.equal(report.checks[0].error.code, "PAYLOAD_QUERY_FAILED");
  assert.equal(report.checks[0].error.message, "Payload query failed.");
});

test("delegates query timeout normalization to the manager", async () => {
  const payload = { find: async () => new Promise(() => {}) };
  const manager = createHealthManager({
    service: { name: "cms" },
    checks: [payloadHealthCheck(payload, { collection: "users", timeoutMs: 5 })]
  });

  const report = await manager.run("readiness");
  assert.equal(report.status, "unhealthy");
  assert.equal(report.checks[0].timedOut, true);
  assert.equal(report.checks[0].error.code, "CHECK_TIMEOUT");
});
