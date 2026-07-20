import { z } from "zod";

import { defaultIdSchema } from "../default-id.js";
import { PayloadSchemaError } from "../errors.js";
import { createFieldDefinition, fieldEntries, type FieldSeed } from "../internal/field-definition.js";

import type {
  AnyCanonicalSchema,
  ArrayFieldOptions,
  BooleanFieldOptions,
  DateFieldOptions,
  EntityFieldMap,
  FieldDefinition,
  GroupFieldOptions,
  MaybeNullable,
  MoneyFieldOptions,
  NativeFieldOptions,
  NumberFieldOptions,
  PayloadDataField,
  RelationshipFieldDefinition,
  RelationshipFieldOptions,
  RichTextFieldOptions,
  SelectFieldOptions,
  TextareaFieldOptions,
  TextFieldOptions,
  UploadFieldOptions
} from "../types.js";
import type {
  ArrayField,
  CheckboxField,
  DateField,
  NamedGroupField,
  NumberField,
  RelationshipField,
  RichTextField,
  SelectField,
  TextareaField,
  TextField,
  UploadField
} from "payload";

type NullableSchema<TValue, TNullable extends boolean> = z.ZodType<MaybeNullable<TValue, TNullable>>;
type SchemaLessKey<TFields extends EntityFieldMap> = {
  [TKey in keyof TFields]: TFields[TKey]["schema"] extends AnyCanonicalSchema ? never : TKey
}[keyof TFields];
type ObjectSchemaForFields<TFields extends EntityFieldMap> = z.ZodObject<{
  [TKey in keyof TFields]: Extract<TFields[TKey]["schema"], AnyCanonicalSchema>
}>;
type GroupCanonicalSchema<TFields extends EntityFieldMap, TNullable extends boolean>
  = SchemaLessKey<TFields> extends never
    ? TNullable extends true
      ? z.ZodNullable<ObjectSchemaForFields<TFields>>
      : ObjectSchemaForFields<TFields>
    : undefined;
type ArrayCanonicalSchema<TFields extends EntityFieldMap, TNullable extends boolean>
  = SchemaLessKey<TFields> extends never
    ? TNullable extends true
      ? z.ZodNullable<z.ZodArray<ObjectSchemaForFields<TFields>>>
      : z.ZodArray<ObjectSchemaForFields<TFields>>
    : undefined;
type RelationshipValue<TRelationTo, THasMany extends boolean, TIdSchema extends AnyCanonicalSchema>
  = TRelationTo extends readonly string[]
    ? THasMany extends true
      ? Array<{ relationTo: TRelationTo[number], value: z.output<TIdSchema> }>
      : { relationTo: TRelationTo[number], value: z.output<TIdSchema> }
    : THasMany extends true
      ? Array<z.output<TIdSchema>>
      : z.output<TIdSchema>;

const unboundPath = "<unbound>";

function asPayloadExtras (value: object | undefined): Record<string, unknown> {
  return (value ?? {}) as unknown as Record<string, unknown>;
}

function withDefaults (
  seed: FieldSeed, options: {
    defaultValue?: unknown
    dynamicDefaultValue?: unknown
  }
): FieldSeed {
  return {
    ...seed,
    staticDefaultConfigured: Object.hasOwn(
      options, "defaultValue"
    ),
    staticDefault: options.defaultValue,
    dynamicDefaultConfigured: Object.hasOwn(
      options, "dynamicDefaultValue"
    ),
    dynamicDefault: options.dynamicDefaultValue,
  };
}

function validateRange (
  fieldKind: string,
  constraint: string,
  minimum: number | string | undefined,
  maximum: number | string | undefined
): void {
  if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
    throw new PayloadSchemaError(
      "INVALID_CONSTRAINT_RANGE", {
        phase: "definition",
        message: `${fieldKind} minimum cannot be greater than maximum.`,
        data: { fieldPath: unboundPath, constraint, minimum, maximum, },
      }
    );
  }
}

function applyNullable<TValue, TNullable extends boolean> (
  schema: z.ZodType<TValue>,
  nullable: TNullable | undefined
): NullableSchema<TValue, TNullable> {
  return (nullable ? schema.nullable() : schema) as NullableSchema<TValue, TNullable>;
}

