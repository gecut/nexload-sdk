import type { CheckboxField, DateField, NumberField, TextField } from "payload";

import { z } from "zod";

import { field, type FieldDefinition } from "@nexload-sdk/payload-schema";
import { cardNumberSchema, iranLandlineSchema, iranMobileSchema, legalIdSchema, nationalCodeSchema, postalCodeSchema, shebaSchema } from "@nexload-sdk/persian/zod";

import { bankCardField, shebaField } from "../bank";
import { ltrTextField, sortOrderField } from "../common";
import { iranLandlineField, iranMobileField } from "../contact";
import { jalaliDateField } from "../date";
import { legalIdField, nationalCodeField, postalCodeField } from "../identity";
import { moneyField } from "../money";
import { slugField } from "../slug";
import { formatSlug } from "../slug/format-slug";

type WithoutRequired<T> = T extends unknown ? Omit<T, "required"> : never;
type Options<T, N extends boolean = boolean> = Omit<NonNullable<T>, "name" | "required" | "overrides"> & {
  nullable?: N;
} & (NonNullable<T> extends { overrides?: infer O }
  ? { overrides?: WithoutRequired<NonNullable<O>> }
  : unknown);
type Output<T, N extends boolean> = N extends true ? T | null : T;

function textField (config: TextField, schema: z.ZodType<string>, nullable = false) {
  const { name: _name, defaultValue, ...payload } = config;

  return field.native({ payload: { ...payload, required: !nullable, }, schema: nullable ? schema.nullable() : schema,
    ...(typeof defaultValue === "string" ? { defaultValue, } : {}), });
}

function numberField (config: NumberField, schema: z.ZodType<number>, nullable = false) {
  const { name: _name, defaultValue, ...payload } = config;

  return field.native({ payload: { ...payload, required: !nullable, }, schema: nullable ? schema.nullable() : schema,
    ...(typeof defaultValue === "number" ? { defaultValue, } : {}), });
}

type TextDefinition<N extends boolean = false> = FieldDefinition<"native", z.ZodType<Output<string, N>>, TextField>;
type NumberDefinition<N extends boolean = false> = FieldDefinition<"native", z.ZodType<Output<number, N>>, NumberField>;
type DateDefinition<N extends boolean = false> = FieldDefinition<"native", z.ZodType<Output<string, N>>, DateField>;
type CheckboxDefinition = FieldDefinition<"native", z.ZodType<boolean>, CheckboxField>;

type SchemaFields = {
  iranMobile: <N extends boolean = false>(options?: Options<Parameters<typeof iranMobileField>[0], N>) => TextDefinition<N>;
  iranLandline: <N extends boolean = false>(options?: Options<Parameters<typeof iranLandlineField>[0], N>) => TextDefinition<N>;
  nationalCode: <N extends boolean = false>(options?: Options<Parameters<typeof nationalCodeField>[0], N>) => TextDefinition<N>;
  legalId: <N extends boolean = false>(options?: Options<Parameters<typeof legalIdField>[0], N>) => TextDefinition<N>;
  postalCode: <N extends boolean = false>(options?: Options<Parameters<typeof postalCodeField>[0], N>) => TextDefinition<N>;
  bankCard: <N extends boolean = false>(options?: Options<Parameters<typeof bankCardField>[0], N>) => TextDefinition<N>;
  sheba: <N extends boolean = false>(options?: Options<Parameters<typeof shebaField>[0], N>) => TextDefinition<N>;
  ltrText: <N extends boolean = false>(options?: Options<Parameters<typeof ltrTextField>[0], N>) => TextDefinition<N>;
  sortOrder: <N extends boolean = false>(options?: Options<Parameters<typeof sortOrderField>[0], N>) => NumberDefinition<N>;
  jalaliDate: <N extends boolean = false>(options?: Options<Parameters<typeof jalaliDateField>[0], N>) => DateDefinition<N>;
  money: <N extends boolean = false>(options: Options<Parameters<typeof moneyField>[0], N>) => NumberDefinition<N>;
  slug: (options?: Omit<NonNullable<Parameters<typeof slugField>[0]>, "name" | "overrides"> & { overrides?: { slug?: WithoutRequired<Partial<TextField>>; lock?: WithoutRequired<Partial<CheckboxField>> } }) => { slug: TextDefinition; slugLock: CheckboxDefinition };
};

