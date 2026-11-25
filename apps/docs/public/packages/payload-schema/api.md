# API Reference & Compatibility

Complete public API symbol reference, field factory signatures, entry points, and runtime compatibility matrix for Payload Schema.

**Topic:** api
**Package:** `@nexload-sdk/payload-schema` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/api/
The complete public API symbol inventory is generated automatically from package source exports:

## Functions

### `defineEntity`

```ts
defineEntity<const TName extends string, const TFields extends EntityFieldMap, TIdSchema extends AnyCanonicalSchema = z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, TRelationshipIdSchema extends AnyCanonicalSchema = z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>(options: DefineEntityOptions<TName, TFields, TIdSchema, TRelationshipIdSchema>) => EntityDefinition<TName, BindRelationshipSchemas<TFields, TRelationshipIdSchema>, TIdSchema>
```

**Exported from:** `@nexload-sdk/payload-schema`

Public function exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/entity/define-entity.ts#L353)

### `isPayloadSchemaError`

```ts
isPayloadSchemaError(error: unknown) => error is PayloadSchemaError<PayloadSchemaErrorCode>
isPayloadSchemaError<TCode extends PayloadSchemaErrorCode>(error: unknown, code: TCode) => error is PayloadSchemaError<TCode>
```

**Exported from:** `@nexload-sdk/payload-schema`

Public function exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L114)

### `payloadFields`

```ts
payloadFields<TFields extends EntityFieldMap>(entity: EntityDefinition<string, TFields, AnyCanonicalSchema>) => EntityPayloadFacade<TFields>
```

**Exported from:** `@nexload-sdk/payload-schema/payload`

Compiles an entity created by `defineEntity()` into Payload field configs.
Node / Payload config only: the compiled fields carry hooks that throw Payload's `ValidationError`.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/payload/payload-fields.ts#L18)

## Classes

### `PayloadSchemaError`

```ts
class PayloadSchemaError
```

**Exported from:** `@nexload-sdk/payload-schema`

Public classe exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L76)

## Constants

### `defaultIdSchema`

```ts
defaultIdSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>
```

**Exported from:** `@nexload-sdk/payload-schema`

Public constant exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/default-id.ts#L3)

### `field`

