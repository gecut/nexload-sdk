import { z } from "zod";

import type {
  AnyCanonicalSchema,
  BindRelationshipSchemas,
  CanonicalSchemaMap,
  DefineEntityOptions,
  EntityDefinition,
  EntityFieldMap,
  EntityInspection,
  EntityInspectionFieldMap,
  EntitySchemaContext,
  SchemaPickOptions,
  ZodObjectForPickedFields
} from "../core/types.js";

import { defaultIdSchema } from "../core/default-id.js";
import { isPayloadSchemaError, PayloadSchemaError } from "../core/errors.js";
import { createRelationshipSchema } from "../fields/index.js";
import { errorName, issueSummaries, parseCanonical } from "../internal/canonical-parse.js";
import { dataFieldTypes } from "../internal/data-field-types.js";
import { attachEntityBinding, findEntityEntry } from "../internal/entity-binding.js";
import {
  createFieldDefinition,
  fieldEntries,
  type FieldSeed
} from "../internal/field-definition.js";

const reservedFieldNames = new Set([
  "__v",
  "file",
  "hash",
  "salt"
]);
const commonReserved = [
  "defaultValue",
  "localized",
  "name",
  "required",
  "type",
  "virtual"
] as const;

function reservedKeys (seed: FieldSeed): readonly string[] {
  switch (seed.kind) {
    case "array": return [
      ...commonReserved,
      "fields",
      "maxRows",
      "minRows"
    ];
    case "group": return [
      ...commonReserved,
      "fields"
    ];
    case "money":
    case "number": return [
      ...commonReserved,
      "max",
      "min"
    ];
    case "relationship":
    case "upload": return [
      ...commonReserved,
      "hasMany",
      "relationTo"
    ];
    case "select": return [
      ...commonReserved,
      "hasMany",
      "options"
    ];
    case "slug":
    case "text":
    case "textarea": return [
      ...commonReserved,
      "maxLength",
      "minLength"
    ];
    case "native": return [
      "defaultValue",
      "name"
    ];
    default: return commonReserved;
  }
}

function validatePayloadExtras (
  seed: FieldSeed, entity: string, fieldPath: string
): void {
  for (const key of reservedKeys(seed)) {
    if (Object.hasOwn(
      seed.payloadExtras, key
    )) {
      throw new PayloadSchemaError(
        "RESERVED_PAYLOAD_OPTION", {
          phase: "definition",
          message: `Field "${fieldPath}" cannot configure reserved Payload option "${key}".`,
          data: { entity, fieldPath, fieldKind: seed.kind, option: key, },
        }
      );
    }
  }
}

