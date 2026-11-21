import type { FieldSeed } from "../internal/field-definition.js";
import type { PayloadDataField } from "../types.js";

import { isPayloadSchemaError, PayloadSchemaError } from "../errors.js";
import { errorName } from "../internal/canonical-parse.js";
import { cloneConfig } from "../internal/clone.js";
import { dataFieldTypes } from "../internal/data-field-types.js";
import { appendCanonicalHook, canonicalHook } from "./canonical-hook.js";

export function compileField (
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
