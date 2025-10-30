import { EnvManager, merge } from "@nexload-sdk/env";
import { $NodePreset } from "@nexload-sdk/env/presets";
import pino from "pino";
import pretty from "pino-pretty";

const env = new EnvManager(
  "logger", merge($NodePreset)
);
const serviceName = env.$("SERVICE_NAME");
const stream = pretty({
  colorize: pretty.isColorSupported,
  ignore: "pid,hostname",
});
const logger = pino(
  {
    name: serviceName,
    level: env.$("LOG_LEVEL"),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level (label) {
        return { level: label.toUpperCase(), };
      },
    },
    base: { pid: process.pid, },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "user.password",
        "user.secret"
      ],
      censor: "[REDACTED]",
    },
  }, stream
);

export { withLogger } from "./next-js";
export default logger;
