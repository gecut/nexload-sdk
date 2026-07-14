# Redaction and error policy

## Safe defaults

`toHealthJson` defaults to:

- `includeDetails: false`;
- `redact: true`;
- secret-key redaction enabled;
- URL query/hash removal;
- error message and cause suppression;
- stack suppression.

Public errors become `Health check failed.`. Details require `includeDetails: true`. Error and cause text require `redaction.includeErrorMessage: true`; stack requires `redaction.includeStack: true` independently.

Manager-level `redaction` and run-level `includeDiagnostics` are deprecated no-ops. Configure the serializer at the serving boundary.

## What sanitization covers

Secret-looking keys and URLs are sanitized recursively in details/resources. `allowedDetailKeys` is also applied recursively at every object level, so a shallow allowlist can unexpectedly remove nested fields; test the exact JSON.

`redact: false` disables detail/resource sanitization but does not itself reveal error messages or stack. Avoid it unless a private consumer requires the raw structure and the data producer is already safe.

## What it does not cover

Serializer sanitization does not cover check metrics, report metrics, metric labels, service/environment/runtime identity, or report links. Never put tokens, passwords, cookies, authorization values, API keys, connection strings, raw URLs, request/user/session IDs, stack traces, or exception messages there.

## Private diagnostics

Opt in to the minimum fields. Prefer stable error codes and curated details over cause text. If cause or stack is essential, require application authentication and a private network path, document retention/logging implications, and add regression tests proving public routes remain suppressed.