function buildTextSchema<TNullable extends boolean> (
  options: TextFieldOptions<TNullable>,
  slug: boolean
): NullableSchema<string, TNullable> {
  if (options.lowercase && options.uppercase) {
    throw new PayloadSchemaError(
      "INVALID_FIELD_CONFIGURATION", {
        phase: "definition",
        message: "lowercase and uppercase are mutually exclusive.",
        data: { fieldPath: unboundPath, fieldKind: slug ? "slug" : "text", reason: "conflicting case normalization", },
      }
    );
  }
  validateRange(
    slug ? "slug" : "text", "length", options.minLength, options.maxLength
  );

  let schema: z.ZodType<string, string> = z.string();
  if (slug) {
    schema = schema.transform((value) => value
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(
        /[\s_]+/gu, "-"
      )
      .replace(
        /-+/gu, "-"
      )
      .replace(
        /^-|-$/gu, ""
      ));
  } else {
    if (options.trim) schema = schema.transform((value) => value.trim());
    if (options.lowercase) schema = schema.transform((value) => value.toLowerCase());
    if (options.uppercase) schema = schema.transform((value) => value.toUpperCase());
  }

  let constraints = z.string();
  if (options.minLength !== undefined) constraints = constraints.min(options.minLength);
  if (options.maxLength !== undefined) constraints = constraints.max(options.maxLength);
  if (options.pattern) constraints = constraints.regex(options.pattern);
  schema = schema.pipe(constraints);
  if (options.schema) schema = options.schema(schema);
  return applyNullable(
    schema, options.nullable
  );
}

