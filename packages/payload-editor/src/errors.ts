export type PayloadEditorConfigErrorCode
  = | "PAYLOAD_EDITOR_DEFINITION_REQUIRED"
    | "PAYLOAD_EDITOR_UNKNOWN_PRESET"
    | "PAYLOAD_EDITOR_UNKNOWN_FEATURE"
    | "PAYLOAD_EDITOR_INVALID_FEATURE_OPTIONS"
    | "PAYLOAD_EDITOR_INVALID_HEADING_SIZES"
    | "PAYLOAD_EDITOR_INVALID_COLLECTIONS"
    | "PAYLOAD_EDITOR_INVALID_MAX_DEPTH"
    | "PAYLOAD_EDITOR_INVALID_EXTENSION"
    | "PAYLOAD_EDITOR_DUPLICATE_FEATURE";

export class PayloadEditorConfigError extends TypeError {
  readonly code: PayloadEditorConfigErrorCode;

  readonly path: string;

  readonly hint?: string;

  constructor (
    code: PayloadEditorConfigErrorCode,
    path: string,
    message: string,
    hint?: string
  ) {
    super(message);
    this.name = "PayloadEditorConfigError";
    this.code = code;
    this.path = path;
    this.hint = hint;
  }
}
