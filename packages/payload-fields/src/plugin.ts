import { formatSlug } from "./slug/format-slug";

import type { PayloadRequest, Plugin } from "payload";

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
            "PAYLOAD_FIELDS_UNAUTHENTICATED", "برای تولید اسلاگ باید وارد شوید.", 401
          );
          if (options.generateSlugAccess && !await options.generateSlugAccess({ req, })) return failure(
            "PAYLOAD_FIELDS_FORBIDDEN", "اجازه تولید اسلاگ را ندارید.", 403
          );
          let body: unknown;
          try {
            body = await req.json?.();
          } catch {
            return failure(
              "PAYLOAD_FIELDS_INVALID_INPUT", "ورودی تولید اسلاگ معتبر نیست.", 400
            );
          }
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
            "PAYLOAD_FIELDS_INVALID_INPUT", "ورودی تولید اسلاگ معتبر نیست.", 400
          );
          const generator = options.slugGenerators?.[input.generator];
          if (!generator) return failure(
            "PAYLOAD_FIELDS_GENERATOR_NOT_FOUND", "تولیدکننده اسلاگ پیدا نشد.", 404
          );
          try {
            const result = await generator(
              { sourceValue: input.sourceValue, currentSlug: input.currentSlug, }, { req, }
            );
            return Response.json({ slug: formatSlug(result), });
          } catch {
            return failure(
              "PAYLOAD_FIELDS_GENERATION_FAILED", "تولید اسلاگ با خطا مواجه شد.", 500
            );
          }
        },
      }
    ],
  });
}
