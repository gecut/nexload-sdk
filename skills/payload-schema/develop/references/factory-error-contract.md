# Factory and error contract

## Canonical order

Text executes type, trim, case, length, pattern, then same-type customizer. Slug executes NFKC, trim, lowercase, whitespace/underscore conversion, dash collapse, and edge trimming. Number is finite; money is always a safe integer. Date requires an explicit timezone, compares instants, and normalizes UTC.

Schema customizers preserve input/output type, run last, and must not hide thrown or async behavior.

Relationship/upload support:

```text
mono one  -> ID
mono many -> ID[]
poly one  -> { relationTo, value: ID }
poly many -> Array<{ relationTo, value: ID }>
```

Populated documents are never canonical relationship values. Group/array consumer schemas are strict and require every data descendant to have a schema.

## Default precedence

Definition checks run in this order:

1. reject simultaneous static and dynamic defaults;
2. require a canonical schema for a static default;
3. parse the static default;
4. retain a dynamic default as an opaque native function.

`payload.defaultValue` is always reserved. Neither mode adds Zod `.default()`.

## Error boundary

`PayloadSchemaErrorCode` remains exactly `keyof PayloadSchemaErrorDataMap`. Configuration/definition/compiler/schema-derivation failures use structured package errors. Runtime canonical value failures through Payload use Payload `ValidationError`.

Serialized package error data may contain bounded identifiers, constraint values, issue code/path/message summaries, operation, and cause name. It must not contain:

- rejected input or default value;
- schema or full field/config objects;
- function source;
- secrets;
- stack;
- serialized cause.

The instance may retain a native `cause` for debugging, but `toJSON()` excludes cause and stack.

## High-risk regression cases

- `CONFLICTING_DEFAULT_CONFIGURATION` precedes schema availability/default parsing.
- schema-less static default is `INVALID_FIELD_CONFIGURATION`.
- `SCHEMA_UNAVAILABLE` preserves first blocking descendant path.
- async encounter becomes `ASYNC_CANONICAL_SCHEMA_UNSUPPORTED`, phase `definition`.
- native layout fields fail; native data fields compile; native `validate` remains unchanged.
- Zod issue paths become Payload dot paths and carry the original `req`.
