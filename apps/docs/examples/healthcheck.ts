import {
  createHealthManager,
  shutdownCheck,
  stringifyHealthJson,
} from "@nexload-sdk/healthcheck";

const health = createHealthManager({
  service: { name: "api" },
  runtime: "auto",
  checks: [shutdownCheck()],
});

const report = await health.run("readiness");
console.log(stringifyHealthJson(report));
