import type { Field, PayloadRequest, Plugin } from "payload";

import { parseNumber } from "@nexload-sdk/persian/digits";

import { t } from "./i18n/messages";
import { formatSlug } from "./slug/format-slug";

export type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
export type SlugGeneratorContext = { req: PayloadRequest };
export type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
export type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
export type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };

type BlockMap = Map<string, { fields: Field[] }>;

function isPlainObject (value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}

function normalizeMoneyValue (val: string): unknown {
  const trimmed = val.trim();

  if (trimmed === "") return null;
  const parsed = parseNumber(trimmed);

  return parsed !== null && Number.isSafeInteger(parsed) ? parsed : val;
}

/**
 * Copy-on-write normalization: never mutates `data`; returns the same reference
 * when nothing changed, otherwise shallow copies only the containers along changed paths.
 */
function normalizeDataMoneyFields (fields: Field[], data: unknown, blocks: BlockMap): unknown {
  if (Array.isArray(data)) {
    let out: unknown[] = data;

    data.forEach((item, index) => {
      const next = normalizeDataMoneyFields(fields, item, blocks);

      if (next !== item) {
        if (out === data) out = [...data];
        out[index] = next;
      }
    });

    return out;
  }
  if (!isPlainObject(data)) return data;

  let out: Record<string, unknown> = data;
  const assign = (key: string, value: unknown) => {
    if (out === data) out = { ...data, };
    out[key] = value;
  };
  const nested = (key: string, nestedFields: Field[]) => {
    const current = out[key];
    const next = normalizeDataMoneyFields(nestedFields, current, blocks);

    if (next !== current) assign(key, next);
  };

  for (const field of fields) {
    if (field.type === "number" && (field.custom as { nexload?: { money?: unknown } } | undefined)?.nexload?.money && "name" in field) {
      const val = out[field.name];

      if (typeof val === "string") {
        const next = normalizeMoneyValue(val);

        if (next !== val) assign(field.name, next);
      }
    } else if (field.type === "group" && "fields" in field && "name" in field) {
      nested(field.name, field.fields);
    } else if ((field.type === "row" || field.type === "collapsible") && "fields" in field) {
      out = normalizeDataMoneyFields(field.fields, out, blocks) as Record<string, unknown>;
    } else if (field.type === "tabs" && "tabs" in field) {
      for (const tab of field.tabs) {
        if ("name" in tab && tab.name) {
          nested(tab.name, tab.fields);
        } else {
          out = normalizeDataMoneyFields(tab.fields, out, blocks) as Record<string, unknown>;
        }
      }
    } else if (field.type === "array" && "fields" in field && "name" in field) {
      nested(field.name, field.fields);
    } else if (field.type === "blocks" && "name" in field) {
      const rows = out[field.name];

      if (Array.isArray(rows)) {
        const candidates: Array<{ slug: string, fields: Field[] }> = [];

        for (const block of field.blocks ?? []) candidates.push(block);
        for (const ref of field.blockReferences ?? []) {
          const resolved = typeof ref === "string" ? blocks.get(ref) : ref;

          if (resolved) candidates.push({ slug: typeof ref === "string" ? ref : ref.slug, fields: resolved.fields, });
        }
        let nextRows: unknown[] = rows;

        rows.forEach((block, index) => {
          if (!isPlainObject(block)) return;
          const def = candidates.find((b) => b.slug === block.blockType);

          if (!def) return;
          const next = normalizeDataMoneyFields(def.fields, block, blocks);

          if (next !== block) {
            if (nextRows === rows) nextRows = [...rows];
            nextRows[index] = next;
          }
        });
        if (nextRows !== rows) assign(field.name, nextRows);
      }
    }
  }

  return out;
}

function failure (
  code: string, message: string, status: number
): Response {
  return Response.json(
    { error: { code, message, }, }, { status, }
  );
}

export const PAYLOAD_FIELDS_PLUGIN_ORDER = 900;

export function payloadFieldsPlugin (options: PayloadFieldsPluginOptions = {}): Plugin {
  const plugin: Plugin = (config) => {
    const blockMap: BlockMap = new Map((config.blocks ?? []).map((block) => [block.slug, block]));

    return {
    ...config,
    collections: (config.collections ?? []).map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeOperation: [
          ...(collection.hooks?.beforeOperation ?? []),
          ({ args, collection: colConfig }) => {
            if (args && "data" in args && args.data && colConfig?.fields) {
              const data = normalizeDataMoneyFields(colConfig.fields, args.data, blockMap);

              return data === args.data ? args : { ...args, data, };
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
              const data = normalizeDataMoneyFields(globConfig.fields, args.data, blockMap);

              return data === args.data ? args : { ...args, data, };
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
          } catch (err) {
            // This endpoint handles the failure by responding 500, so it logs it once here.
            req.payload.logger.error(
              {
                err,
                event: "payload_fields.slug.generation_failed",
                generator: input.generator,
                outcome: "failure",
              },
              "Slug generation failed"
            );

            return failure(
              "PAYLOAD_FIELDS_GENERATION_FAILED", t(req.i18n?.language, "slug.failed"), 500
            );
          }
        },
      }
    ],
  };
  };
  plugin.order = PAYLOAD_FIELDS_PLUGIN_ORDER;
  plugin.slug = "nexload-fields";

  return plugin;
}