```ts
field: Readonly<{ text: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: TextFieldOptions<TNullable, TRequired>) => FieldDefinition<"text", NullableSchema<string, TNullable>, TextField, TRequired>; textarea: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: TextareaFieldOptions<TNullable, TRequired>) => FieldDefinition<"textarea", NullableSchema<string, TNullable>, TextareaField, TRequired>; slug: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: TextFieldOptions<TNullable, TRequired>) => FieldDefinition<"slug", NullableSchema<string, TNullable>, TextField, TRequired>; number: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: NumberFieldOptions<TNullable, TRequired>) => FieldDefinition<"number", NullableSchema<number, TNullable>, NumberField, TRequired>; money: <TNullable extends boolean = false, const TRequired extends boolean = false>(options: MoneyFieldOptions<TNullable, TRequired>) => FieldDefinition<"money", NullableSchema<number, TNullable>, NumberField, TRequired>; boolean: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: BooleanFieldOptions<TNullable, TRequired>) => FieldDefinition<"boolean", NullableSchema<boolean, TNullable>, CheckboxField, TRequired>; date: <TNullable extends boolean = false, const TRequired extends boolean = false>(options?: DateFieldOptions<TNullable, TRequired>) => FieldDefinition<"date", NullableSchema<string, TNullable>, DateField, TRequired>; select: <const TValues extends readonly string[], THasMany extends boolean = false, TNullable extends boolean = false, const TRequired extends boolean = false>(options: SelectFieldOptions<TValues, THasMany, TNullable, TRequired>) => FieldDefinition<"select", NullableSchema<THasMany extends true ? TValues[number][] : TValues[number], TNullable>, SelectField, TRequired>; relationship: <const TRelationTo extends string | readonly string[], THasMany extends boolean = false, TNullable extends boolean = false, TIdSchema extends AnyCanonicalSchema | undefined = undefined, const TRequired extends boolean = false>(options: RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema, TRequired>) => RelationshipFieldDefinition<"relationship", TRelationTo, THasMany, TNullable, TIdSchema, RelationshipField, TRequired>; upload: <const TRelationTo extends string | readonly string[], THasMany extends boolean = false, TNullable extends boolean = false, TIdSchema extends AnyCanonicalSchema | undefined = undefined, const TRequired extends boolean = false>(options: UploadFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema, TRequired>) => RelationshipFieldDefinition<"upload", TRelationTo, THasMany, TNullable, TIdSchema, UploadField, TRequired>; group: <const TFields extends EntityFieldMap, TNullable extends boolean = false, const TRequired extends boolean = false>(options: GroupFieldOptions<TFields, TNullable, TRequired>) => FieldDefinition<"group", GroupCanonicalSchema<TFields, TNullable>, NamedGroupField, TRequired>; array: <const TFields extends EntityFieldMap, TNullable extends boolean = false, const TRequired extends boolean = false>(options: ArrayFieldOptions<TFields, TNullable, TRequired>) => FieldDefinition<"array", ArrayCanonicalSchema<TFields, TNullable>, ArrayField, TRequired>; blocks: <const TBlocks extends Record<string, BlockDefinitionOptions>, TNullable extends boolean = false, const TRequired extends boolean = false>(options: BlocksFieldOptions<TBlocks, TNullable, TRequired>) => FieldDefinition<"blocks", BlocksCanonicalSchema<TBlocks, TNullable>, BlocksField, TRequired>; richText: <TSchema extends AnyCanonicalSchema, TNullable extends boolean = false, const TRequired extends boolean = false>(options: RichTextFieldOptions<TSchema, TNullable, TRequired>) => FieldDefinition<"richText", TNullable extends true ? z.ZodNullable<TSchema> : TSchema, RichTextField, TRequired>; native: <const TPayloadField extends NativePayloadInput | PayloadDataField, TSchema extends AnyCanonicalSchema | undefined = undefined>(options: NativeFieldOptions<TPayloadField, TSchema>) => FieldDefinition<"native", TSchema, TPayloadField extends PayloadDataField ? TPayloadField : Extract<PayloadDataField, { type: TPayloadField["type"]; }>, TPayloadField extends { required: true; } ? true : false>; }>
```

**Exported from:** `@nexload-sdk/payload-schema`

Public constant exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/fields/index.ts#L994)

## Interfaces

### `ArrayFieldOptions`

```ts
interface ArrayFieldOptions<
  TFields extends EntityFieldMap,
  TNullable extends boolean = false,
  TRequired extends boolean = false
> {
  fields: TFields
  required?: TRequired
  nullable?: TNullable
  minRows?: number
  maxRows?: number
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<ArrayField, "fields" | "maxRows" | "minRows">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L262)

### `BlockDefinitionOptions`

```ts
interface BlockDefinitionOptions<TFields extends EntityFieldMap = EntityFieldMap> {
  fields: TFields
  payload?: NativePayloadExtras<Block, "fields" | "slug">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L277)

### `BlocksFieldOptions`

```ts
interface BlocksFieldOptions<
  TBlocks extends Record<string, BlockDefinitionOptions> = Record<string, BlockDefinitionOptions>,
  TNullable extends boolean = false,
  TRequired extends boolean = false
> {
  blocks: TBlocks
  required?: TRequired
  nullable?: TNullable
  minRows?: number
  maxRows?: number
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<BlocksField, "blocks" | "maxRows" | "minRows">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L282)

### `DefineEntityOptions`

```ts
interface DefineEntityOptions<
  TName extends string,
  TFields extends EntityFieldMap,
  TIdSchema extends AnyCanonicalSchema,
  TRelationshipIdSchema extends AnyCanonicalSchema
> {
  name: TName
  fields: TFields
  idSchema?: TIdSchema
  relationshipIdSchema?: TRelationshipIdSchema
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L458)

