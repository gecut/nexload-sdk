import type { FieldHook } from "payload";

import { ValidationError } from "payload";

import type { FieldSeed } from "../internal/field-definition.js";

import { parseCanonical } from "../internal/canonical-parse.js";
import { cloneConfig } from "../internal/clone.js";

function validationPath (
  basePath: Array<number | string>, issuePath: PropertyKey[]
): string {
  return [
    ...basePath,
    ...issuePath
  ].map(String).join(".");
}

export function canonicalHook (
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

export function appendCanonicalHook (
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
