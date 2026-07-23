# API reference

Public runtime and type exports for Payload Schema 1.1.0.

**Topic:** api
**Package:** `@nexload-sdk/payload-schema` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/api/
## Functions

### `defineEntity`

```ts
defineEntity<const TName extends string, const TFields extends EntityFieldMap, TIdSchema extends AnyCanonicalSchema = z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>, TRelationshipIdSchema extends AnyCanonicalSchema = z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>(options: DefineEntityOptions<TName, TFields, TIdSchema, TRelationshipIdSchema>) => EntityDefinition<TName, BindRelationshipSchemas<TFields, TRelationshipIdSchema>, TIdSchema>
```

Public function exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/entity/define-entity.ts#L518)

### `isPayloadSchemaError`

```ts
isPayloadSchemaError(error: unknown) => error is PayloadSchemaError<PayloadSchemaErrorCode>
isPayloadSchemaError<TCode extends PayloadSchemaErrorCode>(error: unknown, code: TCode) => error is PayloadSchemaError<TCode>
```

Public function exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L113)

## Classes

### `PayloadSchemaError`

```ts
class PayloadSchemaError
```

Public classe exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L75)

## Constants

### `defaultIdSchema`

```ts
defaultIdSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>
```

Public constant exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/default-id.ts#L3)

### `field`

```ts
field: Readonly<{ text: <TNullable extends boolean = false>(options?: TextFieldOptions<TNullable>) => FieldDefinition<"text", NullableSchema<string, TNullable>, TextField>; textarea: <TNullable extends boolean = false>(options?: TextareaFieldOptions<TNullable>) => FieldDefinition<"textarea", NullableSchema<string, TNullable>, TextareaField>; slug: <TNullable extends boolean = false>(options?: TextFieldOptions<TNullable>) => FieldDefinition<"slug", NullableSchema<string, TNullable>, TextField>; number: <TNullable extends boolean = false>(options?: NumberFieldOptions<TNullable>) => FieldDefinition<"number", NullableSchema<number, TNullable>, NumberField>; money: <TNullable extends boolean = false>(options: MoneyFieldOptions<TNullable>) => FieldDefinition<"money", NullableSchema<number, TNullable>, NumberField>; boolean: <TNullable extends boolean = false>(options?: BooleanFieldOptions<TNullable>) => FieldDefinition<"boolean", NullableSchema<boolean, TNullable>, CheckboxField>; date: <TNullable extends boolean = false>(options?: DateFieldOptions<TNullable>) => FieldDefinition<"date", NullableSchema<string, TNullable>, DateField>; select: <const TValues extends readonly string[], THasMany extends boolean = false, TNullable extends boolean = false>(options: SelectFieldOptions<TValues, THasMany, TNullable>) => FieldDefinition<"select", NullableSchema<THasMany extends true ? TValues[number][] : TValues[number], TNullable>, SelectField>; relationship: <const TRelationTo extends string | readonly string[], THasMany extends boolean = false, TNullable extends boolean = false, TIdSchema extends AnyCanonicalSchema | undefined = undefined>(options: RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>) => RelationshipFieldDefinition<"relationship", TRelationTo, THasMany, TNullable, TIdSchema, RelationshipField>; upload: <const TRelationTo extends string | readonly string[], THasMany extends boolean = false, TNullable extends boolean = false, TIdSchema extends AnyCanonicalSchema | undefined = undefined>(options: UploadFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>) => RelationshipFieldDefinition<"upload", TRelationTo, THasMany, TNullable, TIdSchema, UploadField>; group: <const TFields extends EntityFieldMap, TNullable extends boolean = false>(options: GroupFieldOptions<TFields, TNullable>) => FieldDefinition<"group", GroupCanonicalSchema<TFields, TNullable>, NamedGroupField>; array: <const TFields extends EntityFieldMap, TNullable extends boolean = false>(options: ArrayFieldOptions<TFields, TNullable>) => FieldDefinition<"array", ArrayCanonicalSchema<TFields, TNullable>, ArrayField>; richText: <TSchema extends AnyCanonicalSchema, TNullable extends boolean = false>(options: RichTextFieldOptions<TSchema, TNullable>) => FieldDefinition<"richText", TNullable extends true ? z.ZodNullable<TSchema> : TSchema, RichTextField>; native: <TPayloadField extends PayloadDataField, TSchema extends AnyCanonicalSchema | undefined = undefined>(options: NativeFieldOptions<TPayloadField, TSchema>) => FieldDefinition<"native", TSchema, TPayloadField>; }>
```

