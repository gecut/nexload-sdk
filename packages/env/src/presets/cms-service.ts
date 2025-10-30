import { EnvPreset } from "../manager/types";

export const $CmsServicePreset = {
  NEXT_PUBLIC_SITE_URL: { type: "string", },
  REVALIDATE_WEB_SECRET_TOKEN: { type: "string", },
  PORT: { type: "number", default: 4000, },
  JWT_SECRET: { type: "string", },
  PAYLOAD_SECRET: { type: "string", },
  DATABASE_URL: { type: "string", },
  CMS_ADMIN_EMAIL: { type: "string", },
  CMS_ADMIN_PASSWORD: { type: "string", },
} as const satisfies EnvPreset;
