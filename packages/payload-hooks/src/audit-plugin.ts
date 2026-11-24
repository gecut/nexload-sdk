import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionAfterOperationHook, Plugin } from "payload";

import type { Logger } from "@nexload-sdk/logger";

import logger from "@nexload-sdk/logger";

export type AuditOperation = "create" | "update" | "delete" | "read" | "auth";
export type AuditPluginOptions = {
  collections?: "all" | string[];
  exclude?: string[];
  operations?: AuditOperation[];
  logger?: Pick<Logger, "info">;
};

export const AUDIT_PLUGIN_ORDER = 1000;

export function auditPlugin(options: AuditPluginOptions = {}): Plugin {
  const operations = options.operations ?? ["create", "update", "delete", "auth"];
  const log = options.logger ?? logger;
  const emit = (entry: Record<string, unknown>, message: string): void => {
    try {
      log.info(entry, message);
    } catch {
      // Logging must never break a Payload operation.
    }
  };

  const afterChange: CollectionAfterChangeHook = (args) => {
    if (operations.includes(args.operation)) {
      const userId = args.req?.user?.id;
      emit({ event: `payload.document.${args.operation === "create" ? "created" : "updated"}`, collection: args.collection.slug, operation: args.operation, id: args.doc?.id, ...(userId == null ? {} : { userId }) }, `Payload document ${args.operation === "create" ? "created" : "updated"}`);
    }

    return args.doc;
  };
  const afterDelete: CollectionAfterDeleteHook = (args) => {
    const userId = args.req?.user?.id;
    emit({ event: "payload.document.deleted", collection: args.collection.slug, operation: "delete", id: args.doc?.id ?? args.id, ...(userId == null ? {} : { userId }) }, "Payload document deleted");

    return args.doc;
  };
  const afterOperation: CollectionAfterOperationHook = (args) => {
    const { operation, result, collection } = args;

    if (operations.includes("read") && operation === "find") {
      emit({ event: "payload.documents.listed", collection: collection.slug, operation, count: result.docs.length }, "Payload documents listed");
    } else if (operations.includes("read") && operation === "findByID") {
      emit({ event: "payload.document.read", collection: collection.slug, operation, id: result?.id }, "Payload document read");
    } else if (operations.includes("auth") && collection.auth) {
      if (operation === "login" || operation === "resetPassword") {
        const userId = result?.user?.id;
        emit({ event: operation === "login" ? "payload.auth.logged_in" : "payload.auth.password_reset", collection: collection.slug, operation, ...(userId == null ? {} : { userId }) }, operation === "login" ? "Payload user logged in" : "Payload password reset");
      } else if (operation === "forgotPassword") {
        emit({ event: "payload.auth.password_reset_requested", collection: collection.slug, operation }, "Payload password reset requested");
      }
    }

    return result;
  };

  const plugin: Plugin = (config) => {
    const slugs = new Set(config.collections?.map((collection) => collection.slug) ?? []);
    const requested = Array.isArray(options.collections) ? options.collections : [];

    for (const slug of [...requested, ...(options.exclude ?? [])]) {
      if (!slugs.has(slug)) throw new Error(`auditPlugin: unknown collection "${slug}"`);
    }

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if ((Array.isArray(options.collections) && !options.collections.includes(collection.slug)) || options.exclude?.includes(collection.slug)) return collection;
        const hooks = { ...collection.hooks };

        if (operations.includes("create") || operations.includes("update")) hooks.afterChange = [...(hooks.afterChange ?? []), afterChange];
        if (operations.includes("delete")) hooks.afterDelete = [...(hooks.afterDelete ?? []), afterDelete];
        if (operations.includes("read") || (operations.includes("auth") && collection.auth)) hooks.afterOperation = [...(hooks.afterOperation ?? []), afterOperation];

        return { ...collection, hooks };
      })
    };
  };
  plugin.order = AUDIT_PLUGIN_ORDER;
  plugin.slug = "nexload-audit";

  return plugin;
}
