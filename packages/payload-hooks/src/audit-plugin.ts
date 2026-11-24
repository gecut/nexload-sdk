import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
  Plugin,
} from "payload";

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

type AuditLogger = Pick<Logger, "info">;
type ConfigCollection = NonNullable<Parameters<Plugin>[0]["collections"]>[number];

const DEFAULT_OPERATIONS: AuditOperation[] = ["create", "update", "delete", "auth"];

function changeEventAndMessage(operation: string): { event: string; message: string } {
  return operation === "create"
    ? { event: "payload.document.created", message: "Payload document created" }
    : { event: "payload.document.updated", message: "Payload document updated" };
}

function userBinding(userId?: unknown): Record<string, unknown> {
  return userId == null ? {} : { userId };
}

function normalizeOperations(operations?: AuditOperation[]): AuditOperation[] {
  return operations ?? DEFAULT_OPERATIONS;
}

function validateCollectionSlugs(
  collections: Set<string>,
  options: AuditPluginOptions,
): void {
  const requested = Array.isArray(options.collections) ? options.collections : [];

  for (const slug of [...requested, ...(options.exclude ?? [])]) {
    if (!collections.has(slug)) {
      throw new Error(`auditPlugin: unknown collection "${slug}"`);
    }
  }
}

function isCollectionTargeted(
  collectionSlug: string,
  options: AuditPluginOptions,
): boolean {
  if (Array.isArray(options.collections) && !options.collections.includes(collectionSlug)) {
    return false;
  }
  if (options.exclude?.includes(collectionSlug)) {
    return false;
  }

  return true;
}

function buildChangeEntry(
  collectionSlug: string,
  operation: string,
  doc?: { id?: string | number },
  userId?: unknown,
): { entry: Record<string, unknown>; message: string } {
  const { event, message } = changeEventAndMessage(operation);

  return {
    entry: {
      event,
      collection: collectionSlug,
      operation,
      id: doc?.id,
      ...userBinding(userId),
    },
    message,
  };
}

function buildDeleteEntry(
  collectionSlug: string,
  operationId?: string | number,
  doc?: { id?: string | number },
  userId?: unknown,
): { entry: Record<string, unknown>; message: string } {
  return {
    entry: {
      event: "payload.document.deleted",
      collection: collectionSlug,
      operation: "delete",
      id: doc?.id ?? operationId,
      ...userBinding(userId),
    },
    message: "Payload document deleted",
  };
}

function buildFindEntry(
  collectionSlug: string,
  operation: string,
  result?: Record<string, unknown> | null,
): { entry: Record<string, unknown>; message: string } {
  const count = (result as { docs?: unknown[] } | null | undefined)?.docs?.length ?? 0;

  return {
    entry: {
      event: "payload.documents.listed",
      collection: collectionSlug,
      operation,
      count,
    },
    message: "Payload documents listed",
  };
}

function buildFindByIdEntry(
  collectionSlug: string,
  operation: string,
  result?: Record<string, unknown> | null,
): { entry: Record<string, unknown>; message: string } {
  const id = (result as { id?: string | number } | null | undefined)?.id;

  return {
    entry: {
      event: "payload.document.read",
      collection: collectionSlug,
      operation,
      id,
    },
    message: "Payload document read",
  };
}

function buildAuthEntry(
  collectionSlug: string,
  operation: string,
  result?: Record<string, unknown> | null,
): { entry: Record<string, unknown>; message: string } | undefined {
  if (operation === "login" || operation === "resetPassword") {
    const userId = (result as { user?: { id?: string | number } } | null | undefined)?.user?.id;
    const isLogin = operation === "login";

    return {
      entry: {
        event: isLogin ? "payload.auth.logged_in" : "payload.auth.password_reset",
        collection: collectionSlug,
        operation,
        ...userBinding(userId),
      },
      message: isLogin ? "Payload user logged in" : "Payload password reset",
    };
  }

  if (operation === "forgotPassword") {
    return {
      entry: {
        event: "payload.auth.password_reset_requested",
        collection: collectionSlug,
        operation,
      },
      message: "Payload password reset requested",
    };
  }

  return undefined;
}

