# Server error boundary

Read an empty body as `undefined`. Require `application/json` for non-empty bodies, reject malformed JSON, then parse input asynchronously. Sanitized input issues may be returned in the framework validation envelope.

Handlers throw operation-specific errors through the generated factory:

```ts
throw errors.ORDER_NOT_FOUND({
  data: { orderId: input.orderId },
});
```

Before serialization, verify the error belongs to the current operation and validate its data schema. Validate handler output with the output schema while preserving the documented handler-input versus wire-output boundary in the installed version.

Unknown exceptions, undeclared framework errors, Payload errors, invalid output, mismatched declared errors, and causes become a generic 500 response. Never serialize a stack, cause, raw Zod output issue, database detail, or Payload error object.
