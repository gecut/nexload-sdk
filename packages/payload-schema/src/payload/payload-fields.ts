import type { Field } from "payload";

import type { FieldSeed } from "../internal/field-definition.js";
import type {
  AnyCanonicalSchema,
  EntityDefinition,
  EntityFieldMap,
  EntityPayloadFacade
} from "../types.js";

import { PayloadSchemaError } from "../errors.js";
import { getEntityBinding } from "../internal/entity-binding.js";
import { compileField } from "./compile-field.js";

/**
 * Compiles an entity created by `defineEntity()` into Payload field configs.
 * Node / Payload config only: the compiled fields carry hooks that throw Payload's `ValidationError`.
 */
export function payloadFields<TFields extends EntityFieldMap> (
  entity: EntityDefinition<string, TFields, AnyCanonicalSchema>
): EntityPayloadFacade<TFields> {
  const { entries, name: entityName, } = getEntityBinding(entity);
  const availableFields = entries.map(([name]) => name);

  const getEntry = (key: PropertyKey): readonly [string, FieldSeed] => {
    const entry = entries.find(([name]) => name === key);

    if (!entry) {
      throw new PayloadSchemaError(
        "UNKNOWN_FIELD", {
          phase: "schema-derivation",
          message: `Unknown field "${String(key)}" in entity "${entityName}".`,
          data: { entity: entityName, field: String(key), availableFields, },
        }
      );
    }

    return entry;
  };

  return Object.freeze({
    all: (): Field[] => entries.map(([
      name,
      seed
    ]) => compileField(
      seed, name, entityName, name, "all"
    )),
    field: (key: keyof TFields): Field => {
      const [
        name,
        seed
      ] = getEntry(key);

      return compileField(
        seed, name, entityName, name, "field"
      );
    },
    pick: (keys: readonly (keyof TFields)[]): Field[] => keys.map((key) => {
      const [
        name,
        seed
      ] = getEntry(key);

      return compileField(
        seed, name, entityName, name, "pick"
      );
    }),
  });
}
