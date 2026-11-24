import type { Field, PayloadRequest, Plugin } from "payload";

import { parseNumber } from "@nexload-sdk/persian/digits";

import { t } from "./i18n/messages";
import { formatSlug } from "./slug/format-slug";

export type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
export type SlugGeneratorContext = { req: PayloadRequest };
export type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
export type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
export type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };

function normalizeDataMoneyFields (fields: Field[], data: unknown): void {
  if (!data || typeof data !== "object") return;
  if (Array.isArray(data)) {
    for (const item of data) {
      normalizeDataMoneyFields(fields, item);
    }

    return;
  }

  const record = data as Record<string, unknown>;

  for (const field of fields) {
    if (field.type === "number" && (field.custom as { nexload?: { money?: unknown } } | undefined)?.nexload?.money && "name" in field) {
      const val = record[field.name];

      if (typeof val === "string") {
        const trimmed = val.trim();

        if (trimmed === "") {
          record[field.name] = null;
        } else {
          const parsed = parseNumber(trimmed);

          if (parsed !== null && Number.isSafeInteger(parsed)) {
            record[field.name] = parsed;
          }
        }
      }
    } else if (field.type === "group" && "fields" in field && "name" in field) {
      normalizeDataMoneyFields(field.fields, record[field.name]);
    } else if ((field.type === "row" || field.type === "collapsible") && "fields" in field) {
      normalizeDataMoneyFields(field.fields, record);
    } else if (field.type === "tabs" && "tabs" in field) {
      for (const tab of field.tabs) {
        if ("name" in tab && tab.name) {
          normalizeDataMoneyFields(tab.fields, record[tab.name]);
        } else {
          normalizeDataMoneyFields(tab.fields, record);
        }
      }
    } else if (field.type === "array" && "fields" in field && "name" in field) {
      const rows = record[field.name];

      if (Array.isArray(rows)) {
        for (const row of rows) {
          normalizeDataMoneyFields(field.fields, row);
        }
      }
    } else if (field.type === "blocks" && "blocks" in field && "name" in field) {
      const blocks = record[field.name];

      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          if (block && typeof block === "object") {
            const blockDef = field.blocks.find((b) => b.slug === (block as { blockType?: string }).blockType);

            if (blockDef) {
              normalizeDataMoneyFields(blockDef.fields, block);
            }
          }
        }
      }
    }
  }
}

function failure (
  code: string, message: string, status: number
): Response {
  return Response.json(
    { error: { code, message, }, }, { status, }
  );
}

export function payloadFieldsPlugin (options: PayloadFieldsPluginOptions = {}): Plugin {
  return (config) => ({
    ...config,
    collections: (config.collections ?? []).map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeOperation: [
          ...(collection.hooks?.beforeOperation ?? []),
          ({ args, collection: colConfig }) => {
            if (args && "data" in args && args.data && colConfig?.fields) {
              normalizeDataMoneyFields(colConfig.fields, args.data);
            }

            return args;
          },
        ],
      },
    })),
    globals: (config.globals ?? []).map((global) => ({
      ...global,
      hooks: {
        ...global.hooks,
        beforeOperation: [
          ...(global.hooks?.beforeOperation ?? []),
          ({ args, global: globConfig }) => {
            if (args && "data" in args && args.data && globConfig?.fields) {
              normalizeDataMoneyFields(globConfig.fields, args.data);
            }

            return args;
          },
        ],
      },
    })),
    endpoints: [
      ...(config.endpoints ?? []),
      {
        path: "/payload-fields/generate-slug",
        method: "post" as const,
        handler: async (req: PayloadRequest) => {
          if (!req.user) return failure(
            "PAYLOAD_FIELDS_UNAUTHENTICATED", t(req.i18n?.language, "slug.unauthenticated"), 401
          );
          if (options.generateSlugAccess && !await options.generateSlugAccess({ req, })) return failure(
            "PAYLOAD_FIELDS_FORBIDDEN", t(req.i18n?.language, "slug.forbidden"), 403
          );
          let body: unknown;

          try {
            body = await req.json?.();
          } catch {
            return failure(
              "PAYLOAD_FIELDS_INVALID_INPUT", t(req.i18n?.language, "slug.invalidInput"), 400
            );
          }
          if (!body || typeof body !== "object" || Array.isArray(body)) return failure(
            "PAYLOAD_FIELDS_INVALID_INPUT", t(req.i18n?.language, "slug.invalidInput"), 400
          );
          const input = body as {
            generator?: unknown
            sourceValue?: unknown
            currentSlug?: unknown
          };

          if (
            typeof input.generator !== "string"
            || typeof input.sourceValue !== "string"
            || (input.currentSlug !== undefined && typeof input.currentSlug !== "string")
          ) return failure(
            "PAYLOAD_FIELDS_INVALID_INPUT", t(req.i18n?.language, "slug.invalidInput"), 400
          );
          const generator = options.slugGenerators && Object.prototype.hasOwnProperty.call(
            options.slugGenerators, input.generator
          )
            ? options.slugGenerators[input.generator]
            : undefined;

          if (!generator) return failure(
            "PAYLOAD_FIELDS_GENERATOR_NOT_FOUND", t(req.i18n?.language, "slug.notFound"), 404
          );
          try {
            const result = await generator(
              { sourceValue: input.sourceValue, currentSlug: input.currentSlug, }, { req, }
            );

            return Response.json({ slug: formatSlug(result), });
          } catch {
            return failure(
              "PAYLOAD_FIELDS_GENERATION_FAILED", t(req.i18n?.language, "slug.failed"), 500
            );
          }
        },
      }
    ],
  });
}
