import assert from "node:assert/strict";
import test from "node:test";
import { evaluate } from "../src/lib/playgrounds/health.ts";

test("one local critical check drives reports and all exporter views", async () => {
  for (const status of ["ok", "degraded", "unhealthy"]) {
    assert.equal(JSON.parse(await evaluate(status, "JSON")).status, status);
  }
  assert.match(await evaluate("ok", "Prometheus"), /nexload_health_status/);
  assert.match(await evaluate("ok", "OpenMetrics"), /# EOF\n$/);
  const records = JSON.parse(await evaluate("unhealthy", "OTel"));
  assert.equal(records.find(row => row.name === "health.status").value, 0);
  assert.equal(await evaluate("invalid", "JSON"), "Enter ok, degraded or unhealthy.");
});