### `EntityDefinition`

```ts
interface EntityDefinition<
  TName extends string,
  TFields extends EntityFieldMap,
  TIdSchema extends AnyCanonicalSchema
> {
  readonly name: TName
  readonly idSchema: TIdSchema
  readonly fields: TFields
  schema<TSchema extends AnyCanonicalSchema>(factory: (context: EntitySchemaContext<TFields>) => TSchema): TSchema
  inspect(): EntityInspection
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L446)

### `EntityInspection`

```ts
interface EntityInspection { name: string, fields: EntityInspectionFieldMap }
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L358)

### `EntityPayloadFacade`

```ts
interface EntityPayloadFacade<TFields extends EntityFieldMap> {
  all(): Field[]
  field<TKey extends keyof TFields>(key: TKey): Field
  pick<const TKeys extends readonly (keyof TFields)[]>(keys: TKeys): Field[]
}
```

**Exported from:** `@nexload-sdk/payload-schema/payload`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L440)

### `EntitySchemaContext`

```ts
interface EntitySchemaContext<TFields extends EntityFieldMap> {
  readonly fields: CanonicalSchemaMap<TFields>
  readonly pick: EntitySchemaPicker<TFields>
  readonly z: typeof import("zod").z
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L434)

### `EntitySchemaPicker`

```ts
interface EntitySchemaPicker<TFields extends EntityFieldMap> {
  <
    const TKeys extends readonly (keyof CanonicalSchemaMap<TFields>)[],
    const TOptional extends readonly SelectedKey<TKeys>[] | "all" | "auto" | undefined = undefined,
    const TRequired extends readonly SelectedKey<TKeys>[] | undefined = undefined
  >(
    keys: TKeys,
    options?: SchemaPickOptions<SelectedKey<TKeys>, TOptional, TRequired>,
  ): ZodObjectForPickedFields<TFields, TKeys, TOptional, TRequired>
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L423)

### `FieldDefinition`

```ts
interface FieldDefinition<
  TKind extends string,
  TSchema extends AnyCanonicalSchema | undefined,
  TPayloadField extends PayloadDataField,
  TRequired extends boolean = boolean
> {
  readonly kind: TKind
  readonly schema: TSchema
  readonly __required?: TRequired
  readonly __payloadFieldType?: TPayloadField
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L26)

### `GroupFieldOptions`

```ts
interface GroupFieldOptions<
  TFields extends EntityFieldMap,
  TNullable extends boolean = false,
  TRequired extends boolean = false
> {
  fields: TFields
  required?: TRequired
  nullable?: TNullable
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<NamedGroupField, "fields">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L249)

### `NativeFieldOptions`

