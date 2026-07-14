# Migration and testing

## Migration workflow

1. Inspect current stored values and every producer/consumer read-only.
2. Confirm whether values are major, minor, mixed, rounded, or nullable.
3. Define exact conversion using currency fraction digits.
4. Reject values that cannot convert exactly or exceed safe integer range.
5. Update schema, APIs, hooks, fixtures, jobs, and clients in one rollout plan.
6. Run a dry-run report with counts/samples before requesting approval for production writes.

No automatic migration ships with the factory. Do not write production data without explicit authorization.

Avoid double conversion: already-minor integers must not be parsed/scaled again. Store migration version/evidence outside the field hook rather than guessing per request.

## Pure tests

- Persian and Arabic digits/group/decimal separators;
- custom fraction padding and excess precision;
- negative syntax versus field negative policy;
- unsafe integer rejection and malformed forms;
- format locale/digits/grouping/currency toggles;
- invalid currency definition.

## Field tests

- optional and required empty values;
- safe integer versus float/NaN/unsafe;
- negative allowed/denied;
- exact min/max boundaries and inverted config;
- consumer validator called only after package checks;
- protected name/type/component/metadata;
- Admin valid, partial, blank, and read-only states.

## Migration tests

Use representative snapshots and round-trip expected values. Assert counts for converted, unchanged, null, rejected precision, unsafe, and ambiguous records. Verify REST, GraphQL, and Local API examples all use minor integers.
