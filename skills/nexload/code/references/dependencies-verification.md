# Dependencies and verification

## Native and existing capability first

Before adding a dependency, check in order:

1. Does the platform or host framework already solve the requirement correctly?
2. Does the owning package already depend on a suitable capability?
3. Is a small local implementation clearer and safer than ecosystem ownership?
4. If a dependency is justified, which package actually owns its runtime use?

Do not add a package for trivial formatting, collection, parsing, or control-flow work. Do not create a Nexload wrapper that merely renames an upstream API. An abstraction is justified when it adds policy, normalization, type safety, integration, lifecycle, or a runtime boundary.

## Constants and comments

- Name literals that encode domain policy, protocol values, compatibility limits, or repeated meaning.
- Keep obvious one-use literals local; extracting every literal creates indirection without meaning.
- Comments explain rationale, constraints, compatibility, or non-obvious tradeoffs.
- Improve unclear naming or structure instead of narrating it with comments.
- Remove dead commented-out code; version control already preserves history.

## Verification ladder

Choose the narrowest decisive evidence first:

1. focused runtime or type test for the changed behavior;
2. target package lint/build/test scripts that exist in its manifest;
3. artifact or consumer smoke when declarations, exports, bundling, or runtime loading can change;
4. workspace checks when shared tooling or multiple packages are affected.

Inspect the command result, not only its exit status when warnings or skipped cases matter. Do not say a check passed if it was not run, was cached without relevant inputs, or covered a different runtime/version.

## Handoff evidence

Record:

- exact commands and their outcomes;
- the behavior each check proves;
- skipped or unavailable lanes;
- unrelated pre-existing failures;
- residual uncertainty requiring consumer, runtime, or human validation.
