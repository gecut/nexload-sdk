import { EnvManager, merge } from "@nexload-sdk/env";
import { $NodePreset } from "@nexload-sdk/env/presets";
import pino from "pino";

const env = new EnvManager("logger", merge($NodePreset));
export const serviceName = env.$("SERVICE_NAME");
export const logger = pino({
  name: serviceName,
  level: env.$("LOG_LEVEL"),
  transport:
    env.$("NODE_ENV") !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
          },
        }
      : {
          target: "pino/file",
          options: {
            destination: 1,
          },
        },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
  base: { pid: process.pid },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "user.password",
      "user.secret",
    ],
    censor: "[REDACTED]",
  },
});
