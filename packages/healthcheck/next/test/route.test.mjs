import assert from "node:assert/strict";
import test from "node:test";
import {
  createHealthManager,
  defineHealthCheck,
  STRICT_READINESS_HTTP_STATUS_POLICY
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

test("route protection rejects empty or incomplete configuration", () => {
  const manager = createHealthManager({ service: { name: "web" } });

  assert.throws(
    () => createNextHealthRoute(manager, { scope: "diagnostics", protect: {} }),
    /protection/i
  );
  assert.throws(
    () => createNextHealthRoute(manager, { scope: "diagnostics", protect: { bearerToken: "" } }),
    /bearer/i
  );
  assert.throws(
    () => createNextHealthRoute(manager, { scope: "diagnostics", protect: { allowCidrs: ["10.0.0.0/8"] } }),
    /trustProxy/i
  );
  assert.throws(
    () => createNextHealthRoute(manager, { scope: "diagnostics", protect: { allowCidrs: ["not-a-cidr"], trustProxy: true } }),
    /CIDR/i
  );
});

test("IP protection denies requests without a trusted proxy address", async () => {
  const manager = createHealthManager({ service: { name: "web" } });
  const route = createNextHealthRoute(manager, {
    scope: "diagnostics",
    protect: { allowCidrs: ["10.0.0.0/8"], trustProxy: true }
  });

  const response = await route.GET(new Request("https://example.com/api/diagnostics"));
  assert.equal(response.status, 401);
});

test("strict readiness maps degraded reports to 503", async () => {
  const manager = createHealthManager({
    service: { name: "web" },
    checks: [{
      name: "optional",
      scopes: ["readiness"],
      critical: false,
      run: () => ({ status: "unhealthy" })
    }]
  });
  const route = createNextHealthRoute(manager, {
    scope: "readiness",
    httpStatus: STRICT_READINESS_HTTP_STATUS_POLICY
  });

  const response = await route.GET(new Request("https://example.com/api/health"));
  assert.equal(response.status, 503);
});
