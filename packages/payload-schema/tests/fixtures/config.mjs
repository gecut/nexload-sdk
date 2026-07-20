import { buildConfig } from "payload";

import { defineEntity, field } from "../../dist/index.js";

const categoryEntity = defineEntity({
  name: "Category",
  fields: {
    title: field.text({ required: true, trim: true }),
  },
});

const mediaEntity = defineEntity({
  name: "Media",
  fields: { alt: field.text({ trim: true }) },
});

const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    inventory: field.number({ integer: true, safe: true, defaultValue: 0 }),
    category: field.relationship({ relationTo: "categories" }),
    cover: field.upload({ relationTo: "media" }),
    gallery: field.array({
      minRows: 1,
      fields: {
        alt: field.text({ required: true, trim: true, minLength: 2 }),
      },
    }),
  },
});

export async function createFixtureConfig({ databaseAdapter, generatedTypesPath, uploadDirectory }) {
  return buildConfig({
    secret: "payload-schema-integration-secret-000000000000",
    db: databaseAdapter,
    collections: [
      { slug: "categories", fields: categoryEntity.payload.all() },
      { slug: "media", upload: { staticDir: uploadDirectory }, fields: mediaEntity.payload.all() },
      { slug: "products", fields: productEntity.payload.all() },
    ],
    typescript: { outputFile: generatedTypesPath },
  });
}