Public constant exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/fields/index.ts#L686)

## Interfaces

### `ArrayFieldOptions`

```ts
interface ArrayFieldOptions<TFields extends EntityFieldMap, TNullable extends boolean = false> {
  fields: TFields
  required?: boolean
  nullable?: TNullable
  minRows?: number
  maxRows?: number
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<ArrayField, "fields" | "maxRows" | "minRows">
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L219)

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

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L362)

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
  readonly payload: EntityPayloadFacade<TFields>
  schema<TSchema extends AnyCanonicalSchema>(factory: (context: EntitySchemaContext<TFields>) => TSchema): TSchema
  inspect(): EntityInspection
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L349)

### `EntityInspection`

```ts
interface EntityInspection { name: string, fields: EntityInspectionFieldMap }
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L284)

### `EntitySchemaContext`

```ts
interface EntitySchemaContext<TFields extends EntityFieldMap> {
  readonly fields: CanonicalSchemaMap<TFields>
  readonly pick: EntitySchemaPicker<TFields>
  readonly z: typeof import("zod").z
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L337)

### `EntitySchemaPicker`

```ts
interface EntitySchemaPicker<TFields extends EntityFieldMap> {
  <
    const TKeys extends readonly (keyof CanonicalSchemaMap<TFields>)[],
    const TOptional extends readonly SelectedKey<TKeys>[] | "all" | undefined = undefined,
    const TRequired extends readonly SelectedKey<TKeys>[] | undefined = undefined
  >(
    keys: TKeys,
    options?: SchemaPickOptions<SelectedKey<TKeys>, TOptional, TRequired>,
  ): ZodObjectForPickedFields<TFields, TKeys, TOptional, TRequired>
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L326)

### `FieldDefinition`

```ts
interface FieldDefinition<
  TKind extends string,
  TSchema extends AnyCanonicalSchema | undefined,
  TPayloadField extends PayloadDataField
> {
  readonly kind: TKind
  readonly schema: TSchema
  readonly __payloadFieldType?: TPayloadField
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L24)

### `GroupFieldOptions`

```ts
interface GroupFieldOptions<TFields extends EntityFieldMap, TNullable extends boolean = false> {
  fields: TFields
  required?: boolean
  nullable?: TNullable
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<NamedGroupField, "fields">
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L210)

### `NativeFieldOptions`

```ts
interface NativeFieldOptions<
  TPayloadField extends PayloadDataField,
  TSchema extends AnyCanonicalSchema | undefined = undefined
> {
  payload: Omit<TPayloadField, "defaultValue" | "name">
  schema?: TSchema
  defaultValue?: TSchema extends AnyCanonicalSchema ? z.input<TSchema> : never
  dynamicDefaultValue?: Extract<DefaultValue, (...args: never[]) => unknown>
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L260)

### `PayloadSchemaErrorDataMap`

```ts
interface PayloadSchemaErrorDataMap {
  INVALID_ENTITY_NAME: { received: string }
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

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L7)

### `RelationshipFieldOptions`

```ts
interface RelationshipFieldOptions<
  TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined
> {
  relationTo: TRelationTo
  hasMany?: THasMany
  required?: boolean
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

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L123)

### `RichTextFieldOptions`

```ts
interface RichTextFieldOptions<
  TSchema extends AnyCanonicalSchema,
  TNullable extends boolean = false
> {
  schema: TSchema
  required?: boolean
  nullable?: TNullable
  defaultValue?: MaybeNullable<z.input<TSchema>, TNullable>
  dynamicDefaultValue?: DynamicDefaultValue<MaybeNullable<z.input<TSchema>, TNullable>>
  payload?: NativePayloadExtras<RichTextField>
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L230)

### `SelectFieldOptions`

```ts
interface SelectFieldOptions<
  TValues extends readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false
> {
  values: TValues
  labels?: Partial<Record<TValues[number], string>>
  hasMany?: THasMany
  required?: boolean
  nullable?: TNullable
  defaultValue?: MaybeNullable<THasMany extends true ? TValues[number][] : TValues[number], TNullable>
  dynamicDefaultValue?: DynamicDefaultValue<
    MaybeNullable<THasMany extends true ? TValues[number][] : TValues[number], TNullable>
  >
  payload?: NativePayloadExtras<SelectField, "hasMany" | "options">
}
```

