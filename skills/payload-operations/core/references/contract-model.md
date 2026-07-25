# Contract model

Define each leaf with `operation({ input, output, errors? })`, then pass the direct nested object to `defineCMSOperations`. Path segments start with a letter and may contain letters, digits, `_`, or `-`; promise-like, JSON, constructor, and prototype-sensitive names are rejected.

Keep four boundaries explicit:

- caller supplies `z.input<InputSchema>`;
- handler receives `z.output<InputSchema>`;
- handler returns `z.input<OutputSchema>`;
- caller receives `z.output<OutputSchema>`.

Transforms therefore belong to parsing boundaries, not manual casts. Use async parsing because refinements and transforms may be async. `z.void()` represents a successful operation with no value and maps to an empty 204 response.

Do not clone or freeze Zod schemas. The package preserves schema identity while freezing its own operation and tree wrappers.
