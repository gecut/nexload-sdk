# Type and trust boundaries

## Repository baseline

Nexload's shared TypeScript config enables `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, and declaration output. Model code so those checks expose uncertainty rather than suppressing it.

## Boundary workflow

1. Identify where a value crosses from an untrusted or weakly typed source: HTTP, JSON, environment, storage, process output, third-party callbacks, or JavaScript interop.
2. Receive it as `unknown` when the upstream type cannot be trusted.
3. Validate or narrow the runtime shape before business logic uses it.
4. Preserve the established type through transformations instead of reasserting it repeatedly.

Match the protocol's exact container kind. If an interop contract permits a plain object wrapper, reject arrays and unexpected prototypes rather than treating every non-null object as an equivalent record.

Compile-time assertions do not validate runtime data. `value as Config` after `JSON.parse` is not a parser.

## Canonical types

- Derive types from the authoritative schema, factory, constant, or public contract where practical.
- Avoid manually synchronized DTO, union, and schema copies.
- Keep public/shared types explicit; inference is appropriate for local obvious values.
- Use `import type` where the import is erased and no runtime side effect is required.
- Handle indexed access as possibly missing unless control flow proves otherwise.

## Assertions and `any`

An assertion is acceptable only when all are true:

- the mismatch is at an unavoidable typed interoperability seam;
- runtime facts or an upstream contract establish the asserted shape;
- the assertion is narrow and contained in one adapter;
- callers receive a safe type and do not repeat the escape hatch.

Use a locally documented `any` only when an external type system genuinely requires it and `unknown` cannot express the operation. Never widen a public API to `any` for convenience.

Reject assertions that hide an incomplete union, bypass a failed generic design, silence nullability, or replace trust-boundary validation.

## Review questions

- What runtime fact makes this type true?
- Could the type derive from the existing source of truth?
- Does narrowing happen once at the boundary?
- Does the exception stay inside the adapter?
- Are malformed, missing, array-shaped, or unexpectedly nested values observable and handled according to the exact boundary contract?
