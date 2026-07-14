---
name: payload-fields-money
description: Use when adding, migrating, debugging, or reviewing @nexload-sdk/payload-fields money behavior, including integer minor-unit persistence and APIs, explicit major-unit parsing, IRR/IRT or custom currency fraction digits, Persian/Arabic numeric input, safe integers and precision, negative policy, min/max bounds, display formatting, consumer validation order, Admin behavior, or money data migration.
---

# Payload Money Fields

## Purpose

Keep all server and persistence boundaries exact in integer minor units while allowing explicit localized major-unit input at the Admin/UI boundary.

## Trigger boundary

- Use for `moneyField`, parse/format helpers, currency definitions, fraction digits, bounds, negative values, Admin input, and migration.
- Do not use for exchange rates, accounting/tax engines, generic non-Payload currency UI, slugs, or dates.
- Compose with `payload-fields-core` only for package-wide overrides, exports, or Import Map work.

## Source of truth

Use `src/money/index.ts`, Admin money field source, package tests, README, exports, and the consuming data/API contract. Stored production data must be inspected read-only before any migration write.

## Required inspection

Read money source/Admin component, tests, package README/export map, target field schema, existing stored values, REST/GraphQL/Local API clients, hooks, fixtures, and currency requirements.

## Decision flow

1. Define currency code/label/fraction digits and the exact minor-unit boundary.
2. Audit current stored/API units before changing the field.
3. Set negative/min/max policy in minor units.
4. Keep parsing explicit at string input boundaries only.
5. Test safe-integer, precision, localization, validation order, and migration samples.

## Implementation workflow

1. Write failing pure tests for parse/format and field validation boundaries.
2. Add `moneyField({ name, currency, ...policy })`; keep package type/component metadata.
3. Update every server/API consumer to send and receive minor-unit integers.
4. Design a separate exact data migration; do not auto-convert inside hooks.
5. Verify Admin valid/partial/empty/read-only behavior and package build/lint/test.

## Invariants

- Storage, hooks, validation, REST, GraphQL, and Local API use safe integer minor units.
- Only Admin input or explicit `parseMoneyToMinorUnits` accepts a major-unit string.
- Fraction digits define scaling and excess precision is rejected, not rounded.
- `allowNegative` defaults false; min/max remain authoritative when negatives are allowed.
- Bounds are safe minor-unit integers and min cannot exceed max.
- Package validation runs before consumer validation.
- Name, number type, Admin field path, and currency metadata remain package-owned.

## Security and edge cases

Reject unsafe integers, float storage, implicit/double conversion, conflicting native Payload min/max overrides, and unreviewed currency changes. `parseMoneyToMinorUnits` does not enforce `allowNegative`; field validation does. Partial invalid Admin text may temporarily be a string so server validation must remain authoritative.

## Verification

Run package build/lint/test. Cover Persian/Arabic digits and separators, custom fractional currency, padding/excess precision, unsafe range, null/required, allowNegative, min/max equality and inversion, consumer validator order, protected overrides, display options, and representative migration round trips.

## Reference routing

- Read [minor-unit contract](references/minor-unit-contract.md) before touching storage or APIs.
- Read [currency and validation](references/currency-and-validation.md) for parsing, formatting, bounds, and hook order.
- Read [migration and testing](references/migration-and-testing.md) before changing existing data.

## Handoff requirements

State currency/fraction digits, input and server units, negative/bounds policy, validation order, migration formula/sample counts, API consumers updated, tests run, and any production write awaiting explicit approval.
