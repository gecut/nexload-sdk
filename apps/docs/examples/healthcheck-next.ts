import { createHealthManager } from "@nexload-sdk/healthcheck";
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";

const health = createHealthManager({
  service: { name: "web" },
  runtime: "auto",
});

export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "readiness",
  format: "json",
});
