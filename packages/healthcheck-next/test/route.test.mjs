import assert from "node:assert/strict";
import test from "node:test";
import {
  createHealthManager,
  defineHealthCheck
} from "@nexload-sdk/healthcheck";
import {
  createNextHealthRoute,
  createNextMetricsRoute
} from "../dist/index.mjs";

test("health route sets headers and supports HEAD", async () => {
  const manager = createHealthManager({
    service: { name: "web" },
    checks: [
      defineHealthCheck({
        name: "ok",
        scopes: ["readiness"],
        run: () => ({ status: "ok" })
      })
    ]
  });
  const route = createNextHealthRoute(manager, { scope: "readiness", format: "json" });
  const response = await route.GET(new Request("https://example.com/api/health"));
  const head = await route.HEAD(new Request("https://example.com/api/health"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("x-health-status"), "ok");
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("protected metrics route rejects unauthorized requests", async () => {
  const manager = createHealthManager({ service: { name: "web" } });
  const route = createNextMetricsRoute(manager, {
    format: "prometheus",
    protect: { bearerToken: "secret" }
  });
  const response = await route.GET(new Request("https://example.com/api/metrics"));

  assert.equal(response.status, 401);
});
