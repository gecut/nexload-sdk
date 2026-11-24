import type { Plugin } from "payload";

import type { PayloadFieldsPluginOptions } from "@nexload-sdk/payload-fields";
import type { AuditPluginOptions } from "@nexload-sdk/payload-hooks";

import { payloadFieldsPlugin } from "@nexload-sdk/payload-fields";
import { auditPlugin } from "@nexload-sdk/payload-hooks";

import { payloadLoggerPlugin } from "./logger";
import { persianPlugin } from "./persian";

export { payloadLoggerPlugin } from "./logger";
export { persianPlugin } from "./persian";
export type { AuditOperation, AuditPluginOptions } from "@nexload-sdk/payload-hooks";

export type NexloadPresetOptions = {
  persian?: boolean
  fields?: false | PayloadFieldsPluginOptions
  audit?: false | AuditPluginOptions
  logger?: boolean
};

export function nexloadPreset (options: NexloadPresetOptions = {}): Plugin[] {
  const plugins: Plugin[] = [];

  if (options.persian !== false) plugins.push(persianPlugin());
  if (options.logger !== false) plugins.push(payloadLoggerPlugin());
  if (options.fields !== false) plugins.push(payloadFieldsPlugin(options.fields));
  if (options.audit !== false) plugins.push(auditPlugin(options.audit));

  return plugins;
}