```ts
interface NativeFieldOptions<
  TPayloadField extends NativePayloadInput | PayloadDataField = PayloadDataField,
  TSchema extends AnyCanonicalSchema | undefined = undefined
> {
  payload: (TPayloadField extends PayloadDataField
    ? Omit<TPayloadField, "defaultValue" | "name">
    : TPayloadField) & { name?: never; defaultValue?: never }
  schema?: TSchema
  defaultValue?: TSchema extends AnyCanonicalSchema ? z.input<TSchema> : never
  dynamicDefaultValue?: Extract<DefaultValue, (...args: never[]) => unknown>
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L332)

### `PayloadSchemaErrorDataMap`

```ts
interface PayloadSchemaErrorDataMap {
  INVALID_ENTITY_NAME: { received: string }
  INVALID_ENTITY: { receivedType: string }
  INVALID_FIELD_NAME: { entity?: string, field: string }
  RESERVED_FIELD_NAME: { entity?: string, field: string, reservedName: string }
  INVALID_FIELD_CONFIGURATION: { entity?: string, fieldPath: string, fieldKind: string, reason: string }
  INVALID_CONSTRAINT_RANGE: {
    entity?: string
    fieldPath: string
    constraint: string
    minimum?: number | string
    maximum?: number | string
  }
  INVALID_DEFAULT_VALUE: { entity?: string, fieldPath: string, fieldKind: string, issues: SafeIssueSummary[] }
  CONFLICTING_DEFAULT_CONFIGURATION: {
    entity?: string
    fieldPath: string
    fieldType: string
    configuredDefaults: readonly ["defaultValue", "dynamicDefaultValue"]
  }
  EMPTY_SELECT_VALUES: { entity?: string, fieldPath: string }
  INVALID_RELATIONSHIP_CONFIGURATION: {
    entity?: string
    fieldPath: string
    reason: string
    relationTo?: string[]
  }
  INVALID_NESTED_FIELD_CONFIGURATION: {
    entity?: string
    fieldPath: string
    reason: string
    blockingFieldPath?: string
  }
  ASYNC_CANONICAL_SCHEMA_UNSUPPORTED: { entity?: string, fieldPath: string, fieldKind: string }
  RESERVED_PAYLOAD_OPTION: { entity?: string, fieldPath: string, fieldKind: string, option: string }
  DUPLICATE_PAYLOAD_FIELD_NAME: { entity: string, payloadName: string, fieldPaths: string[] }
  INVALID_PAYLOAD_FIELD: { entity: string, fieldPath: string, fieldKind: string, reason: string }
  PAYLOAD_COMPILATION_FAILED: {
    entity: string
    fieldPath?: string
    fieldKind?: string
    operation: "all" | "field" | "pick"
    causeName?: string
  }
  UNKNOWN_FIELD: { entity: string, field: string, availableFields: string[] }
  SCHEMA_UNAVAILABLE: {
    entity: string
    fieldPath: string
    fieldKind: string
    reason: "native-without-schema" | "schema-less-descendant"
    blockingFieldPath?: string
  }
  INVALID_SCHEMA_FACTORY_RESULT: { entity: string, receivedType: string }
  SCHEMA_DERIVATION_FAILED: { entity: string, causeName?: string }
  INTERNAL_INVARIANT_VIOLATION: { invariant: string, entity?: string, fieldPath?: string }
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L7)

### `RelationshipFieldOptions`

```ts
interface RelationshipFieldOptions<
  TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined,
  TRequired extends boolean = false
> {
  relationTo: TRelationTo
  hasMany?: THasMany
  required?: TRequired
  nullable?: TNullable
  idSchema?: TIdSchema
  defaultValue?: MaybeNullable<
    RelationshipValueForOptions<TRelationTo, THasMany, TIdSchema>,
    TNullable
  >
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<RelationshipField, "hasMany" | "relationTo">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L156)

### `RichTextFieldOptions`

```ts
interface RichTextFieldOptions<
  TSchema extends AnyCanonicalSchema,
  TNullable extends boolean = false,
  TRequired extends boolean = false
> {
  schema: TSchema
  required?: TRequired
  nullable?: TNullable
  defaultValue?: MaybeNullable<z.input<TSchema>, TNullable>
  dynamicDefaultValue?: DynamicDefaultValue<MaybeNullable<z.input<TSchema>, TNullable>>
  payload?: NativePayloadExtras<RichTextField>
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L297)

### `SelectFieldOptions`

```ts
interface SelectFieldOptions<
  TValues extends readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TRequired extends boolean = false
> {
  values: TValues
  labels?: Partial<Record<TValues[number], string>>
  hasMany?: THasMany
  required?: TRequired
  nullable?: TNullable
  defaultValue?: MaybeNullable<THasMany extends true ? TValues[number][] : TValues[number], TNullable>
  dynamicDefaultValue?: DynamicDefaultValue<
    MaybeNullable<THasMany extends true ? TValues[number][] : TValues[number], TNullable>
  >
  payload?: NativePayloadExtras<SelectField, "hasMany" | "options">
}
```

**Exported from:** `@nexload-sdk/payload-schema`

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L138)

## Types

### `BooleanFieldOptions`

