import { createHealthManager } from "@nexload-sdk/healthcheck";
import {
  bunRuntimeAdapter,
  bunServerMetricsCheck,
  type BunServerLike,
} from "@nexload-sdk/healthcheck-bun";

declare const server: BunServerLike;

export const health = createHealthManager({
  service: { name: "bun-api" },
  runtime: bunRuntimeAdapter(),
  checks: [bunServerMetricsCheck(server)],
});
