# Clean code and readability

Use these principles to make intent and ownership apparent without arbitrary metrics. Prettier owns mechanical formatting; this reference owns intentional grouping.

## Names

Choose domain terms that reveal intent. Use camelCase for variables, parameters, and functions; value names describe domain entities or quantities. Functions and asynchronous operations use accurate verbs such as `parse`, `resolve`, `load`, or `save`; booleans read as predicates (`isReady`, `hasAccess`, `shouldRetry`). Types and interfaces use PascalCase, constants use the repository's established convention, and filename details belong to [module ownership](module-state-abstractions.md). A constant name should communicate policy or units; `const` alone does not require UPPER_SNAKE_CASE. Use an `Async` suffix only to distinguish a real synchronous counterpart or honor an existing API convention. Avoid unexplained abbreviations, misleading type names, redundant context prefixes, and names that claim more than the value guarantees.

## Functions

A function should have one cohesive responsibility, a clear abstraction level, predictable return behavior, and visible side effects. Prefer guard clauses and a readable happy path. Group related parameters in an object when the set is large, optional, or evolving; do not create a parameter object merely to hide a small stable signature. Extract when it improves comprehension, ownership, or real reuse—not to satisfy a line count. Avoid deep nesting, dense boolean expressions, long chains of shallow wrappers, and mixing command and query behavior without a clear contract.

## Pragmatic DRY

Keep separate code separate when it only looks similar but has different reasons to change. Extract duplication when implementations share a responsibility, policy, invariant, lifecycle, integration boundary, or current behavior family. An abstraction must remove a real cost; hypothetical reuse, a renamed wrapper, and a generic utilities layer are not sufficient.

## Semantic whitespace and visual hierarchy

Use one blank line between distinct statement groups: input preparation, validation, transformation, mutation, external effects, and result construction. Keep consecutive declarations for one operation together. Separate independent decisions when the separation clarifies them, but keep `if/else`, `try/catch/finally`, and other connected constructs intact. A final return should normally be separated when it marks the conclusion of a meaningful phase; trivial functions need no artificial spacing. Use a single blank line, never multiple consecutive blank lines or spacing inside expressions merely to satisfy this guidance.

Readable grouping:

```ts
const input = normalizeInput(rawInput);
const config = resolveConfig(options);

if (!isValidInput(input)) {
  return null;
}

const result = transformInput(input, config);

return result;
```

Avoid dense, visually flat code:

```ts
const input = normalizeInput(rawInput);
const config = resolveConfig(options);
if (!isValidInput(input)) {
  return null;
}
const result = transformInput(input, config);
return result;
```

Do not insert a blank line between tightly related declarations, or between a condition and its connected branch. Keep comments adjacent to the code they explain; comments record rationale or constraints, while names and structure should express ordinary intent.

Keep a coherent algorithm local even when it spans more than 20 lines. Extract a meaningful policy such as `canRetryResponse` when it removes duplicated retry decisions; do not wrap each status comparison in another helper. Name complicated boolean predicates when that improves understanding, but preserve short-circuit evaluation and effect order. Do not precompute effectful expressions merely to make a condition shorter.

## Comments and constants

Name literals that encode domain policy, units, protocol values, or repeated meaning; keep obvious one-use literals local. Comments explain rationale, constraints, compatibility, and non-obvious algorithms. Remove only commented-out code made obsolete by the requested change. Do not use comments to narrate unclear code that can be named or structured directly.

## Formatter boundary and enforcement

Apply grouping to code being written or deliberately refactored, not unrelated lines or files. Do not add spacing inside objects, arrays, or argument lists without a semantic reason. Do not move effectful statements to create visual groups.

[Prettier's statement printer](https://github.com/prettier/prettier/blob/main/src/language-js/print/statement-sequence.js) preserves an existing blank line between statements; it does not infer logical phases. Mechanical formatting and semantic grouping are distinct responsibilities.

The inspected `tools/eslint-config/src/base.ts` uses `@stylistic/eslint-plugin` and import-group spacing, but does not explicitly configure statement padding. Its stylistic presets/overrides follow `eslint-config-prettier`; the Next preset ends with that compatibility config. Report resulting formatter conflicts rather than silently changing shared tooling.

For a separately scoped tooling change, consider [`@stylistic/padding-line-between-statements`](https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/rules/padding-line-between-statements/README.md) with `{ blankLine: "always", prev: ["const", "let"], next: "if" }`. This is a narrow syntactic subset, not proof of semantic grouping. It leaves declaration-to-declaration spacing alone. Avoid blanket padding before every return or after every declaration; those force fragmentation in trivial functions. Validate the effective configuration on representative code before adoption. No shared lint change is required to apply this skill.

## Basis and deliberate adaptations

[Google Engineering Practices](https://google.github.io/eng-practices/review/reviewer/looking-for.html) informs the focus on comprehension, current requirements, meaningful names, and scoped changes. The local Clean Code resource informs cohesion and vertical grouping. Its line-count rhetoric and try/catch-first prescription are not adopted; nor are universal dependency wrappers, null bans, one-export limits, or mandatory classes. Existing tooling owns mechanical naming/formatting rules; this standard explains intent and exceptions.