```ts
type BooleanFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = CommonFieldOptions<
  boolean,
  TNullable,
  NativePayloadExtras<CheckboxField>,
  TRequired
>;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L118)

### `DateFieldOptions`

```ts
type DateFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<DateField>,
  TRequired
> & { minimum?: string, maximum?: string };
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L128)

### `DefaultIdSchema`

```ts
type DefaultIdSchema = typeof defaultIdSchema;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/default-id.ts#L8)

### `EntityFieldMap`

```ts
type EntityFieldMap = Readonly<Record<string, AnyFieldDefinition>>;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L39)

### `InferEntityField`

```ts
type InferEntityField<TField extends FieldDefinition<string, AnyCanonicalSchema, PayloadDataField>>
  = z.infer<TField["schema"]>;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L470)

### `InferEntityFields`

```ts
type InferEntityFields<TEntity extends EntityDefinition<string, EntityFieldMap, AnyCanonicalSchema>> = {
  [TKey in keyof TEntity["fields"]]: TEntity["fields"][TKey]["schema"] extends AnyCanonicalSchema
    ? z.infer<TEntity["fields"][TKey]["schema"]>
    : never
};
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L473)

### `MoneyFieldOptions`

```ts
type MoneyFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = Omit<
  NumberFieldOptions<TNullable, TRequired>,
  "integer" | "safe"
> & { currency: string };
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L110)

### `NumberFieldOptions`

```ts
type NumberFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = CommonFieldOptions<
  number,
  TNullable,
  NativePayloadExtras<NumberField, "max" | "min">,
  TRequired
> & {
  integer?: boolean
  safe?: boolean
  minimum?: number
  maximum?: number
  multipleOf?: number
};
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L94)

### `PayloadSchemaErrorCode`

```ts
type PayloadSchemaErrorCode = keyof PayloadSchemaErrorDataMap;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L64)

### `PayloadSchemaErrorPhase`

```ts
type PayloadSchemaErrorPhase = "definition" | "internal" | "payload-compilation" | "schema-derivation";
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L66)

### `SerializedPayloadSchemaError`

```ts
type SerializedPayloadSchemaError<TCode extends PayloadSchemaErrorCode = PayloadSchemaErrorCode> = {
  name: "PayloadSchemaError"
  code: TCode
  phase: PayloadSchemaErrorPhase
  message: string
  data: PayloadSchemaErrorDataMap[TCode]
};
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/errors.ts#L68)

### `TextFieldOptions`

```ts
type TextFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<TextField, "maxLength" | "minLength">,
  TRequired
> & {
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
};
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L67)

### `TextareaFieldOptions`

```ts
type TextareaFieldOptions<
  TNullable extends boolean = false,
  TRequired extends boolean = false
> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<TextareaField, "maxLength" | "minLength">,
  TRequired
> & Omit<TextFieldOptions<TNullable, TRequired>, keyof CommonFieldOptions<string, TNullable, unknown, TRequired> | "payload">;
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L84)

### `UploadFieldOptions`

```ts
type UploadFieldOptions<
  TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined,
  TRequired extends boolean = false
> = Omit<RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema, TRequired>, "payload"> & { payload?: NativePayloadExtras<UploadField, "hasMany" | "relationTo"> };
```

**Exported from:** `@nexload-sdk/payload-schema`

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/core/types.ts#L241)

***

## Entry Points & Signatures

### Root Entry: `@nexload-sdk/payload-schema`

The root entry is pure and browser-safe. It does not import `payload` at runtime and can be used in client bundles, edge runtimes, or Node.

```ts
import {
  defineEntity,
  field,
  defaultIdSchema,
  PayloadSchemaError,
  isPayloadSchemaError,
} from "@nexload-sdk/payload-schema";
import type {
  BlockDefinitionOptions,
  BlocksFieldOptions,
  EntityDefinition,
} from "@nexload-sdk/payload-schema";
```

An entity created by `defineEntity()` has:

* `name: string`: The entity name.
* `idSchema: AnyCanonicalSchema`: Canonical ID schema (defaults to `defaultIdSchema`).
* `fields: BoundFields`: Frozen map of defined field definitions.
* `schema(factory)`: Derives custom Zod schemas with access to `{ fields, pick, z }`.
* `inspect()`: Returns structured entity and field inspection metadata.

### Payload Compilation Entry: `@nexload-sdk/payload-schema/payload`

This entry is Node/Payload configuration only. It imports Payload's `ValidationError` to construct canonical validation hooks.

```ts
import { payloadFields } from "@nexload-sdk/payload-schema/payload";

