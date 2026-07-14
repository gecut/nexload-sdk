# Minor-unit contract

## Boundary

`moneyField` returns a Payload `number` field. Its value is always an integer count of the smallest configured currency unit at persistence and every server boundary:

- database and Payload document values;
- REST, GraphQL, and Local API;
- hooks and validation;
- fixtures, jobs, and integrations.

Only the Admin input and explicit `parseMoneyToMinorUnits(string, currency)` accept major-unit text. Never infer or auto-convert a numeric API value. The parser's runtime boundary is a string and calls `.trim()`; passing a number directly throws rather than rescaling it. Double scaling occurs only when a consumer first coerces an already-minor number to text and then misuses the parser.

## Scaling

For fraction digits `d`:

```text
minor = exact major digits * 10^d
major display = minor / 10^d
```

Parsing pads a shorter fraction and rejects a longer fraction. It never rounds. Result must be a JavaScript safe integer.

Built-in `IRR` and `IRT` both use zero fraction digits. Their storage scale factor is 1, but the contract still rejects decimal values and changes older decimal-capable APIs to integer-only.

## Input syntax

Parser behavior:

- trims surrounding whitespace;
- converts Persian and Arabic digits to Latin;
- removes `٬`, comma, and whitespace grouping;
- converts Arabic decimal `٫` to dot;
- accepts an optional leading minus;
- rejects plus, currency text, parentheses, leading-dot `.5`, trailing-dot `12.`, unsupported precision, and unsafe range.

`parseMoneyToMinorUnits` is a syntax/precision helper. It does not know field `allowNegative`, min, or max policy.

## No floating storage

Do not store floats and compensate with rounding later. Integer minor units make equality, bounds, and serialization deterministic within safe range.