function bindSeed (
  source: FieldSeed,
  entity: string,
  fieldPath: string,
  relationshipIdSchema: AnyCanonicalSchema
): FieldSeed {
  validatePayloadExtras(
    source, entity, fieldPath
  );
  if (source.kind === "native" && !dataFieldTypes.has(source.payloadType)) {
    throw new PayloadSchemaError(
      "INVALID_PAYLOAD_FIELD", {
        phase: "payload-compilation",
        message: `Field "${fieldPath}" is not a data-affecting Payload field.`,
        data: { entity, fieldPath, fieldKind: source.kind, reason: `unsupported type ${source.payloadType}`, },
      }
    );
  }
  if (source.staticDefaultConfigured && source.dynamicDefaultConfigured) {
    throw new PayloadSchemaError(
      "CONFLICTING_DEFAULT_CONFIGURATION", {
        phase: "definition",
        message: `Field "${fieldPath}" cannot define both "defaultValue" and "dynamicDefaultValue".`,
        data: {
          entity,
          fieldPath,
          fieldType: source.kind,
          configuredDefaults: [
            "defaultValue",
            "dynamicDefaultValue"
          ],
        },
      }
    );
  }
  if (source.dynamicDefaultConfigured && typeof source.dynamicDefault !== "function") {
    throw new PayloadSchemaError(
      "INVALID_FIELD_CONFIGURATION", {
        phase: "definition",
        message: `Field "${fieldPath}" dynamicDefaultValue must be a function.`,
        data: { entity, fieldPath, fieldKind: source.kind, reason: "dynamicDefaultValue is not a function", },
      }
    );
  }

  const children = source.children?.map(([
    name,
    seed
  ]) => [
    name,
    bindSeed(
      seed, entity, `${fieldPath}.${name}`, relationshipIdSchema
    )
  ] as const);
  let schema = source.schema;
  let runtimeSchema = source.runtimeSchema;
  let blockingFieldPath = source.blockingFieldPath;

  if (source.relation) {
    const base = createRelationshipSchema(
      source.relation.relationTo, source.relation.hasMany, source.relation.idSchema ?? relationshipIdSchema
    );
    schema = source.nullable ? base.nullable() : base;
    runtimeSchema = schema;
  }

  if (source.composite && children) {
    const blocking = children.find(([, child]) => !child.schema);
    blockingFieldPath = blocking
      ? blocking[1].blockingFieldPath ?? `${fieldPath}.${blocking[0]}`
      : undefined;
    if (blocking) {
      schema = undefined;
    } else {
      const shape = Object.fromEntries(children.map(([
        name,
        child
      ]) => [
        name,
        child.schema
      ])) as Record<string, AnyCanonicalSchema>;
      const objectSchema = z.strictObject(shape);
      schema = source.composite === "array" ? z.array(objectSchema) : objectSchema;
      if (source.nullable) schema = schema.nullable();
    }
  }

  const payloadCore = { ...source.payloadCore, };

  if (source.staticDefaultConfigured) {
    if (!schema) {
      throw new PayloadSchemaError(
        "INVALID_FIELD_CONFIGURATION", {
          phase: "definition",
          message: `Field "${fieldPath}" cannot define a static default without a canonical schema.`,
          data: { entity, fieldPath, fieldKind: source.kind, reason: "static default requires canonical schema", },
        }
      );
    }
    const result = parseCanonical(
      schema, source.staticDefault, { entity, fieldPath, fieldKind: source.kind, }
    );

    if (!result.success) {
      throw new PayloadSchemaError(
        "INVALID_DEFAULT_VALUE", {
          phase: "definition",
          message: `Field "${fieldPath}" has an invalid defaultValue.`,
          data: { entity, fieldPath, fieldKind: source.kind, issues: issueSummaries(result.error), },
        }
      );
    }
    payloadCore.defaultValue = result.data;
  } else if (source.dynamicDefaultConfigured) {
    payloadCore.defaultValue = source.dynamicDefault;
  }

  return {
    ...source,
    schema,
    runtimeSchema,
    children,
    blockingFieldPath,
    payloadCore,
  };
}

function assertFieldName (
  entity: string, name: string
): void {
  if (!(/^[A-Za-z_][A-Za-z0-9_]*$/u).test(name)) {
    throw new PayloadSchemaError(
      "INVALID_FIELD_NAME", {
        phase: "definition",
        message: `Invalid field name "${name}" in entity "${entity}".`,
        data: { entity, field: name, },
      }
    );
  }
  if (reservedFieldNames.has(name)) {
    throw new PayloadSchemaError(
      "RESERVED_FIELD_NAME", {
        phase: "definition",
        message: `Field name "${name}" is reserved by Payload.`,
        data: { entity, field: name, reservedName: name, },
      }
    );
  }
}

function schemaCapableFields<TFields extends EntityFieldMap> (fields: TFields): CanonicalSchemaMap<TFields> {
  return Object.fromEntries(Object.entries(fields)
    .filter(([, definition]) => definition.schema)
    .map(([
      name,
      definition
    ]) => [
      name,
      definition.schema
    ])) as CanonicalSchemaMap<TFields>;
}

function createInspection (
  name: string, seeds: ReadonlyArray<readonly [string, FieldSeed]>
): EntityInspection {
  const inspectFields = (entries: ReadonlyArray<readonly [string, FieldSeed]>): EntityInspectionFieldMap => Object.fromEntries(entries.map(([
    fieldName,
    seed
  ]) => [
    fieldName,
    {
      kind: seed.kind,
      payloadType: seed.payloadType,
      requiredInPayload: seed.required,
      nullableInSchema: seed.nullable,
      hasSchema: Boolean(seed.schema),
      ...(seed.relationTo ? { relationTo: [...seed.relationTo], } : {}),
      ...(seed.hasMany === undefined ? {} : { hasMany: seed.hasMany, }),
      ...(seed.currency === undefined ? {} : { currency: seed.currency, }),
      ...(seed.children ? { nested: inspectFields(seed.children), } : {}),
      ...(seed.blockingFieldPath ? { blockingFieldPath: seed.blockingFieldPath, } : {}),
    }
  ]));

  return { name, fields: inspectFields(seeds), };
}

export function defineEntity<
  const TName extends string,
  const TFields extends EntityFieldMap,
  TIdSchema extends AnyCanonicalSchema = typeof defaultIdSchema,
  TRelationshipIdSchema extends AnyCanonicalSchema = typeof defaultIdSchema