const schemaFieldsImplementation = {
  iranMobile: (options: Options<Parameters<typeof iranMobileField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(iranMobileField({ ...rest, required: !nullable, }), iranMobileSchema({ format: rest.storage, }), nullable);
  },
  iranLandline: (options: Options<Parameters<typeof iranLandlineField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(iranLandlineField({ ...rest, required: !nullable, }), iranLandlineSchema(), nullable);
  },
  nationalCode: (options: Options<Parameters<typeof nationalCodeField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(nationalCodeField({ ...rest, required: !nullable, }), nationalCodeSchema(), nullable);
  },
  legalId: (options: Options<Parameters<typeof legalIdField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(legalIdField({ ...rest, required: !nullable, }), legalIdSchema(), nullable);
  },
  postalCode: (options: Options<Parameters<typeof postalCodeField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(postalCodeField({ ...rest, required: !nullable, }), postalCodeSchema(), nullable);
  },
  bankCard: (options: Options<Parameters<typeof bankCardField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(bankCardField({ ...rest, required: !nullable, }), cardNumberSchema(), nullable);
  },
  sheba: (options: Options<Parameters<typeof shebaField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return textField(shebaField({ ...rest, required: !nullable, }), shebaSchema(), nullable);
  },
  ltrText: (options: Options<Parameters<typeof ltrTextField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;
    let schema = z.string();

    if (rest.minLength !== undefined) schema = schema.min(rest.minLength);
    if (rest.maxLength !== undefined) schema = schema.max(rest.maxLength);

    return textField(ltrTextField({ ...rest, name: "field", required: !nullable, }), schema, nullable);
  },
  sortOrder: (options: Options<Parameters<typeof sortOrderField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;

    return numberField(sortOrderField({ ...rest, overrides: { ...rest.overrides, required: !nullable, }, }), z.number().int().nonnegative(), nullable);
  },
  money: (options: Options<Parameters<typeof moneyField>[0]>) => {
    const { nullable = false, ...rest } = options;
    let schema = z.number().int().safe();

    if (!rest.allowNegative) schema = schema.nonnegative();
    if (rest.minMinorUnits !== undefined) schema = schema.min(rest.minMinorUnits);
    if (rest.maxMinorUnits !== undefined) schema = schema.max(rest.maxMinorUnits);

    return numberField(moneyField({ ...rest, name: "field", required: !nullable, }), schema, nullable);
  },
  jalaliDate: (options: Options<Parameters<typeof jalaliDateField>[0]> = {}) => {
    const { nullable = false, ...rest } = options;
    const config: DateField = jalaliDateField({ ...rest, name: "field", required: !nullable, });
    const { name: _name, defaultValue, ...payload } = config;
    const schema = z.iso.datetime({ offset: true, });

    return field.native({ payload: { ...payload, required: !nullable, }, schema: nullable ? schema.nullable() : schema,
      ...(typeof defaultValue === "string" ? { defaultValue, } : {}), });
  },
  slug: (options: Omit<Parameters<typeof slugField>[0], "name"> = {}) => {
    const [slug, lock]: readonly [TextField, CheckboxField] = slugField(options);
    const { name: _name, defaultValue, ...payload } = lock;

    return { slug: textField(slug, z.string().transform(formatSlug).pipe(z.string().min(1))), slugLock: field.native({ payload: { ...payload, required: true, }, schema: z.boolean(),
      ...(typeof defaultValue === "boolean" ? { defaultValue, } : {}), }), };
  },
};

export const schemaFields = schemaFieldsImplementation as unknown as SchemaFields;
