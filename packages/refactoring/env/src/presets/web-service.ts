import { EnvPreset } from "../manager/types";

export const $WebServicePreset = {
  NEXT_PUBLIC_API_URL: { type: "string", },
  NEXT_PUBLIC_SITE_URL: { type: "string", },

  PORT: { type: "number", default: 3000, },
  CMS_INTERNAL_HOST_URL: { type: "string", },
  REVALIDATE_WEB_SECRET_TOKEN: { type: "string", },
} as const satisfies EnvPreset;
