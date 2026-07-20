import { z } from "zod";

import { defineEntity, field } from "../../dist/index.js";

const editor = Object.freeze({ lexical: true });
const synchronizeSlug = ({ value }) => value;

export const categoryEntity = defineEntity({
  name: "Category",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true, payload: { hooks: { beforeValidate: [synchronizeSlug] } } }),
    parent: field.relationship({ relationTo: "categories", nullable: true }),
  },
});

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    basePrice: field.money({ currency: "IRR", minimum: 0 }),
    inventory: field.number({ integer: true, safe: true, defaultValue: 0 }),
    category: field.relationship({ relationTo: "categories" }),
    coverImage: field.upload({ relationTo: "media" }),
    description: field.richText({
      schema: z.strictObject({ root: z.unknown() }),
      payload: { editor },
    }),
    gallery: field.array({
      fields: {
        image: field.upload({ relationTo: "media" }),
        alt: field.text({ trim: true }),
      },
    }),
  },
});

export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "basePrice", "inventory", "category", "coverImage", "description", "gallery"], {
    optional: ["inventory", "category", "coverImage", "description", "gallery"],
  }));

export const productCardSchema = productEntity.schema(({ fields, z: contextZ }) => contextZ.object({
  id: productEntity.idSchema,
  title: fields.title,
  basePrice: fields.basePrice,
}));

export const collectionStubs = [
  { slug: "categories", fields: categoryEntity.payload.all() },
  { slug: "media", upload: true, fields: [] },
  { slug: "products", fields: productEntity.payload.all() },
];
