# Error model

Declared errors live on an operation:

```ts
errors: {
  EMAIL_TAKEN: {
    data: z.object({ email: z.email() }),
    message: "Email is already registered.",
    status: 409,
  },
}
```

Codes use uppercase snake case, statuses are integers from 400 through 599, and messages are non-empty. A handler throws the generated `errors.EMAIL_TAKEN({ data })`; data is required only when its definition has a schema.

`safe(operationPromise)` returns one of:

- `[null, data, false]`;
- `[definedError, undefined, true]`;
- `[unknownError, undefined, false]`.

The operation promise carries the declared-error union for type extraction. `isDefinedError(error, code?)` narrows a compatible union. Do not turn native Payload SDK errors into `CMSOperationError`, and do not treat arbitrary error-shaped JSON as declared.
