import type { Plugin } from "payload";

import { getPayloadLoggerConfig } from "@nexload-sdk/logger";

export function payloadLoggerPlugin (): Plugin {
  return (config) => config.logger === undefined
    ? { ...config, logger: getPayloadLoggerConfig() }
    : config;
}
