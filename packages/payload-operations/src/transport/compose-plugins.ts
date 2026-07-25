import type {
  CMSClientPlugin,
  CMSClientTransport
} from "./types.js";

export function composeClientPlugins (
  terminal: CMSClientTransport,
  plugins: readonly CMSClientPlugin[]
): CMSClientTransport {
  assertUniquePluginNames(plugins);

  return plugins.reduceRight<CMSClientTransport>(
    (
      next, plugin
    ) => plugin.wrapTransport(next), terminal
  );
}

function assertUniquePluginNames (plugins: readonly CMSClientPlugin[]): void {
  const names = new Set<string>();

  for (const plugin of plugins) {
    if (
      typeof plugin !== "object"
      || plugin === null
      || typeof plugin.name !== "string"
      || plugin.name.trim().length === 0
      || typeof plugin.wrapTransport !== "function"
    ) {
      throw new TypeError("Invalid CMS client plugin.");
    }

    if (names.has(plugin.name)) {
      throw new TypeError(`Duplicate CMS client plugin: ${plugin.name}`);
    }

    names.add(plugin.name);
  }
}