const facade = payloadFields(entity);
facade.all();          // Returns all compiled Payload Field[] configs
facade.field("title"); // Returns a single compiled Payload Field config
facade.pick(["title"]); // Returns picked Payload Field[] configs
```

* **Safety Check:** Calling `payloadFields()` with anything other than an entity instance produced by `defineEntity()` throws a `PayloadSchemaError` with code `INVALID_ENTITY` (phase: `"payload-compilation"`).
* **Fresh Containers:** Each compilation call produces fresh field configuration objects so mutations in Payload config do not pollute entity seeds.

***

## Field Factory Reference

| Factory | Core Options | Default Value Support | Output Payload Type |
|---|---|---|---|
| `field.text()` | `required`, `trim`, `lowercase`, `uppercase`, `minLength`, `maxLength`, `pattern` | Static & Dynamic | `TextField` |
| `field.slug()` | `required`, `minLength`, `maxLength`, Unicode NFKC normalization | Static & Dynamic | `TextField` |
| `field.textarea()` | `required`, `trim`, `minLength`, `maxLength` | Static & Dynamic | `TextareaField` |
| `field.number()` | `required`, `integer`, `safe`, `minimum`, `maximum`, `multipleOf` | Static & Dynamic | `NumberField` |
| `field.money()` | `currency`, `minimum`, `maximum` (Always safe integer minor units) | Static & Dynamic | `NumberField` |
| `field.boolean()` | `required` (Payload checkbox) | Static & Dynamic | `CheckboxField` |
| `field.date()` | `required`, `minimum`, `maximum` (ISO string with timezone offset; hook accepts JS `Date`) | Static & Dynamic | `DateField` |
| `field.select()` | `values`, `labels`, `hasMany` (Validated unique non-empty enums) | Static & Dynamic | `SelectField` |
| `field.relationship()` | `relationTo`, `hasMany`, `idSchema` (Single or polymorphic) | Static & Dynamic | `RelationshipField` |
| `field.upload()` | `relationTo`, `hasMany`, `idSchema` | Static & Dynamic | `UploadField` |
| `field.group()` | `fields` (Nested `EntityFieldMap`), `required`, `nullable` (Non-required children are optional and nullable) | Static & Dynamic | `NamedGroupField` |
| `field.array()` | `fields`, `minRows`, `maxRows`, `required`, `nullable` (Non-required children are optional and nullable) | Static & Dynamic | `ArrayField` |
| `field.blocks()` | `blocks` (Map of block definitions), `minRows`, `maxRows`, `required`, `nullable` (Non-required children are optional and nullable; child names `id`, `blockName`, `blockType` are reserved) | Static & Dynamic | `BlocksField` |
| `field.richText()` | `schema` (Explicit AST Zod schema validator required) | Static & Dynamic | `RichTextField` |
| `field.native()` | `payload`, `schema` (Escape hatch for custom/unsupported types) | Dynamic (Static requires schema) | Any Payload data field |

***

## Runtime Compatibility Matrix

| Runtime / Engine | Version Requirement | Verification Status |
|---|---|---|
| **Node.js** | `>=20.9.0` | Verified on Node 20 & 22 |
| **Payload CMS** | `>=3.85.0 <4.0.0` | Verified on Payload >=3.85 |
| **Zod** | `>=4.1.0 <5.0.0` | Verified on Zod 4.4.3 (requires codecs support) |
| **Module Format** | ESM only | Root entry is browser-safe; `/payload` is Node/Payload-config only |
| **Side Effects** | `false` | Fully tree-shakeable |
