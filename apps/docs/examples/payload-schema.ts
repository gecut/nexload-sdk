import { defineEntity, field } from "@nexload-sdk/payload-schema";

export const productEntity = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true }),
    slug: field.slug({ required: true }),
    inventory: field.number({
      integer: true,
      safe: true,
      defaultValue: 0,
    }),
  },
});

export const productFields = productEntity.payload.all();
export const createProductSchema = productEntity.schema(({ pick }) =>
  pick(["title", "slug", "inventory"], { optional: ["inventory"] }),
);
