import type {
  ArrayField,
  CheckboxField,
  DateField,
  DefaultValue,
  Field,
  FieldAffectingData,
  NamedGroupField,
  NumberField,
  PayloadRequest,
  RelationshipField,
  RichTextField,
  SelectField,
  TextareaField,
  TextField,
  UploadField
} from "payload";
import type { z } from "zod";

export type PayloadDataField = Extract<FieldAffectingData, Field>;
export type AnyCanonicalSchema = z.ZodType<unknown, unknown>;
export type MaybeNullable<TValue, TNullable extends boolean> = TNullable extends true ? null | TValue : TValue;

export interface FieldDefinition<
  TKind extends string,
  TSchema extends AnyCanonicalSchema | undefined,
  TPayloadField extends PayloadDataField
> {
  readonly kind: TKind
  readonly schema: TSchema
  readonly __payloadFieldType?: TPayloadField
}

export type AnyFieldDefinition = FieldDefinition<string, AnyCanonicalSchema | undefined, PayloadDataField>;
export type EntityFieldMap = Readonly<Record<string, AnyFieldDefinition>>;

type DynamicDefaultArguments = {
  locale?: string
  req: PayloadRequest
  user: PayloadRequest["user"]
};

export type DynamicDefaultValue<TValue> = (args: DynamicDefaultArguments) => Promise<TValue> | TValue;
export type CanonicalSchemaCustomizer<TValue> = (schema: z.ZodType<TValue, TValue>) => z.ZodType<TValue, TValue>;

type CommonReserved = "defaultValue" | "localized" | "name" | "required" | "type" | "virtual";
type NativePayloadExtras<TField, TReserved extends keyof TField = never> = Omit<TField, CommonReserved | TReserved>;

export interface CommonFieldOptions<TValue, TNullable extends boolean, TPayloadExtras> {
  required?: boolean
  nullable?: TNullable
  defaultValue?: MaybeNullable<TValue, TNullable>
  dynamicDefaultValue?: DynamicDefaultValue<MaybeNullable<TValue, TNullable>>
  schema?: CanonicalSchemaCustomizer<TValue>
  payload?: TPayloadExtras
}

export type TextFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
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

export type TextareaFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<TextareaField, "maxLength" | "minLength">
> & Omit<TextFieldOptions<TNullable>, keyof CommonFieldOptions<string, TNullable, unknown> | "payload">;

export type NumberFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
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

export type MoneyFieldOptions<TNullable extends boolean = false> = Omit<
  NumberFieldOptions<TNullable>,
  "integer" | "safe"
> & { currency: string };

export type BooleanFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  boolean,
  TNullable,
  NativePayloadExtras<CheckboxField>
>;

export type DateFieldOptions<TNullable extends boolean = false> = CommonFieldOptions<
  string,
  TNullable,
  NativePayloadExtras<DateField>
> & { minimum?: string, maximum?: string };

export interface SelectFieldOptions<
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

export interface RelationshipFieldOptions<
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

declare const relationshipDefinitionType: unique symbol;

type RelationshipCanonicalValue<
  TRelationTo,
  THasMany extends boolean,
  TIdSchema extends AnyCanonicalSchema
> = TRelationTo extends readonly string[]
  ? THasMany extends true
    ? Array<{ relationTo: TRelationTo[number], value: z.output<TIdSchema> }>
    : { relationTo: TRelationTo[number], value: z.output<TIdSchema> }
  : THasMany extends true
    ? Array<z.output<TIdSchema>>
    : z.output<TIdSchema>;

export type RelationshipFieldDefinition<
  TKind extends "relationship" | "upload",
  TRelationTo extends string | readonly string[],
  THasMany extends boolean,
  TNullable extends boolean,
  TIdSchema extends AnyCanonicalSchema | undefined,
  TPayloadField extends PayloadDataField
> = FieldDefinition<
  TKind,
  z.ZodType<MaybeNullable<RelationshipCanonicalValue<
    TRelationTo,
    THasMany,
    TIdSchema extends AnyCanonicalSchema ? TIdSchema : typeof import("./default-id.js").defaultIdSchema
  >, TNullable>>,
  TPayloadField
> & {
  readonly [relationshipDefinitionType]?: {
    relationTo: TRelationTo
    hasMany: THasMany
    nullable: TNullable
    idSchema: TIdSchema
  }
};

export type BindRelationshipSchemas<
  TFields extends EntityFieldMap,
  TRelationshipIdSchema extends AnyCanonicalSchema
> = {
  readonly [TKey in keyof TFields]: TFields[TKey] extends RelationshipFieldDefinition<
    infer TKind,
    infer TRelationTo,
    infer THasMany,
    infer TNullable,
    infer TIdSchema,
    infer TPayloadField
  >
    ? RelationshipFieldDefinition<
      TKind,
      TRelationTo,
      THasMany,
      TNullable,
      TIdSchema extends AnyCanonicalSchema ? TIdSchema : TRelationshipIdSchema,
      TPayloadField
    >
    : TFields[TKey]
};

export type UploadFieldOptions<
  TRelationTo extends string | readonly string[],
  THasMany extends boolean = false,
  TNullable extends boolean = false,
  TIdSchema extends AnyCanonicalSchema | undefined = undefined
> = Omit<RelationshipFieldOptions<TRelationTo, THasMany, TNullable, TIdSchema>, "payload"> & { payload?: NativePayloadExtras<UploadField, "hasMany" | "relationTo"> };

