import type { CMSClientPlugin } from "../transport/types.js";

export function defineClientPlugin<const TPlugin extends CMSClientPlugin> (plugin: TPlugin): TPlugin {
  if (
    typeof plugin !== "object"
    || plugin === null
    || typeof plugin.name !== "string"
    || plugin.name.trim().length === 0
    || typeof plugin.wrapTransport !== "function"
  ) {
    throw new TypeError("Invalid CMS client plugin.");
  }

  return Object.freeze(plugin);
}
