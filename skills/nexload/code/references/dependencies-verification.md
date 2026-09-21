# Dependencies and verification

## Native and existing capability first

Before adding a dependency, check in order:

1. Does the platform or host framework already solve the requirement correctly?
2. Does the owning package already depend on a suitable capability?
3. Is a small local implementation clearer and safer than ecosystem ownership?
4. If a dependency is justified, which package actually owns its runtime use?

Do not add a package for trivial formatting, collection access, or control flow. Prefer a maintained dependency when correctness, protocol complexity, security, or existing integration makes a local implementation riskier. Use the abstraction test in [clean code](clean-code.md) before introducing a wrapper.

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
