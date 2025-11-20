import { EnvPreset } from "../manager/types";

export const $NodePreset = {
  NODE_ENV: { type: "string", default: "development", },
  LOG_LEVEL: { type: "string", default: "trace", },
  SERVICE_NAME: { type: "string", default: "UNKNOWN", },
} as const satisfies EnvPreset;
