import { ValidationError } from "payload";
import { z } from "zod";

import { defaultIdSchema } from "../default-id.js";
import { PayloadSchemaError, isPayloadSchemaError, type SafeIssueSummary } from "../errors.js";
import { createRelationshipSchema } from "../fields/index.js";
import { cloneConfig } from "../internal/clone.js";
import {
  createFieldDefinition,
  fieldEntries,
  type FieldSeed
} from "../internal/field-definition.js";

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
  PayloadDataField,
  ZodObjectForPickedFields
} from "../types.js";
import type { Field, FieldHook } from "payload";

const reservedFieldNames = new Set([
  "__v",
  "file",
  "hash",
  "salt"
]);
const dataFieldTypes = new Set([
  "array",
  "blocks",
  "checkbox",
  "code",
  "date",
  "email",
  "group",
  "join",
  "json",
  "number",
  "point",
  "radio",
  "relationship",
  "richText",
  "select",
  "text",
  "textarea",
  "upload"
]);
const commonReserved = [
  "defaultValue",
  "localized",
  "name",
  "required",
  "type",
  "virtual"
] as const;

function errorName (error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}

function isAsyncParseError (error: unknown): boolean {
  return error instanceof Error
    && (error.constructor.name === "$ZodAsyncError" || error.message.includes("Encountered Promise during synchronous parse"));
}

function issueSummaries (error: z.ZodError): SafeIssueSummary[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path.map((part) => (typeof part === "symbol" ? part.description ?? part.toString() : part)),
    message: issue.message,
  }));
}

function parseCanonical (
  schema: AnyCanonicalSchema,
  value: unknown,
  context: { entity?: string, fieldPath: string, fieldKind: string }
): ReturnType<AnyCanonicalSchema["safeParse"]> {
  try {
    return schema.safeParse(value);
  } catch (error) {
    if (isAsyncParseError(error)) {
      throw new PayloadSchemaError(
        "ASYNC_CANONICAL_SCHEMA_UNSUPPORTED", {
          phase: "definition",
          message: `Canonical schema for field "${context.fieldPath}" must be synchronous.`,
          data: context,
          cause: error,
        }
      );
    }
    throw error;
  }
}

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

function validationPath (
  basePath: Array<number | string>, issuePath: PropertyKey[]
): string {
  return [
    ...basePath,
    ...issuePath
  ].map(String).join(".");
}

function canonicalHook (
  seed: FieldSeed, entity: string, fieldPath: string
): FieldHook {
  return ({ path, req, value, }) => {
    if (value === undefined || !seed.runtimeSchema) return value;
    const result = parseCanonical(
      seed.runtimeSchema, value, { entity, fieldPath, fieldKind: seed.kind, }
    );
    if (result.success) return result.data;
    const basePath = Array.isArray(path) && path.length ? path : fieldPath.split(".");
    throw new ValidationError({
      req,
      errors: result.error.issues.map((issue) => ({
        path: validationPath(
          basePath, issue.path
        ),
        message: issue.message,
      })),
    });
  };
}

function appendCanonicalHook (
  value: unknown, hook: FieldHook
): Record<string, unknown> {
  const hooks = value && typeof value === "object"
    ? cloneConfig(value as Record<string, unknown>)
    : {};
  const descriptor = Object.getOwnPropertyDescriptor(
    hooks, "beforeValidate"
  );
  if (descriptor && !("value" in descriptor)) {
    Object.defineProperty(
      hooks, "beforeValidate", {
        ...descriptor,
        get: descriptor.get
          ? function (this: unknown) {
            const consumerHooks = descriptor.get?.call(this);
            return [
              ...(Array.isArray(consumerHooks) ? consumerHooks : []),
              hook
            ];
          }
          : () => [hook],
      }
    );
    return hooks;
  }
  const consumerHooks = descriptor && "value" in descriptor && Array.isArray(descriptor.value)
    ? descriptor.value
    : [];
  Object.defineProperty(
    hooks, "beforeValidate", {
      configurable: true,
      enumerable: true,
      value: [
        ...consumerHooks,
        hook
      ],
      writable: true,
    }
  );
  return hooks;
}

