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

function changeEventAndMessage(operation: string): { event: string; message: string } {
  return operation === "create"
    ? { event: "payload.document.created", message: "Payload document created" }
    : { event: "payload.document.updated", message: "Payload document updated" };
}

function userBinding(userId?: unknown): Record<string, unknown> {
  return userId == null ? {} : { userId };
}

export function auditPlugin(options: AuditPluginOptions = {}): Plugin {
  const operations = options.operations ?? ["create", "update", "delete", "auth"];
  const log = options.logger ?? logger;
  const emit = (entry: Record<string, unknown>, message: string): void => {
    log.info(entry, message);
  };

  const afterChange: CollectionAfterChangeHook = (args) => {
    try {
      if (operations.includes(args.operation)) {
        const { event, message } = changeEventAndMessage(args.operation);
        const doc = args.doc as { id?: string | number } | undefined;
        const userId = args.req?.user?.id;

        emit(
          {
            event,
            collection: args.collection.slug,
            operation: args.operation,
            id: doc?.id,
            ...userBinding(userId),
          },
          message,
        );
      }
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.doc;
  };

  const afterDelete: CollectionAfterDeleteHook = (args) => {
    try {
      const doc = args.doc as { id?: string | number } | undefined;
      const userId = args.req?.user?.id;

      emit(
        {
          event: "payload.document.deleted",
          collection: args.collection.slug,
          operation: "delete",
          id: doc?.id ?? args.id,
          ...userBinding(userId),
        },
        "Payload document deleted",
      );
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.doc;
  };

  const afterOperation: CollectionAfterOperationHook = (args) => {
    try {
      const { operation, collection } = args;
      const result = args.result as Record<string, unknown> | null | undefined;
      const hasAuth = Boolean((collection as { auth?: unknown }).auth);

      if (operations.includes("read") && operation === "find") {
        const count = (result as { docs?: unknown[] } | null | undefined)?.docs?.length ?? 0;
        emit(
          {
            event: "payload.documents.listed",
            collection: collection.slug,
            operation,
            count,
          },
          "Payload documents listed",
        );
      } else if (operations.includes("read") && operation === "findByID") {
        const id = (result as { id?: string | number } | null | undefined)?.id;
        emit(
          {
            event: "payload.document.read",
            collection: collection.slug,
            operation,
            id,
          },
          "Payload document read",
        );
      } else if (operations.includes("auth") && hasAuth) {
        if (operation === "login" || operation === "resetPassword") {
          const userId = (result as { user?: { id?: string | number } } | null | undefined)?.user?.id;
          const isLogin = operation === "login";
          emit(
            {
              event: isLogin ? "payload.auth.logged_in" : "payload.auth.password_reset",
              collection: collection.slug,
              operation,
              ...userBinding(userId),
            },
            isLogin ? "Payload user logged in" : "Payload password reset",
          );
        } else if (operation === "forgotPassword") {
          emit(
            {
              event: "payload.auth.password_reset_requested",
              collection: collection.slug,
              operation,
            },
            "Payload password reset requested",
          );
        }
      }
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.result;
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
        if (
          (Array.isArray(options.collections) && !options.collections.includes(collection.slug))
          || options.exclude?.includes(collection.slug)
        ) {
          return collection;
        }
        const hooks = { ...collection.hooks };

        if (operations.includes("create") || operations.includes("update")) {
          hooks.afterChange = [...(hooks.afterChange ?? []), afterChange];
        }
        if (operations.includes("delete")) {
          hooks.afterDelete = [...(hooks.afterDelete ?? []), afterDelete];
        }
        if (operations.includes("read") || (operations.includes("auth") && collection.auth)) {
          hooks.afterOperation = [...(hooks.afterOperation ?? []), afterOperation];
        }

        return { ...collection, hooks };
      }),
    };
  };
  plugin.order = AUDIT_PLUGIN_ORDER;
  plugin.slug = "nexload-audit";

  return plugin;
}