function buildOperationEntry(
  collectionSlug: string,
  operation: string,
  result: Record<string, unknown> | null | undefined,
  operations: AuditOperation[],
  hasAuth: boolean,
): { entry: Record<string, unknown>; message: string } | undefined {
  if (operations.includes("read")) {
    if (operation === "find") return buildFindEntry(collectionSlug, operation, result);
    if (operation === "findByID") return buildFindByIdEntry(collectionSlug, operation, result);
  }

  if (operations.includes("auth") && hasAuth) {
    return buildAuthEntry(collectionSlug, operation, result);
  }

  return undefined;
}

function extractUserId(req?: { user?: { id?: unknown } | null }): unknown {
  return req?.user?.id;
}

function createAfterChangeHook(
  operations: AuditOperation[],
  log: AuditLogger,
): CollectionAfterChangeHook {
  return (args) => {
    try {
      if (operations.includes(args.operation)) {
        const doc = args.doc as { id?: string | number } | undefined;
        const { entry, message } = buildChangeEntry(
          args.collection.slug,
          args.operation,
          doc,
          extractUserId(args.req),
        );

        log.info(entry, message);
      }
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.doc;
  };
}

function createAfterDeleteHook(
  log: AuditLogger,
): CollectionAfterDeleteHook {
  return (args) => {
    try {
      const doc = args.doc as { id?: string | number } | undefined;
      const { entry, message } = buildDeleteEntry(
        args.collection.slug,
        args.id,
        doc,
        extractUserId(args.req),
      );

      log.info(entry, message);
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.doc;
  };
}

function createAfterOperationHook(
  operations: AuditOperation[],
  log: AuditLogger,
): CollectionAfterOperationHook {
  return (args) => {
    try {
      const result = args.result as Record<string, unknown> | null | undefined;
      const hasAuth = Boolean((args.collection as { auth?: unknown }).auth);
      const built = buildOperationEntry(
        args.collection.slug,
        args.operation,
        result,
        operations,
        hasAuth,
      );

      if (built) {
        log.info(built.entry, built.message);
      }
    } catch {
      // Logging must never break a Payload operation.
    }

    return args.result;
  };
}

function attachCollectionHooks(
  collection: ConfigCollection,
  operations: AuditOperation[],
  hooks: {
    afterChange: CollectionAfterChangeHook;
    afterDelete: CollectionAfterDeleteHook;
    afterOperation: CollectionAfterOperationHook;
  },
): ConfigCollection {
  const collectionHooks = { ...collection.hooks };

  if (operations.includes("create") || operations.includes("update")) {
    collectionHooks.afterChange = [...(collectionHooks.afterChange ?? []), hooks.afterChange];
  }
  if (operations.includes("delete")) {
    collectionHooks.afterDelete = [...(collectionHooks.afterDelete ?? []), hooks.afterDelete];
  }
  if (operations.includes("read") || (operations.includes("auth") && collection.auth)) {
    collectionHooks.afterOperation = [...(collectionHooks.afterOperation ?? []), hooks.afterOperation];
  }

  return { ...collection, hooks: collectionHooks };
}

export function auditPlugin(options: AuditPluginOptions = {}): Plugin {
  const operations = normalizeOperations(options.operations);
  const log = options.logger ?? logger;

  const hookHandlers = {
    afterChange: createAfterChangeHook(operations, log),
    afterDelete: createAfterDeleteHook(log),
    afterOperation: createAfterOperationHook(operations, log),
  };

  const plugin: Plugin = (config) => {
    const slugs = new Set(config.collections?.map((collection) => collection.slug) ?? []);
    validateCollectionSlugs(slugs, options);

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (!isCollectionTargeted(collection.slug, options)) {
          return collection;
        }

        return attachCollectionHooks(collection, operations, hookHandlers);
      }),
    };
  };

  plugin.order = AUDIT_PLUGIN_ORDER;
  plugin.slug = "nexload-audit";

  return plugin;
}
