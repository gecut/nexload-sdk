import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

type DocsCollection = ReturnType<typeof defineCollection>;

export const collections: { docs: DocsCollection } = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        package: z
          .enum([
            "healthcheck",
            "healthcheck-node",
            "healthcheck-bun",
            "healthcheck-next",
            "healthcheck-prometheus",
            "healthcheck-otel",
            "healthcheck-payload",
            "payload-fields",
            "payload-editor",
            "payload-operations",
            "payload-schema",
          ])
          .optional(),
        topic: z
          .enum([
            "overview",
            "installation",
            "quick-start",
            "concepts",
            "guides",
            "api",
            "examples",
            "troubleshooting",
            "migration",
            "compatibility",
            "ecosystem",
            "agents",
            "community",
          ])
          .optional(),
      }),
    }),
  }),
};
