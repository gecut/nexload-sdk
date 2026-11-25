import { defineEntity, field } from "@nexload-sdk/payload-schema";

const product = defineEntity({
  name: "Product",
  fields: {
    title: field.text({ required: true, trim: true, minLength: 3 }),
    sku: field.text({ required: true, trim: true, uppercase: true, minLength: 2 }),
  },
});
const title = product.schema(({ fields }) => fields.title);
const sku = product.schema(({ fields }) => fields.sku);

export function evaluate(input: string, mode: string): string {
  const result = (mode === "SKU" ? sku : title).safeParse(input);
  return result.success ? JSON.stringify(result.data) : result.error.issues.map(issue => issue.message).join("\n");
}
