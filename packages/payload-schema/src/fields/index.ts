import type {
  ArrayField,
  BlocksField,
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

import { z } from "zod";

import type {
  AnyCanonicalSchema,
  ArrayFieldOptions,
  BlockDefinitionOptions,
  BlocksFieldOptions,
  BooleanFieldOptions,
  DateFieldOptions,
  EntityFieldMap,
  FieldDefinition,
  GroupFieldOptions,
  MaybeNullable,
  MoneyFieldOptions,
  NativeFieldOptions,
  NativePayloadInput,
  NumberFieldOptions,
  PayloadDataField,
  RelationshipFieldDefinition,
  RelationshipFieldOptions,
  RichTextFieldOptions,
  SelectFieldOptions,
  TextareaFieldOptions,
  TextFieldOptions,
  UploadFieldOptions
} from "../core/types.js";

import { defaultIdSchema } from "../core/default-id.js";
import { PayloadSchemaError } from "../core/errors.js";
import { buildBlocksSchema } from "../internal/blocks-schema.js";
import {
  type BlockSeed,
  createFieldDefinition,
  fieldEntries,
  type FieldSeed
} from "../internal/field-definition.js";

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
type BlocksHaveSchemaLessChild<TBlocks extends Record<string, BlockDefinitionOptions>> = {
  [TSlug in keyof TBlocks]: SchemaLessKey<TBlocks[TSlug]["fields"]> extends never ? never : TSlug
}[keyof TBlocks];
type BlockMemberShape<TSlug extends string, TFields extends EntityFieldMap> = {
  blockType: z.ZodLiteral<TSlug>
  id: z.ZodOptional<z.ZodString>
  blockName: z.ZodOptional<z.ZodNullable<z.ZodString>>
} & {
  [TKey in keyof TFields]: Extract<TFields[TKey]["schema"], AnyCanonicalSchema>
};
type BlockMemberSchema<TSlug extends string, TFields extends EntityFieldMap> = z.ZodObject<
  BlockMemberShape<TSlug, TFields>
>;
type BlockUnionOutput<TBlocks extends Record<string, BlockDefinitionOptions>> = {
  [TSlug in keyof TBlocks & string]: z.infer<BlockMemberSchema<TSlug, TBlocks[TSlug]["fields"]>>
}[keyof TBlocks & string];
type BlockUnionInput<TBlocks extends Record<string, BlockDefinitionOptions>> = {
  [TSlug in keyof TBlocks & string]: z.input<BlockMemberSchema<TSlug, TBlocks[TSlug]["fields"]>>
}[keyof TBlocks & string];
type BlocksCanonicalSchema<
  TBlocks extends Record<string, BlockDefinitionOptions>,
  TNullable extends boolean
> = BlocksHaveSchemaLessChild<TBlocks> extends never
  ? TNullable extends true
    ? z.ZodNullable<z.ZodArray<z.ZodType<BlockUnionOutput<TBlocks>, BlockUnionInput<TBlocks>>>>
    : z.ZodArray<z.ZodType<BlockUnionOutput<TBlocks>, BlockUnionInput<TBlocks>>>
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

function buildTextSchema<
  TNullable extends boolean,
  TRequired extends boolean = boolean
> (
  options: TextFieldOptions<TNullable, TRequired>,
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
    schema = schema.overwrite((value) => value
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
    if (options.trim) schema = schema.overwrite((value) => value.trim());
    if (options.lowercase) schema = schema.overwrite((value) => value.toLowerCase());
    if (options.uppercase) schema = schema.overwrite((value) => value.toUpperCase());
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

function text<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: TextFieldOptions<TNullable, TRequired> = {} as TextFieldOptions<TNullable, TRequired>):
FieldDefinition<"text", NullableSchema<string, TNullable>, TextField, TRequired> {
  const schema = buildTextSchema(
    options as unknown as TextFieldOptions<TNullable, TRequired>, false
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

function textarea<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: TextareaFieldOptions<TNullable, TRequired> = {} as TextareaFieldOptions<TNullable, TRequired>):
FieldDefinition<"textarea", NullableSchema<string, TNullable>, TextareaField, TRequired> {
  const schema = buildTextSchema(
    options as unknown as TextFieldOptions<TNullable, TRequired>, false
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

function slug<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: TextFieldOptions<TNullable, TRequired> = {} as TextFieldOptions<TNullable, TRequired>):
FieldDefinition<"slug", NullableSchema<string, TNullable>, TextField, TRequired> {
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

function buildNumberSchema<
  TNullable extends boolean,
  TRequired extends boolean = boolean
> (
  options: NumberFieldOptions<TNullable, TRequired>,
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

function number<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: NumberFieldOptions<TNullable, TRequired> = {} as NumberFieldOptions<TNullable, TRequired>):
FieldDefinition<"number", NullableSchema<number, TNullable>, NumberField, TRequired> {
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

function money<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: MoneyFieldOptions<TNullable, TRequired>): FieldDefinition<"money", NullableSchema<number, TNullable>, NumberField, TRequired> {
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

function boolean<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: BooleanFieldOptions<TNullable, TRequired> = {} as BooleanFieldOptions<TNullable, TRequired>):
FieldDefinition<"boolean", NullableSchema<boolean, TNullable>, CheckboxField, TRequired> {
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

function date<
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: DateFieldOptions<TNullable, TRequired> = {} as DateFieldOptions<TNullable, TRequired>):
FieldDefinition<"date", NullableSchema<string, TNullable>, DateField, TRequired> {
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
  let base: z.ZodType<string, string> = iso.overwrite((value) => new Date(value).toISOString());

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
  const runtimeDate = z.unknown().transform((value, ctx) => {
    if (value instanceof Date) {
      const dateValue = value as Date;

      if (Number.isNaN(dateValue.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid date",
        });

        return z.NEVER;
      }

      return dateValue.toISOString();
    }

    return value;
  });
  const runtimeSchema = runtimeDate.pipe(schema);

  return createFieldDefinition(withDefaults(
    {
      kind: "date",
      payloadType: "date",
      schema,
      runtimeSchema,
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
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: SelectFieldOptions<TValues, THasMany, TNullable, TRequired>): FieldDefinition<
  "select",
  NullableSchema<THasMany extends true ? TValues[number][] : TValues[number], TNullable>,
  SelectField,
  TRequired
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
  TIdSchema extends AnyCanonicalSchema | undefined = undefined,
  const TRequired extends boolean = false
> (options: RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema, TRequired>): RelationshipFieldDefinition<
  "relationship",
  TRelationTo,
  THasMany,
  TNullable,
  TIdSchema,
  RelationshipField,
  TRequired
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
  )) as RelationshipFieldDefinition<
    "relationship",
    TRelationTo,
    THasMany,
    TNullable,
    TIdSchema,
    RelationshipField,
    TRequired
  >;
}

function upload<
  const TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined,
  const TRequired extends boolean = false
> (options: UploadFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema, TRequired>): RelationshipFieldDefinition<
  "upload",
  TRelationTo,
  THasMany,
  TNullable,
  TIdSchema,
  UploadField,
  TRequired
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
  )) as RelationshipFieldDefinition<
    "upload",
    TRelationTo,
    THasMany,
    TNullable,
    TIdSchema,
    UploadField,
    TRequired
  >;
}

function composeObject (fields: EntityFieldMap): { schema?: AnyCanonicalSchema, children: ReadonlyArray<readonly [string, FieldSeed]>, blocking?: string } {
  const children = fieldEntries(fields);
  const blockingEntry = children.find(([, seed]) => !seed.schema);

  if (blockingEntry) {
    const blocking = blockingEntry[1].blockingFieldPath
      ? `${blockingEntry[0]}.${blockingEntry[1].blockingFieldPath}`
      : blockingEntry[0];

    return { children, blocking, };
  }
  const shape = Object.fromEntries(children.map(([
    name,
    seed
  ]) => [
    name,
    seed.schema
  ])) as Record<string, AnyCanonicalSchema>;

  return { children, schema: z.strictObject(shape), };
}

function group<
  const TFields extends EntityFieldMap,
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: GroupFieldOptions<TFields, TNullable, TRequired>):
FieldDefinition<"group", GroupCanonicalSchema<TFields, TNullable>, NamedGroupField, TRequired> {
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

function array<
  const TFields extends EntityFieldMap,
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: ArrayFieldOptions<TFields, TNullable, TRequired>):
FieldDefinition<"array", ArrayCanonicalSchema<TFields, TNullable>, ArrayField, TRequired> {
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

function blocks<
  const TBlocks extends Record<string, BlockDefinitionOptions>,
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: BlocksFieldOptions<TBlocks, TNullable, TRequired>):
FieldDefinition<"blocks", BlocksCanonicalSchema<TBlocks, TNullable>, BlocksField, TRequired> {
  validateRange(
    "blocks", "rows", options.minRows, options.maxRows
  );

  if (!options.blocks || Object.keys(options.blocks).length === 0) {
    throw new PayloadSchemaError(
      "INVALID_FIELD_CONFIGURATION", {
        phase: "definition",
        message: "Blocks field must define at least one block.",
        data: { fieldPath: unboundPath, fieldKind: "blocks", reason: "empty blocks configuration", },
      }
    );
  }

  const blockEntries = Object.entries(options.blocks);

  for (const [slug, blockDef] of blockEntries) {
    if (typeof slug !== "string" || !slug.trim()) {
      throw new PayloadSchemaError(
        "INVALID_FIELD_CONFIGURATION", {
          phase: "definition",
          message: "Block slug must be a non-empty string.",
          data: { fieldPath: unboundPath, fieldKind: "blocks", reason: "empty block slug", },
        }
      );
    }
    if (blockDef.payload) {
      for (const key of ["fields", "slug"] as const) {
        if (Object.hasOwn(blockDef.payload, key)) {
          throw new PayloadSchemaError(
            "RESERVED_PAYLOAD_OPTION", {
              phase: "definition",
              message: `Block "${slug}" cannot configure reserved Payload option "${key}".`,
              data: { fieldPath: `${unboundPath}.${slug}`, fieldKind: "blocks", option: key, },
            }
          );
        }
      }
    }
  }

  const blockSeeds: BlockSeed[] = [];
  let firstBlocking: string | undefined;

  for (const [slug, blockDef] of blockEntries) {
    const children = fieldEntries(blockDef.fields);
    const blockingEntry = children.find(([, seed]) => !seed.schema);
    const blockingChild = blockingEntry
      ? (blockingEntry[1].blockingFieldPath
        ? `${blockingEntry[0]}.${blockingEntry[1].blockingFieldPath}`
        : blockingEntry[0])
      : undefined;
    const blockingPath = blockingChild ? `${slug}.${blockingChild}` : undefined;

    if (blockingPath && !firstBlocking) {
      firstBlocking = blockingPath;
    }

    blockSeeds.push({
      slug,
      payloadExtras: asPayloadExtras(blockDef.payload),
      children,
      blockingFieldPath: blockingPath,
    });
  }

  const schema = firstBlocking
    ? undefined
    : buildBlocksSchema(
      blockSeeds, {
        minRows: options.minRows,
        maxRows: options.maxRows,
        nullable: options.nullable,
      }
    );

  const slugs = blockEntries.map(([slug]) => slug) as [string, ...string[]];
  const rowSchema = z.looseObject({
    blockType: z.enum(slugs),
  });
  let container = z.array(rowSchema);

  if (options.minRows !== undefined) container = container.min(options.minRows);
  if (options.maxRows !== undefined) container = container.max(options.maxRows);
  const runtimeSchema = applyNullable(container, options.nullable);

  return createFieldDefinition(withDefaults(
    {
      kind: "blocks",
      payloadType: "blocks",
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
      blocks: blockSeeds,
      blockingFieldPath: firstBlocking,
      minRows: options.minRows,
      maxRows: options.maxRows,
    }, options
  )) as FieldDefinition<"blocks", BlocksCanonicalSchema<TBlocks, TNullable>, BlocksField, TRequired>;
}

function richText<
  TSchema extends AnyCanonicalSchema,
  TNullable extends boolean = false,
  const TRequired extends boolean = false
> (options: RichTextFieldOptions<TSchema, TNullable, TRequired>):
FieldDefinition<"richText", TNullable extends true ? z.ZodNullable<TSchema> : TSchema, RichTextField, TRequired> {
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
  const TPayloadField extends NativePayloadInput | PayloadDataField,
  TSchema extends AnyCanonicalSchema | undefined = undefined
> (options: NativeFieldOptions<TPayloadField, TSchema>): FieldDefinition<
  "native",
  TSchema,
  TPayloadField extends PayloadDataField ? TPayloadField : Extract<PayloadDataField, { type: TPayloadField["type"] }>,
  TPayloadField extends { required: true } ? true : false
> {
  const payload = options.payload as unknown as Record<string, unknown>;
  const payloadType = typeof payload.type === "string" ? payload.type : "unknown";

  return createFieldDefinition<
    "native",
    TSchema,
    TPayloadField extends PayloadDataField ? TPayloadField : Extract<PayloadDataField, { type: TPayloadField["type"] }>,
    TPayloadField extends { required: true } ? true : false
  >(withDefaults(
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
  blocks,
  richText,
  native,
});