Public interface exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L106)

## Types

### `BooleanFieldOptions`

```ts
type BooleanFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  boolean,
  TNullable,
  NativePayloadExtras<CheckboxField>
>;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L94)

### `DateFieldOptions`

```ts
type DateFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<DateField>
> & { minimum?: string, maximum?: string };
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L100)

### `DefaultIdSchema`

```ts
type DefaultIdSchema = typeof defaultIdSchema;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/default-id.ts#L8)

### `EntityFieldMap`

```ts
type EntityFieldMap = Readonly<Record<string, AnyFieldDefinition>>;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L35)

### `InferEntityField`

```ts
type InferEntityField<TField extends FieldDefinition<string, AnyCanonicalSchema, PayloadDataField>>
  = z.infer<TField["schema"]>;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L374)

### `InferEntityFields`

```ts
type InferEntityFields<TEntity extends EntityDefinition<string, EntityFieldMap, AnyCanonicalSchema>> = {
  [TKey in keyof TEntity["fields"]]: TEntity["fields"][TKey]["schema"] extends AnyCanonicalSchema
    ? z.infer<TEntity["fields"][TKey]["schema"]>
    : never
};
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L377)

### `MoneyFieldOptions`

```ts
type MoneyFieldOptions<TNullable extends boolean = false> = Omit<
  NumberFieldOptions<TNullable>,
  "integer" | "safe"
> & { currency: string };
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L89)

### `NumberFieldOptions`

```ts
type NumberFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  number,
  TNullable,
  NativePayloadExtras<NumberField, "max" | "min">
> & {
  integer?: boolean
  safe?: boolean
  minimum?: number
  maximum?: number
  multipleOf?: number
};
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L77)

### `PayloadSchemaErrorCode`

```ts
type PayloadSchemaErrorCode = keyof PayloadSchemaErrorDataMap;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L63)

### `PayloadSchemaErrorPhase`

```ts
type PayloadSchemaErrorPhase = "definition" | "internal" | "payload-compilation" | "schema-derivation";
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L65)

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

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/errors.ts#L67)

### `TextareaFieldOptions`

```ts
type TextareaFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<TextareaField, "maxLength" | "minLength">
> & Omit<TextFieldOptions<TNullable>, keyof CommonFieldOptions<string, TNullable, unknown> | "payload">;
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L71)

### `TextFieldOptions`

```ts
type TextFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<TextField, "maxLength" | "minLength">
> & {
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
};
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L58)

### `UploadFieldOptions`

```ts
type UploadFieldOptions<
  TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined
> = Omit<RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>, "payload"> & { payload?: NativePayloadExtras<UploadField, "hasMany" | "relationTo"> };
```

Public type exported by @nexload-sdk/payload-schema.

[Source](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts#L203)

## Runtime exports

* `defineEntity(options)` validates and binds a named field map, then returns the entity facade.
* `field` is a frozen namespace of 14 field factories.
* `defaultIdSchema` accepts a non-empty string or safe integer.
* `PayloadSchemaError` represents package definition, compilation, derivation, and invariant failures.
* `isPayloadSchemaError(error, code?)` narrows any package error or one exact code.

## Entity facade

`entity.payload.all()`, `.field(key)`, and `.pick(keys)` return ordinary Payload fields. `entity.schema(factory)` supplies `{ fields, pick, z }` and accepts any Zod schema result. `entity.inspect()` returns deterministic safe metadata without raw configs, schemas, functions, or values.

## Types

The root exports field option types, entity/context/picker types, inference helpers, and the structured error map. `PayloadSchemaErrorCode` is exactly `keyof PayloadSchemaErrorDataMap`. `InferEntityField` and `InferEntityFields` infer canonical schema outputs, not Payload documents.

## Error phases

`PayloadSchemaErrorPhase` is `definition | payload-compilation | schema-derivation | internal`. Ordinary invalid field data is a Payload `ValidationError`, not a `PayloadSchemaError`.

See the [root entrypoint](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/index.ts) and [public types](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/types.ts).
