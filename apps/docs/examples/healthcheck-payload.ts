import { createHealthManager } from "@nexload-sdk/healthcheck";
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";

declare const payload: Parameters<typeof payloadHealthCheck>[0];

export const health = createHealthManager({
  service: { name: "cms" },
  runtime: "auto",
  checks: [payloadHealthCheck(payload, {
    collection: "users",
    depth: 0,
    limit: 1,
  })],
});
