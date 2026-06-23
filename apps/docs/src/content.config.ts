import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

type DocsCollection = ReturnType<typeof defineCollection>;

export const collections: { docs: DocsCollection } = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema()
  })
};