function compileField (
  seed: FieldSeed,
  name: string,
  entity: string,
  fieldPath: string,
  operation: "all" | "field" | "pick"
): PayloadDataField {
  try {
    const extras = cloneConfig(seed.payloadExtras);
    const core = cloneConfig(seed.payloadCore);
    const compiled = Object.create(Object.prototype) as Record<string, unknown>;
    const extraDescriptors = Object.getOwnPropertyDescriptors(extras);
    const hooksDescriptor = extraDescriptors.hooks;
    delete extraDescriptors.hooks;
    Object.defineProperties(
      compiled, extraDescriptors
    );
    Object.defineProperties(
      compiled, Object.getOwnPropertyDescriptors(core)
    );
    Object.defineProperties(
      compiled, {
        name: { configurable: true, enumerable: true, value: name, writable: true, },
        type: { configurable: true, enumerable: true, value: seed.payloadType, writable: true, },
      }
    );
    if (seed.children) {
      compiled.fields = seed.children.map(([
        childName,
        child
      ]) => compileField(
        child, childName, entity, `${fieldPath}.${childName}`, operation
      ));
    }
    if (seed.runtimeSchema) {
      const hook = canonicalHook(
        seed, entity, fieldPath
      );
      if (hooksDescriptor && !("value" in hooksDescriptor)) {
        Object.defineProperty(
          compiled, "hooks", {
            ...hooksDescriptor,
            get: hooksDescriptor.get
              ? function (this: unknown) {
                return appendCanonicalHook(
                  hooksDescriptor.get?.call(this), hook
                );
              }
              : () => appendCanonicalHook(
                undefined, hook
              ),
          }
        );
      } else {
        Object.defineProperty(
          compiled, "hooks", {
            configurable: true,
            enumerable: true,
            value: appendCanonicalHook(
              hooksDescriptor && "value" in hooksDescriptor ? hooksDescriptor.value : undefined, hook
            ),
            writable: true,
          }
        );
      }
    } else if (hooksDescriptor) {
      Object.defineProperty(
        compiled, "hooks", hooksDescriptor
      );
    }
    if (!dataFieldTypes.has(seed.payloadType)) {
      throw new PayloadSchemaError(
        "INVALID_PAYLOAD_FIELD", {
          phase: "payload-compilation",
          message: `Field "${fieldPath}" does not compile to a data-affecting Payload field.`,
          data: { entity, fieldPath, fieldKind: seed.kind, reason: `unsupported type ${seed.payloadType}`, },
        }
      );
    }
    return compiled as unknown as PayloadDataField;
  } catch (error) {
    if (isPayloadSchemaError(error)) throw error;
    throw new PayloadSchemaError(
      "PAYLOAD_COMPILATION_FAILED", {
        phase: "payload-compilation",
        message: `Failed to compile Payload field "${fieldPath}".`,
        data: {
          entity, fieldPath, fieldKind: seed.kind, operation, causeName: errorName(error),
        },
        cause: error,
      }
    );
  }
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
  const availableFields = Object.keys(boundFields);

  const getEntry = (key: PropertyKey): readonly [string, FieldSeed] => {
    const entry = boundEntries.find(([name]) => name === key);
    if (!entry) {
      throw new PayloadSchemaError(
        "UNKNOWN_FIELD", {
          phase: "schema-derivation",
          message: `Unknown field "${String(key)}" in entity "${options.name}".`,
          data: { entity: options.name, field: String(key), availableFields, },
        }
      );
    }
    return entry;
  };

  const payload = Object.freeze({
    all: (): Field[] => boundEntries.map(([
      name,
      seed
    ]) => compileField(
      seed, name, options.name, name, "all"
    )),
    field: (key: keyof BoundFields): Field => {
      const [
        name,
        seed
      ] = getEntry(key);
      return compileField(
        seed, name, options.name, name, "field"
      );
    },
    pick: (keys: readonly (keyof BoundFields)[]): Field[] => keys.map((key) => {
      const [
        name,
        seed
      ] = getEntry(key);
      return compileField(
        seed, name, options.name, name, "pick"
      );
    }),
  });

  const pick = (<
    const TKeys extends readonly (keyof CanonicalSchemaMap<BoundFields>)[]
  >(keys: TKeys, pickOptions?: {
    optional?: readonly TKeys[number][] | "all"
    required?: readonly TKeys[number][]
    strict?: boolean
  }): ZodObjectForPickedFields<BoundFields, TKeys> => {
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
        && (optional === "all" || (Array.isArray(optional) && optional.includes(key)));
      shape[name] = makeOptional ? seed.schema.optional() : seed.schema;
    }
    return (pickOptions?.strict === false ? z.object(shape) : z.strictObject(shape)) as ZodObjectForPickedFields<BoundFields, TKeys>;
  }) as EntitySchemaContext<BoundFields>["pick"];

  const context = Object.freeze({ fields: fieldSchemas, pick, z, }) as EntitySchemaContext<BoundFields>;
  const entity: EntityDefinition<TName, BoundFields, TIdSchema> = Object.freeze({
    name: options.name,
    idSchema: (options.idSchema ?? defaultIdSchema) as TIdSchema,
    fields: boundFields,
    payload,
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
  });
  return entity;
}
