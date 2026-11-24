import type { PayloadRequest, Plugin } from "payload";

import { t } from "./i18n/messages";
import { formatSlug } from "./slug/format-slug";

export type SlugGeneratorInput = { sourceValue: string, currentSlug?: string };
export type SlugGeneratorContext = { req: PayloadRequest };
export type SlugGenerator = (input: SlugGeneratorInput, context: SlugGeneratorContext) => Promise<string>;
export type SlugGenerationAccess = (context: SlugGeneratorContext) => boolean | Promise<boolean>;
export type PayloadFieldsPluginOptions = { slugGenerators?: Record<string, SlugGenerator>, generateSlugAccess?: SlugGenerationAccess };

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
