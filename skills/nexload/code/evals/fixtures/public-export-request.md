# Public export request

`packages/example/src/internal/normalize-name.ts` is used by one package implementation. A new consumer asks to import it from `@nexload-sdk/example/normalize-name` so another application can apply similar formatting.

The request would require a new package export, declaration entrypoint, documentation, and compatibility commitment. The normalization policy is not yet confirmed to be shared or stable.
