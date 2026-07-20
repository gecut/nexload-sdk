export type SafeIssueSummary = {
  code: string
  path: Array<number | string>
  message: string
};

export interface PayloadSchemaErrorDataMap {
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

export type PayloadSchemaErrorCode = keyof PayloadSchemaErrorDataMap;

export type PayloadSchemaErrorPhase = "definition" | "internal" | "payload-compilation" | "schema-derivation";

export type SerializedPayloadSchemaError<TCode extends PayloadSchemaErrorCode = PayloadSchemaErrorCode> = {
  name: "PayloadSchemaError"
  code: TCode
  phase: PayloadSchemaErrorPhase
  message: string
  data: PayloadSchemaErrorDataMap[TCode]
};

export class PayloadSchemaError<TCode extends PayloadSchemaErrorCode> extends Error {
  readonly code: TCode;

  readonly phase: PayloadSchemaErrorPhase;

  readonly data: PayloadSchemaErrorDataMap[TCode];

  override readonly cause?: unknown;

  constructor (
    code: TCode, options: {
      phase: PayloadSchemaErrorPhase
      message: string
      data: PayloadSchemaErrorDataMap[TCode]
      cause?: unknown
    }
  ) {
    super(
      options.message, options.cause === undefined ? undefined : { cause: options.cause, }
    );
    this.name = "PayloadSchemaError";
    this.code = code;
    this.phase = options.phase;
    this.data = options.data;
    this.cause = options.cause;
  }

  toJSON (): SerializedPayloadSchemaError<TCode> {
    return {
      name: "PayloadSchemaError",
      code: this.code,
      phase: this.phase,
      message: this.message,
      data: this.data,
    };
  }
}

export function isPayloadSchemaError (error: unknown): error is PayloadSchemaError<PayloadSchemaErrorCode>;
export function isPayloadSchemaError<TCode extends PayloadSchemaErrorCode> (
  error: unknown,
  code: TCode
): error is PayloadSchemaError<TCode>;
export function isPayloadSchemaError (
  error: unknown,
  code?: PayloadSchemaErrorCode
): error is PayloadSchemaError<PayloadSchemaErrorCode> {
  return error instanceof PayloadSchemaError && (code === undefined || error.code === code);
}
