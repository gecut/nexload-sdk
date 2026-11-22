# Contract model

Define each leaf with `operation({ input, output, errors? })`, then pass the direct nested object to `defineCMSOperations`. Path segments start with a letter and may contain letters, digits, `_`, or `-`; promise-like, JSON, constructor, and prototype-sensitive names are rejected.

## Codec wire model

The data flow uses bidirectional Zod codecs on the wire:

- **Caller input:** caller supplies `z.input<InputSchema>` (must be JSON-serializable). The client pre-validates with `safeParseAsync` (rejecting invalid input with 422 `INPUT_VALIDATION_FAILED`), then transmits the original input value.
- **Handler input:** server parses input with `safeParseAsync` → handler receives `z.output<InputSchema>`. Defaults and transforms run once, on the server.
- **Handler return:** handler returns `z.output<OutputSchema>`.
- **Wire encoding:** server encodes the handler return value with `z.encodeAsync(output, result)`. Unrecognized keys on `z.object` schemas are automatically dropped, preventing internal or sensitive properties from leaking.
- **Client decoded result:** client decodes the JSON response with `z.decodeAsync(output, json)` → caller receives `z.output<OutputSchema>`.
- **Defined error data:** handler factory receives `z.output<DataSchema>`, server encodes with `z.encodeAsync(data, value)`, and client decodes with `z.decodeAsync(data, json)`.

## Codec safety rule

Because responses are encoded via `z.encodeAsync`, output schemas and defined-error `data` schemas must be **codec-safe**:
- Plain schemas (`z.string()`, `z.number()`, `z.boolean()`, `z.object()`, `z.array()`)
- Checks and overwrites (`z.string().trim()`, `z.string().toLowerCase()`)
- Symmetrical codecs via `z.codec(wireSchema, targetSchema, { decode, encode })`

Unidirectional `.transform()` calls in output or error-data schemas cannot be encoded by `z.encodeAsync` and cause the server to return 500 `INTERNAL_SERVER_ERROR`.

## Date handling with `z.codec`

To pass JavaScript `Date` instances between server handlers and client callers:

```ts
import { operation } from "@nexload-sdk/payload-operations";
import { z } from "zod";

export const dateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (dateObj) => dateObj.toISOString(),
});

export const getOrder = operation({
  input: z.object({ orderId: z.string() }),
  output: z.object({
    orderId: z.string(),
    createdAt: dateCodec, // Handler returns Date; wire sends ISO string; client receives Date
  }),
});
```

`z.void()` represents a successful operation with no value and maps to an empty 204 response.

Do not clone or freeze Zod schemas. The package preserves schema identity while freezing its own operation and tree wrappers.
