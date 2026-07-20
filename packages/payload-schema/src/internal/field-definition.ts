import type {
  AnyCanonicalSchema, AnyFieldDefinition, EntityFieldMap, FieldDefinition, PayloadDataField
} from "../types.js";
import type { z } from "zod";

export const fieldSeedSymbol: unique symbol = Symbol("payload-schema.field-seed");

export type FieldSeed = {
  kind: string
  payloadType: string
  schema?: AnyCanonicalSchema
  runtimeSchema?: AnyCanonicalSchema
  payloadCore: Record<string, unknown>
  payloadExtras: Record<string, unknown>
  required: boolean
  nullable: boolean
  relationTo?: readonly string[]
  hasMany?: boolean
  currency?: string
  children?: ReadonlyArray<readonly [string, FieldSeed]>
  blockingFieldPath?: string
  relation?: {
    relationTo: string | readonly string[]
    hasMany: boolean
    idSchema?: AnyCanonicalSchema
  }
  composite?: "array" | "group"
  staticDefaultConfigured?: boolean
  staticDefault?: unknown
  dynamicDefaultConfigured?: boolean
  dynamicDefault?: unknown
};

type InternalFieldDefinition = AnyFieldDefinition & { readonly [fieldSeedSymbol]: FieldSeed };

export function createFieldDefinition<
  TKind extends string,
  TSchema extends AnyCanonicalSchema | undefined,
  TPayloadField extends PayloadDataField
> (seed: FieldSeed): FieldDefinition<TKind, TSchema, TPayloadField> {
  const definition = { kind: seed.kind, schema: seed.schema, } as Record<PropertyKey, unknown>;
  Object.defineProperty(
    definition, fieldSeedSymbol, { value: seed, enumerable: false, }
  );
  return Object.freeze(definition) as unknown as FieldDefinition<TKind, TSchema, TPayloadField>;
}

export function getFieldSeed (field: AnyFieldDefinition): FieldSeed {
  const seed = (field as InternalFieldDefinition)[fieldSeedSymbol];
  if (!seed) throw new TypeError("Value is not a payload-schema field definition.");
  return seed;
}

export function fieldEntries (fields: EntityFieldMap): ReadonlyArray<readonly [string, FieldSeed]> {
  return Object.entries(fields).map(([
    name,
    definition
  ]) => [
    name,
    getFieldSeed(definition)
  ] as const);
}

export type CanonicalShape<TFields extends EntityFieldMap> = {
  [TKey in keyof TFields]: Extract<TFields[TKey]["schema"], z.ZodType>
};
