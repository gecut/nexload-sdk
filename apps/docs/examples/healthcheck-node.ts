import { createHealthManager } from "@nexload-sdk/healthcheck";
import {
  nodeRuntimeAdapter,
  processMetricsCollector,
  tcpCheck,
} from "@nexload-sdk/healthcheck-node";

export const health = createHealthManager({
  service: { name: "node-api" },
  runtime: nodeRuntimeAdapter(),
  checks: [tcpCheck("postgres", { host: "db", port: 5432 })],
  collectors: [processMetricsCollector()],
});
