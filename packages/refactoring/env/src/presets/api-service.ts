import { EnvPreset } from "../manager/types";

export const $ApiServicePreset = {
  WEB_URL: { type: "string", },
  PORT: { type: "number", default: 3000, },
  CMS_INTERNAL_HOST_URL: { type: "string", },
  JWT_SECRET: { type: "string", },
} as const satisfies EnvPreset;