> (options: DefineEntityOptions<TName, TFields, TIdSchema, TRelationshipIdSchema>):
EntityDefinition<TName, BindRelationshipSchemas<TFields, TRelationshipIdSchema>, TIdSchema> {
  type BoundFields = BindRelationshipSchemas<TFields, TRelationshipIdSchema>;
  if (typeof options.name !== "string" || !options.name.trim()) {
    throw new PayloadSchemaError(
      "INVALID_ENTITY_NAME", {
        phase: "definition",
        message: "Entity name must be a non-empty string.",
        data: { received: typeof options.name === "string" ? options.name : String(options.name), },
      }
    );
  }

  const relationshipIdSchema = options.relationshipIdSchema ?? defaultIdSchema;
  const boundEntries = fieldEntries(options.fields).map(([
    name,
    seed
  ]) => {
    assertFieldName(
      options.name, name
    );

    return [
      name,
      bindSeed(
        seed, options.name, name, relationshipIdSchema
      )
    ] as const;
  });
  const boundFields = Object.freeze(Object.fromEntries(boundEntries.map(([
    name,
    seed
  ]) => [
    name,
    createFieldDefinition(seed)
  ]))) as BoundFields;
  const fieldSchemas = schemaCapableFields(boundFields);
  const getEntry = (key: PropertyKey): readonly [string, FieldSeed] => findEntityEntry(
    options.name, boundEntries, key
  );

  const pick = (<
    const TKeys extends readonly (keyof CanonicalSchemaMap<BoundFields>)[],
    const TOptional extends readonly TKeys[number][] | "all" | "auto" | undefined = undefined,
    const TRequired extends readonly TKeys[number][] | undefined = undefined
  >(
    keys: TKeys,
    pickOptions?: SchemaPickOptions<TKeys[number], TOptional, TRequired>
  ): ZodObjectForPickedFields<BoundFields, TKeys, TOptional, TRequired> => {
    const required = new Set<PropertyKey>(pickOptions?.required ?? []);
    const optional = pickOptions?.optional;
    const shape: Record<string, AnyCanonicalSchema> = {};

    for (const key of keys) {
      const [
        name,
        seed
      ] = getEntry(key);

      if (!seed.schema) {
        throw new PayloadSchemaError(
          "SCHEMA_UNAVAILABLE", {
            phase: "schema-derivation",
            message: `Canonical schema is unavailable for field "${name}".`,
            data: {
              entity: options.name,
              fieldPath: name,
              fieldKind: seed.kind,
              reason: seed.kind === "native" ? "native-without-schema" : "schema-less-descendant",
              blockingFieldPath: seed.blockingFieldPath,
            },
          }
        );
      }
      const makeOptional = !required.has(key)
        && (
          optional === "all"
          || (optional === "auto" && !seed.required)
          || (Array.isArray(optional) && optional.includes(key))
        );
      shape[name] = makeOptional ? seed.schema.optional() : seed.schema;
    }

    return (pickOptions?.strict === false ? z.object(shape) : z.strictObject(shape)) as ZodObjectForPickedFields<BoundFields, TKeys, TOptional, TRequired>;
  }) as EntitySchemaContext<BoundFields>["pick"];

  const context = Object.freeze({ fields: fieldSchemas, pick, z, }) as EntitySchemaContext<BoundFields>;
  const entity: EntityDefinition<TName, BoundFields, TIdSchema> = {
    name: options.name,
    idSchema: (options.idSchema ?? defaultIdSchema) as TIdSchema,
    fields: boundFields,
    schema<TSchema extends AnyCanonicalSchema>(factory: (value: EntitySchemaContext<BoundFields>) => TSchema): TSchema {
      try {
        const result = factory(context);

        if (!result || typeof result !== "object" || typeof result.safeParse !== "function") {
          throw new PayloadSchemaError(
            "INVALID_SCHEMA_FACTORY_RESULT", {
              phase: "schema-derivation",
              message: `Schema factory for entity "${options.name}" did not return a Zod schema.`,
              data: { entity: options.name, receivedType: result === null ? "null" : typeof result, },
            }
          );
        }

        return result;
      } catch (error) {
        if (isPayloadSchemaError(error)) throw error;
        throw new PayloadSchemaError(
          "SCHEMA_DERIVATION_FAILED", {
            phase: "schema-derivation",
            message: `Failed to derive a schema for entity "${options.name}".`,
            data: { entity: options.name, causeName: errorName(error), },
            cause: error,
          }
        );
      }
    },
    inspect: (): EntityInspection => createInspection(
      options.name, boundEntries
    ),
  };

  attachEntityBinding(
    entity, { name: options.name, entries: boundEntries, }
  );

  return Object.freeze(entity);
}
