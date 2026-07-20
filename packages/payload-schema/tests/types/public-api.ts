import type { TextField } from "payload";
import { z } from "zod";

import {
  defaultIdSchema,
  defineEntity,
  field,
  type FieldDefinition,
  type InferEntityFields,
} from "../../src/index.js";

const entity = defineEntity({
  name: "Types",
  idSchema: z.string().uuid(),
  relationshipIdSchema: z.string().uuid(),
  fields: {
    title: field.text({ required: true }),
    status: field.select({ values: ["draft", "published"] as const }),
    tags: field.select({ values: ["a", "b"] as const, hasMany: true }),
    owner: field.relationship({ relationTo: "users" }),
    legacyOwner: field.relationship({ relationTo: "users", idSchema: z.number().int().safe() }),
    settings: field.group({ fields: { enabled: field.boolean(), label: field.text({ nullable: true }) } }),
    rows: field.array({ fields: { amount: field.money({ currency: "IRR" }) } }),
    raw: field.native({ payload: { type: "json" } }),
    known: field.native({ payload: { type: "text" }, schema: z.string().min(1) }),
  },
});

const titleDefinition: FieldDefinition<"text", z.ZodType<string>, TextField> = entity.fields.title;
void titleDefinition;

const status: z.infer<typeof entity.fields.status.schema> = "draft";
const tags: z.infer<typeof entity.fields.tags.schema> = ["a"];
const settings: z.infer<typeof entity.fields.settings.schema> = { enabled: true, label: null };
const rows: z.infer<typeof entity.fields.rows.schema> = [{ amount: 100 }];
const owner: z.infer<typeof entity.fields.owner.schema> = "550e8400-e29b-41d4-a716-446655440000";
const legacyOwner: z.infer<typeof entity.fields.legacyOwner.schema> = 1;
void [status, tags, settings, rows, owner, legacyOwner];

type Values = InferEntityFields<typeof entity>;
const known: Values["known"] = "value";
const raw: Values["raw"] = undefined as never;
void [known, raw];

entity.payload.field("title");
entity.payload.pick(["rows", "title"]);
entity.schema(({ fields, pick, z: contextZ }) => contextZ.union([
  fields.title,
  pick(["status", "title"], { optional: "all", required: ["title"] }).transform(({ title }) => title),
]));

defaultIdSchema.parse("id");

// @ts-expect-error unknown payload key
entity.payload.field("missing");
// @ts-expect-error schema-less native field is omitted
entity.schema(({ fields }) => fields.raw);
// @ts-expect-error schema-less native field cannot be picked
entity.schema(({ pick }) => pick(["raw"]));
// @ts-expect-error select values remain literal
const invalidStatus: z.infer<typeof entity.fields.status.schema> = "archived";
// @ts-expect-error hasMany select requires an array
const invalidTags: z.infer<typeof entity.fields.tags.schema> = "a";
// @ts-expect-error entity relationshipIdSchema replaces the default ID schema
const invalidOwner: z.infer<typeof entity.fields.owner.schema> = 1;
// @ts-expect-error Payload name is entity-owned
field.native({ payload: { name: "x", type: "text" } });
// @ts-expect-error layout fields are not data fields
field.native({ payload: { type: "row", fields: [] } });
void [invalidStatus, invalidTags, invalidOwner];