export interface GroupFieldOptions<TFields extends EntityFieldMap, TNullable extends boolean = false> {
  fields: TFields
  required?: boolean
  nullable?: TNullable
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<NamedGroupField, "fields">
}

export interface ArrayFieldOptions<TFields extends EntityFieldMap, TNullable extends boolean = false> {
  fields: TFields
  required?: boolean
  nullable?: TNullable
  minRows?: number
  maxRows?: number
  defaultValue?: unknown
  dynamicDefaultValue?: DynamicDefaultValue<unknown>
  payload?: NativePayloadExtras<ArrayField, "fields" | "maxRows" | "minRows">
}

export interface RichTextFieldOptions<
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

type RelationshipValueForOptions<
  TRelationTo,
  THasMany extends boolean,
  TIdSchema extends AnyCanonicalSchema | undefined
> = TRelationTo extends readonly string[]
  ? THasMany extends true
    ? Array<{
      relationTo: TRelationTo[number]
      value: TIdSchema extends AnyCanonicalSchema ? z.input<TIdSchema> : string | number
    }>
    : {
      relationTo: TRelationTo[number]
      value: TIdSchema extends AnyCanonicalSchema ? z.input<TIdSchema> : string | number
    }
  : THasMany extends true
    ? Array<TIdSchema extends AnyCanonicalSchema ? z.input<TIdSchema> : string | number>
    : TIdSchema extends AnyCanonicalSchema ? z.input<TIdSchema> : string | number;

export interface NativeFieldOptions<
  TPayloadField extends PayloadDataField,
  TSchema extends AnyCanonicalSchema | undefined = undefined
> {
  payload: Omit<TPayloadField, "defaultValue" | "name">
  schema?: TSchema
  defaultValue?: TSchema extends AnyCanonicalSchema ? z.input<TSchema> : never
  dynamicDefaultValue?: Extract<DefaultValue, (...args: never[]) => unknown>
}

export interface EntityInspectionField {
  kind: string
  payloadType: string
  requiredInPayload: boolean
  nullableInSchema: boolean
  hasSchema: boolean
  relationTo?: readonly string[]
  hasMany?: boolean
  currency?: string
  nested?: EntityInspectionFieldMap
  blockingFieldPath?: string
}

export type EntityInspectionFieldMap = Record<string, EntityInspectionField>;
export interface EntityInspection { name: string, fields: EntityInspectionFieldMap }

export type CanonicalSchemaMap<TFields extends EntityFieldMap> = {
  readonly [TKey in keyof TFields as TFields[TKey]["schema"] extends AnyCanonicalSchema ? TKey : never]:
  Extract<TFields[TKey]["schema"], AnyCanonicalSchema>
};

type SelectedKey<TKeys extends readonly PropertyKey[]> = TKeys[number];
type ArrayItem<TValue> = TValue extends readonly (infer TItem)[] ? TItem : never;
type PickerSchema<
  TSchema extends AnyCanonicalSchema,
  TKey extends PropertyKey,
  TOptional,
  TRequired
> = TKey extends ArrayItem<TRequired>
  ? TSchema
  : TOptional extends "all"
    ? z.ZodOptional<TSchema>
    : TKey extends ArrayItem<TOptional>
      ? z.ZodOptional<TSchema>
      : TSchema;

export type ZodObjectForPickedFields<
  TFields extends EntityFieldMap,
  TKeys extends readonly (keyof CanonicalSchemaMap<TFields>)[],
  TOptional = undefined,
  TRequired = undefined
> = z.ZodObject<{
  [TKey in SelectedKey<TKeys>]: PickerSchema<
    Extract<CanonicalSchemaMap<TFields>[TKey], AnyCanonicalSchema>,
    TKey,
    TOptional,
    TRequired
  >
}>;

export interface SchemaPickOptions<TKey extends PropertyKey, TOptional = readonly TKey[] | "all", TRequired = readonly TKey[]> {
  optional?: TOptional
  required?: TRequired
  strict?: boolean
}

export interface EntitySchemaPicker<TFields extends EntityFieldMap> {
  <
    const TKeys extends readonly (keyof CanonicalSchemaMap<TFields>)[],
    const TOptional extends readonly SelectedKey<TKeys>[] | "all" | undefined = undefined,
    const TRequired extends readonly SelectedKey<TKeys>[] | undefined = undefined
  >(
    keys: TKeys,
    options?: SchemaPickOptions<SelectedKey<TKeys>, TOptional, TRequired>,
  ): ZodObjectForPickedFields<TFields, TKeys, TOptional, TRequired>
}

export interface EntitySchemaContext<TFields extends EntityFieldMap> {
  readonly fields: CanonicalSchemaMap<TFields>
  readonly pick: EntitySchemaPicker<TFields>
  readonly z: typeof import("zod").z
}

export interface EntityPayloadFacade<TFields extends EntityFieldMap> {
  all(): Field[]
  field<TKey extends keyof TFields>(key: TKey): Field
  pick<const TKeys extends readonly (keyof TFields)[]>(keys: TKeys): Field[]
}

export interface EntityDefinition<
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

export interface DefineEntityOptions<
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

export type InferEntityField<TField extends FieldDefinition<string, AnyCanonicalSchema, PayloadDataField>>
  = z.infer<TField["schema"]>;

export type InferEntityFields<TEntity extends EntityDefinition<string, EntityFieldMap, AnyCanonicalSchema>> = {
  [TKey in keyof TEntity["fields"]]: TEntity["fields"][TKey]["schema"] extends AnyCanonicalSchema
    ? z.infer<TEntity["fields"][TKey]["schema"]>
    : never
};