function text<TNullable extends boolean = false> (options: TextFieldOptions<TNullable> = {} as TextFieldOptions<TNullable>):
FieldDefinition<"text", NullableSchema<string, TNullable>, TextField> {
  const schema = buildTextSchema(
    options as unknown as TextFieldOptions<TNullable>, false
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "text",
      payloadType: "text",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minLength === undefined ? {} : { minLength: options.minLength, }),
        ...(options.maxLength === undefined ? {} : { maxLength: options.maxLength, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function textarea<TNullable extends boolean = false> (options: TextareaFieldOptions<TNullable> = {} as TextareaFieldOptions<TNullable>):
FieldDefinition<"textarea", NullableSchema<string, TNullable>, TextareaField> {
  const schema = buildTextSchema(
    options as unknown as TextFieldOptions<TNullable>, false
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "textarea",
      payloadType: "textarea",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minLength === undefined ? {} : { minLength: options.minLength, }),
        ...(options.maxLength === undefined ? {} : { maxLength: options.maxLength, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function slug<TNullable extends boolean = false> (options: TextFieldOptions<TNullable> = {} as TextFieldOptions<TNullable>):
FieldDefinition<"slug", NullableSchema<string, TNullable>, TextField> {
  const schema = buildTextSchema(
    options, true
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "slug",
      payloadType: "text",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minLength === undefined ? {} : { minLength: options.minLength, }),
        ...(options.maxLength === undefined ? {} : { maxLength: options.maxLength, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function buildNumberSchema<TNullable extends boolean> (
  options: NumberFieldOptions<TNullable>,
  forceSafeInteger = false
): NullableSchema<number, TNullable> {
  validateRange(
    forceSafeInteger ? "money" : "number", "value", options.minimum, options.maximum
  );
  let schema = z.number().refine(
    Number.isFinite, { error: "Expected a finite number", }
  );
  if (forceSafeInteger || options.integer) schema = schema.int();
  if (forceSafeInteger || options.safe) schema = schema.safe();
  if (options.minimum !== undefined) schema = schema.min(options.minimum);
  if (options.maximum !== undefined) schema = schema.max(options.maximum);
  if (options.multipleOf !== undefined) schema = schema.multipleOf(options.multipleOf);
  let output: z.ZodType<number, number> = schema;
  if (options.schema) output = options.schema(output);
  return applyNullable(
    output, options.nullable
  );
}

function number<TNullable extends boolean = false> (options: NumberFieldOptions<TNullable> = {} as NumberFieldOptions<TNullable>):
FieldDefinition<"number", NullableSchema<number, TNullable>, NumberField> {
  const schema = buildNumberSchema(options);
  return createFieldDefinition(withDefaults(
    {
      kind: "number",
      payloadType: "number",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minimum === undefined ? {} : { min: options.minimum, }),
        ...(options.maximum === undefined ? {} : { max: options.maximum, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function money<TNullable extends boolean = false> (options: MoneyFieldOptions<TNullable>): FieldDefinition<"money", NullableSchema<number, TNullable>, NumberField> {
  if (!options.currency.trim()) {
    throw new PayloadSchemaError(
      "INVALID_FIELD_CONFIGURATION", {
        phase: "definition",
        message: "Money currency must not be empty.",
        data: { fieldPath: unboundPath, fieldKind: "money", reason: "empty currency", },
      }
    );
  }
  const schema = buildNumberSchema(
    options, true
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "money",
      payloadType: "number",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minimum === undefined ? {} : { min: options.minimum, }),
        ...(options.maximum === undefined ? {} : { max: options.maximum, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      currency: options.currency,
    }, options
  ));
}

function boolean<TNullable extends boolean = false> (options: BooleanFieldOptions<TNullable> = {} as BooleanFieldOptions<TNullable>):
FieldDefinition<"boolean", NullableSchema<boolean, TNullable>, CheckboxField> {
  let base: z.ZodType<boolean, boolean> = z.boolean();
  if (options.schema) base = options.schema(base);
  const schema = applyNullable(
    base, options.nullable
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "boolean",
      payloadType: "checkbox",
      schema,
      runtimeSchema: schema,
      payloadCore: options.required === undefined ? {} : { required: options.required, },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function date<TNullable extends boolean = false> (options: DateFieldOptions<TNullable> = {} as DateFieldOptions<TNullable>):
FieldDefinition<"date", NullableSchema<string, TNullable>, DateField> {
  const iso = z.iso.datetime({ offset: true, });
  const parseBound = (
    value: string | undefined, name: string
  ): number | undefined => {
    if (value === undefined) return undefined;
    const parsed = iso.safeParse(value);
    if (!parsed.success) {
      throw new PayloadSchemaError(
        "INVALID_FIELD_CONFIGURATION", {
          phase: "definition",
          message: `Date ${name} must be an ISO datetime with an explicit timezone.`,
          data: { fieldPath: unboundPath, fieldKind: "date", reason: `invalid ${name}`, },
        }
      );
    }
    return Date.parse(parsed.data);
  };
  const minimum = parseBound(
    options.minimum, "minimum"
  );
  const maximum = parseBound(
    options.maximum, "maximum"
  );
  validateRange(
    "date", "instant", minimum, maximum
  );
  let base: z.ZodType<string, string> = iso.transform((value) => new Date(value).toISOString());
  if (minimum !== undefined) base = base.refine(
    (value) => Date.parse(value) >= minimum, { error: "Date is before minimum", }
  );
  if (maximum !== undefined) base = base.refine(
    (value) => Date.parse(value) <= maximum, { error: "Date is after maximum", }
  );
  if (options.schema) base = options.schema(base);
  const schema = applyNullable(
    base, options.nullable
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "date",
      payloadType: "date",
      schema,
      runtimeSchema: schema,
      payloadCore: options.required === undefined ? {} : { required: options.required, },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function select<
  const TValues extends readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false
> (options: SelectFieldOptions<TValues, THasMany, TNullable>): FieldDefinition<
  "select",
  NullableSchema<THasMany extends true ? TValues[number][] : TValues[number], TNullable>,
  SelectField
> {
  const values = [...options.values];
  if (!values.length) {
    throw new PayloadSchemaError(
      "EMPTY_SELECT_VALUES", {
        phase: "definition",
        message: "Select values must not be empty.",
        data: { fieldPath: unboundPath, },
      }
    );
  }
  if (new Set(values).size !== values.length || values.some((value) => !value)) {
    throw new PayloadSchemaError(
      "INVALID_FIELD_CONFIGURATION", {
        phase: "definition",
        message: "Select values must be unique non-empty strings.",
        data: { fieldPath: unboundPath, fieldKind: "select", reason: "invalid select values", },
      }
    );
  }
  const enumSchema = z.enum(values as [string, ...string[]]);
  const valueSchema = (options.hasMany ? z.array(enumSchema) : enumSchema) as unknown as z.ZodType<
    THasMany extends true ? TValues[number][] : TValues[number]
  >;
  const schema = applyNullable(
    valueSchema, options.nullable
  );
  const payloadOptions = values.map((value) => (options.labels?.[value] === undefined
    ? value
    : { label: options.labels[value] as string, value, }));
  return createFieldDefinition(withDefaults(
    {
      kind: "select",
      payloadType: "select",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        options: payloadOptions,
        ...(options.hasMany === undefined ? {} : { hasMany: options.hasMany, }),
        ...(options.required === undefined ? {} : { required: options.required, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      hasMany: options.hasMany ?? false,
    }, options
  ));
}

export function createRelationshipSchema (
  relationTo: string | readonly string[],
  hasMany: boolean,
  idSchema: AnyCanonicalSchema
): AnyCanonicalSchema {
  const base = Array.isArray(relationTo)
    ? z.discriminatedUnion(
      "relationTo", relationTo.map((slug) => z.strictObject({
        relationTo: z.literal(slug),
        value: idSchema,
      })) as unknown as Parameters<typeof z.discriminatedUnion>[1]
    )
    : idSchema;
  return hasMany ? z.array(base) : base;
}

function validateRelationTo (relationTo: string | readonly string[]): void {
  if ((Array.isArray(relationTo) && (!relationTo.length || relationTo.some((slug) => !slug)))
    || (!Array.isArray(relationTo) && !relationTo)) {
    throw new PayloadSchemaError(
      "INVALID_RELATIONSHIP_CONFIGURATION", {
        phase: "definition",
        message: "relationTo must contain at least one collection slug.",
        data: {
          fieldPath: unboundPath,
          reason: "empty relationTo",
          relationTo: Array.isArray(relationTo) ? relationTo : [],
        },
      }
    );
  }
}

function relationship<
  const TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined
> (options: RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>): RelationshipFieldDefinition<
  "relationship",
  TRelationTo,
  THasMany,
  TNullable,
  TIdSchema,
  RelationshipField
> {
  const relationTo = Array.isArray(options.relationTo) ? [...options.relationTo] : options.relationTo;
  validateRelationTo(relationTo);
  const idSchema = options.idSchema ?? defaultIdSchema;
  const base = createRelationshipSchema(
    relationTo, options.hasMany ?? false, idSchema
  );
  const schema = applyNullable(
    base, options.nullable
  ) as NullableSchema<
    RelationshipValue<TRelationTo, THasMany, TIdSchema extends AnyCanonicalSchema ? TIdSchema : typeof defaultIdSchema>,
    TNullable
  >;
  return createFieldDefinition(withDefaults(
    {
      kind: "relationship",
      payloadType: "relationship",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        relationTo,
        ...(options.hasMany === undefined ? {} : { hasMany: options.hasMany, }),
        ...(options.required === undefined ? {} : { required: options.required, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      relationTo: Array.isArray(relationTo) ? relationTo : [relationTo],
      hasMany: options.hasMany ?? false,
      relation: { relationTo, hasMany: options.hasMany ?? false, idSchema: options.idSchema, },
    }, options
  ));
}

function upload<
  const TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined
> (options: UploadFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>): RelationshipFieldDefinition<
  "upload",
  TRelationTo,
  THasMany,
  TNullable,
  TIdSchema,
  UploadField
> {
  const relationTo = Array.isArray(options.relationTo) ? [...options.relationTo] : options.relationTo;
  validateRelationTo(relationTo);
  const idSchema = options.idSchema ?? defaultIdSchema;
  const schema = applyNullable(
    createRelationshipSchema(
      relationTo, options.hasMany ?? false, idSchema
    ), options.nullable
  ) as NullableSchema<
    RelationshipValue<TRelationTo, THasMany, TIdSchema extends AnyCanonicalSchema ? TIdSchema : typeof defaultIdSchema>,
    TNullable
  >;
  return createFieldDefinition(withDefaults(
    {
      kind: "upload",
      payloadType: "upload",
      schema,
      runtimeSchema: schema,
      payloadCore: {
        relationTo,
        ...(options.hasMany === undefined ? {} : { hasMany: options.hasMany, }),
        ...(options.required === undefined ? {} : { required: options.required, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      relationTo: Array.isArray(relationTo) ? relationTo : [relationTo],
      hasMany: options.hasMany ?? false,
      relation: { relationTo, hasMany: options.hasMany ?? false, idSchema: options.idSchema, },
    }, options
  ));
}

function composeObject (fields: EntityFieldMap): { schema?: AnyCanonicalSchema, children: ReadonlyArray<readonly [string, FieldSeed]>, blocking?: string } {
  const children = fieldEntries(fields);
  const blocking = children.find(([, seed]) => !seed.schema)?.[0];
  if (blocking) return { children, blocking, };
  const shape = Object.fromEntries(children.map(([
    name,
    seed
  ]) => [
    name,
    seed.schema
  ])) as Record<string, AnyCanonicalSchema>;
  return { children, schema: z.strictObject(shape), };
}

function group<const TFields extends EntityFieldMap, TNullable extends boolean = false> (options: GroupFieldOptions<TFields, TNullable>):
FieldDefinition<"group", GroupCanonicalSchema<TFields, TNullable>, NamedGroupField> {
  const composed = composeObject(options.fields);
  const schema = composed.schema
    ? applyNullable(
      composed.schema, options.nullable
    )
    : undefined;
  const runtimeSchema = applyNullable(
    z.record(
      z.string(), z.unknown()
    ), options.nullable
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "group",
      payloadType: "group",
      schema,
      runtimeSchema,
      payloadCore: options.required === undefined ? {} : { required: options.required, },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      children: composed.children,
      blockingFieldPath: composed.blocking,
      composite: "group",
    }, options
  ));
}

function array<const TFields extends EntityFieldMap, TNullable extends boolean = false> (options: ArrayFieldOptions<TFields, TNullable>):
FieldDefinition<"array", ArrayCanonicalSchema<TFields, TNullable>, ArrayField> {
  validateRange(
    "array", "rows", options.minRows, options.maxRows
  );
  const composed = composeObject(options.fields);
  const schema = composed.schema
    ? applyNullable(
      z.array(composed.schema), options.nullable
    )
    : undefined;
  let container = z.array(z.unknown());
  if (options.minRows !== undefined) container = container.min(options.minRows);
  if (options.maxRows !== undefined) container = container.max(options.maxRows);
  const runtimeSchema = applyNullable(
    container, options.nullable
  );
  return createFieldDefinition(withDefaults(
    {
      kind: "array",
      payloadType: "array",
      schema,
      runtimeSchema,
      payloadCore: {
        ...(options.required === undefined ? {} : { required: options.required, }),
        ...(options.minRows === undefined ? {} : { minRows: options.minRows, }),
        ...(options.maxRows === undefined ? {} : { maxRows: options.maxRows, }),
      },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
      children: composed.children,
      blockingFieldPath: composed.blocking,
      composite: "array",
    }, options
  ));
}

function richText<TSchema extends AnyCanonicalSchema, TNullable extends boolean = false> (options: RichTextFieldOptions<TSchema, TNullable>):
FieldDefinition<"richText", TNullable extends true ? z.ZodNullable<TSchema> : TSchema, RichTextField> {
  const schema = options.nullable ? options.schema.nullable() : options.schema;
  return createFieldDefinition(withDefaults(
    {
      kind: "richText",
      payloadType: "richText",
      schema,
      runtimeSchema: schema,
      payloadCore: options.required === undefined ? {} : { required: options.required, },
      payloadExtras: asPayloadExtras(options.payload),
      required: options.required ?? false,
      nullable: options.nullable ?? false,
    }, options
  ));
}

function native<
  TPayloadField extends PayloadDataField,
  TSchema extends AnyCanonicalSchema | undefined = undefined
> (options: NativeFieldOptions<TPayloadField, TSchema>): FieldDefinition<"native", TSchema, TPayloadField> {
  const payload = options.payload as unknown as Record<string, unknown>;
  const payloadType = typeof payload.type === "string" ? payload.type : "unknown";
  return createFieldDefinition<"native", TSchema, TPayloadField>(withDefaults(
    {
      kind: "native",
      payloadType,
      schema: options.schema,
      runtimeSchema: options.schema,
      payloadCore: {},
      payloadExtras: payload,
      required: payload.required === true,
      nullable: false,
    }, options
  ));
}

export const field = Object.freeze({
  text,
  textarea,
  slug,
  number,
  money,
  boolean,
  date,
  select,
  relationship,
  upload,
  group,
  array,
  richText,
  native,
});
