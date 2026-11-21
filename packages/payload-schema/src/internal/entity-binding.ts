import type { FieldSeed } from "./field-definition.js";

import { PayloadSchemaError } from "../errors.js";

export const entityBindingSymbol: unique symbol = Symbol("payload-schema.entity-binding");

export type EntityBinding = {
  readonly name: string
  readonly entries: ReadonlyArray<readonly [string, FieldSeed]>
};

export function attachEntityBinding (
  target: object, binding: EntityBinding
): void {
  Object.defineProperty(
    target, entityBindingSymbol, {
      configurable: false,
      enumerable: false,
      value: Object.freeze({
        name: binding.name,
        entries: Object.freeze(binding.entries.map(([
          name,
          seed
        ]) => Object.freeze([
          name,
          seed
        ] as const))),
      }),
      writable: false,
    }
  );
}

function receivedTypeOf (value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  return typeof value;
}

export function getEntityBinding (value: unknown): EntityBinding {
  const binding = ((typeof value === "object" && value !== null) || typeof value === "function")
    && Object.hasOwn(value, entityBindingSymbol)
    ? (value as { [entityBindingSymbol]?: unknown })[entityBindingSymbol]
    : undefined;

  if (!binding || typeof binding !== "object") {
    throw new PayloadSchemaError(
      "INVALID_ENTITY", {
        phase: "payload-compilation",
        message: "Expected an entity created by defineEntity().",
        data: { receivedType: receivedTypeOf(value), },
      }
    );
  }

  return binding as EntityBinding;
}

export function findEntityEntry (
  entityName: string,
  entries: ReadonlyArray<readonly [string, FieldSeed]>,
  key: PropertyKey
): readonly [string, FieldSeed] {
  const entry = entries.find(([name]) => name === key);

  if (!entry) {
    throw new PayloadSchemaError(
      "UNKNOWN_FIELD", {
        phase: "schema-derivation",
        message: `Unknown field "${String(key)}" in entity "${entityName}".`,
        data: { entity: entityName, field: String(key), availableFields: entries.map(([name]) => name), },
      }
    );
  }

  return entry;
}
