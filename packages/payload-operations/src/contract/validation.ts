import type {
  CMSOperationErrorDefinition,
  CMSOperationErrorDefinitions
} from "./types.js";

const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const SEGMENT_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

const RESERVED_SEGMENTS = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "then",
  "catch",
  "finally",
  "toJSON"
]);

export function isRecord (value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertSafeSegment (segment: string): void {
  if (
    RESERVED_SEGMENTS.has(segment)
    || !SEGMENT_PATTERN.test(segment)
  ) {
    throw new TypeError(`Invalid operation path segment: ${segment}`);
  }
}

export function assertErrorDefinitions (definitions: CMSOperationErrorDefinitions): void {
  if (!isRecord(definitions)) {
    throw new TypeError("Operation errors must be an object.");
  }

  for (const [
    code,
    definition
  ] of Object.entries(definitions)) {
    if (
      RESERVED_SEGMENTS.has(code)
      || !ERROR_CODE_PATTERN.test(code)
    ) {
      throw new TypeError(`Invalid operation error code: ${code}`);
    }

    assertErrorDefinition(
      code, definition
    );
    Object.freeze(definition);
  }

  Object.freeze(definitions);
}

function assertErrorDefinition (
  code: string,
  definition: CMSOperationErrorDefinition
): void {
  if (!isRecord(definition)) {
    throw new TypeError(`Error definition ${code} must be an object.`);
  }

  if (
    !Number.isInteger(definition.status)
    || definition.status < 400
    || definition.status > 599
  ) {
    throw new TypeError(`Error definition ${code} has an invalid status.`);
  }

  if (
    typeof definition.message !== "string"
    || definition.message.trim().length === 0
  ) {
    throw new TypeError(`Error definition ${code} must have a message.`);
  }

  if (
    definition.data !== undefined
    && (
      !isRecord(definition.data)
      || typeof definition.data.safeParseAsync !== "function"
    )
  ) {
    throw new TypeError(`Error definition ${code} data must be a Zod schema.`);
  }
}
